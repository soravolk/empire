terraform {
  required_version = ">= 1.0"
  
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region  = var.aws_region
  profile = var.aws_profile
}

# Decode application secret JSON so we can surface selected keys as Lambda env vars
data "aws_ssm_parameter" "params" {
  for_each        = var.ssm_params
  name            = each.value
  with_decryption = true
}

locals {
  # Helper to safely read an SSM value by logical key
  ssm = {
    for k, v in data.aws_ssm_parameter.params : k => v.value
  }

  lambda_env_vars = {
    NODE_ENV     = "production"
    FRONTEND_URL = var.frontend_url
    # Database (mapped to PG_* expected by code)
    PG_HOST      = try(local.ssm.DB_HOST, "")
    PG_PORT      = try(local.ssm.DB_PORT, "5432")
    PG_USER      = try(local.ssm.DB_USER, "")
    PG_PASSWORD  = try(local.ssm.DB_PASSWORD, "")
    PG_DATABASE  = try(local.ssm.DB_NAME, "")
    # App secrets
    GOOGLE_CLIENT_ID     = try(local.ssm.GOOGLE_CLIENT_ID, "")
    GOOGLE_CLIENT_SECRET = try(local.ssm.GOOGLE_CLIENT_SECRET, "")
    JWT_SECRET           = try(local.ssm.JWT_SECRET, "")
    BACKEND_URL          = try(local.ssm.BACKEND_URL, var.frontend_url)
  }
}

# Data source to get current AWS account ID
data "aws_caller_identity" "current" {}

# Use pre-built lambda.zip (created by build-lambda.sh)
# This includes both compiled code and node_modules
data "local_file" "lambda_zip" {
  filename = "${path.module}/lambda.zip"
}

# IAM role for Lambda
resource "aws_iam_role" "lambda_role" {
  name = "${var.app_name}-${var.environment}-lambda-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "lambda.amazonaws.com"
        }
      }
    ]
  })

  tags = var.tags
}

# Attach basic Lambda execution policy
resource "aws_iam_role_policy_attachment" "lambda_basic_execution" {
  role       = aws_iam_role.lambda_role.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

# Additional policy for VPC access (if needed for RDS)
resource "aws_iam_role_policy_attachment" "lambda_vpc_execution" {
  count      = var.enable_vpc ? 1 : 0
  role       = aws_iam_role.lambda_role.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaVPCAccessExecutionRole"
}

# IAM policy for Lambda to access DynamoDB
resource "aws_iam_role_policy" "lambda_dynamodb_policy" {
  name   = "${var.app_name}-${var.environment}-lambda-dynamodb-policy"
  role   = aws_iam_role.lambda_role.id
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "dynamodb:GetItem",
          "dynamodb:PutItem",
          "dynamodb:UpdateItem",
          "dynamodb:DeleteItem",
          "dynamodb:Query",
          "dynamodb:Scan",
          "dynamodb:BatchGetItem",
          "dynamodb:BatchWriteItem"
        ]
        Resource = [
          aws_dynamodb_table.goals.arn,
          "${aws_dynamodb_table.goals.arn}/index/*",
          aws_dynamodb_table.milestones.arn,
          "${aws_dynamodb_table.milestones.arn}/index/*",
          aws_dynamodb_table.tasks.arn,
          "${aws_dynamodb_table.tasks.arn}/index/*",
          aws_dynamodb_table.users.arn,
          "${aws_dynamodb_table.users.arn}/index/*",
          aws_dynamodb_table.routine_completions.arn,
          "${aws_dynamodb_table.routine_completions.arn}/index/*",
          aws_dynamodb_table.routine_time_entries.arn,
          "${aws_dynamodb_table.routine_time_entries.arn}/index/*"
        ]
      }
    ]
  })
}

# Lambda function
resource "aws_lambda_function" "api" {
  filename         = data.local_file.lambda_zip.filename
  function_name    = "${var.app_name}-${var.environment}-api"
  role            = aws_iam_role.lambda_role.arn
  handler         = "lambda.handler"
  source_code_hash = filebase64sha256(data.local_file.lambda_zip.filename)
  runtime         = "nodejs20.x"
  timeout         = var.lambda_timeout
  memory_size     = var.lambda_memory_size

  environment {
    variables = local.lambda_env_vars
  }

  vpc_config {
    subnet_ids         = var.subnet_ids
    # Attach the managed Lambda SG and any additional SGs provided via variables
    security_group_ids = var.enable_vpc ? concat([aws_security_group.lambda[0].id], var.security_group_ids) : []
  }

  tags = var.tags
}

