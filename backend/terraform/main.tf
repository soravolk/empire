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
locals {
  app_secret_json = try(jsondecode(data.aws_secretsmanager_secret_version.app_secrets.secret_string), {})

  lambda_env_vars_base = {
    NODE_ENV       = "production"
    FRONTEND_URL   = var.frontend_url
    SECRET_NAME    = data.aws_secretsmanager_secret.app_secrets.name
    PG_SECRET_NAME = var.pg_secret_name
  }

  lambda_env_vars = merge(
    local.lambda_env_vars_base,
    try(local.app_secret_json.GOOGLE_CLIENT_ID, null)     != null ? { GOOGLE_CLIENT_ID     = local.app_secret_json.GOOGLE_CLIENT_ID }     : {},
    try(local.app_secret_json.GOOGLE_CLIENT_SECRET, null) != null ? { GOOGLE_CLIENT_SECRET = local.app_secret_json.GOOGLE_CLIENT_SECRET } : {},
    try(local.app_secret_json.SESSION_SECRET, null)       != null ? { SESSION_SECRET       = local.app_secret_json.SESSION_SECRET }       : {},
    try(local.app_secret_json.JWT_SECRET, null)           != null ? { JWT_SECRET           = local.app_secret_json.JWT_SECRET }           : {}
  )
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