# Public Auth Lambda (no VPC) - handles Google OAuth and issues JWTs
resource "aws_lambda_function" "auth" {
  filename         = data.local_file.lambda_zip.filename
  function_name    = "${var.app_name}-${var.environment}-auth"
  role             = aws_iam_role.lambda_role.arn
  handler          = "authLambda.handler"
  source_code_hash = filebase64sha256(data.local_file.lambda_zip.filename)
  runtime          = "nodejs20.x"
  timeout          = 15
  memory_size      = 256

  environment {
    variables = local.lambda_env_vars
  }

  tags = var.tags
}

# CloudWatch Log Group
resource "aws_cloudwatch_log_group" "lambda_logs" {
  name              = "/aws/lambda/${aws_lambda_function.api.function_name}"
  retention_in_days = var.log_retention_days

  tags = var.tags
}

# Lambda Function URL (replaces API Gateway)
resource "aws_lambda_function_url" "api" {
  function_name      = aws_lambda_function.api.function_name
  authorization_type = "NONE"

  cors {
    allow_credentials = true
    allow_origins     = var.cors_allowed_origins
    allow_methods     = ["*"]
    allow_headers     = ["*"]
    expose_headers    = ["keep-alive", "date"]
    max_age          = 86400
  }
}

resource "aws_lambda_function_url" "auth" {
  function_name      = aws_lambda_function.auth.function_name
  authorization_type = "NONE"

  cors {
    allow_credentials = true
    allow_origins     = var.cors_allowed_origins
    allow_methods     = ["*"]
    allow_headers     = ["*"]
    expose_headers    = ["keep-alive", "date"]
    max_age           = 86400
  }
}

# DynamoDB table for goals
resource "aws_dynamodb_table" "goals" {
  name           = "goals"
  billing_mode   = "PAY_PER_REQUEST"
  hash_key       = "goal_id"

  attribute {
    name = "goal_id"
    type = "S"
  }

  tags = merge(var.tags, {
    Name = "goals"
  })
}

# DynamoDB table for milestones
resource "aws_dynamodb_table" "milestones" {
  name           = "milestones"
  billing_mode   = "PAY_PER_REQUEST"
  hash_key       = "milestone_id"

  attribute {
    name = "milestone_id"
    type = "S"
  }

  tags = merge(var.tags, {
    Name = "milestones"
  })
}

resource "aws_dynamodb_table" "tasks" {
  name           = "tasks"
  billing_mode   = "PAY_PER_REQUEST"
  hash_key       = "task_id"

  attribute {
    name = "task_id"
    type = "S"
  }

  tags = merge(var.tags, {
    Name = "tasks"
  })
}

# DynamoDB table for users
resource "aws_dynamodb_table" "users" {
  name           = "users"
  billing_mode   = "PAY_PER_REQUEST"
  hash_key       = "user_id"

  attribute {
    name = "user_id"
    type = "S"
  }

  tags = merge(var.tags, {
    Name = "users"
  })
}

# DynamoDB table for routine completions (append-only events)
resource "aws_dynamodb_table" "routine_completions" {
  name         = "routine_completions"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "milestone_id"
  range_key    = "recorded_at"

  attribute {
    name = "milestone_id"
    type = "S"
  }

  attribute {
    name = "recorded_at"
    type = "N"
  }

  tags = merge(var.tags, {
    Name = "routine_completions"
  })
}

# DynamoDB table for routine time entries (append-only events)
resource "aws_dynamodb_table" "routine_time_entries" {
  name         = "routine_time_entries"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "milestone_id"
  range_key    = "recorded_at"

  attribute {
    name = "milestone_id"
    type = "S"
  }

  attribute {
    name = "recorded_at"
    type = "N"
  }

  tags = merge(var.tags, {
    Name = "routine_time_entries"
  })
}
