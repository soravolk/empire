# Local DynamoDB configuration for testing
# This configuration is separate from the main AWS deployment

terraform {
  required_version = ">= 1.0"
  
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

# Override provider for local DynamoDB testing
provider "aws" {
  region                      = "eu-west-1"
  access_key                  = "test"
  secret_key                  = "test"
  skip_credentials_validation = true
  skip_metadata_api_check     = true
  skip_requesting_account_id  = true

  endpoints {
    dynamodb = "http://localhost:8000"
  }
}

# Create the DynamoDB table for local testing
resource "aws_dynamodb_table" "goals_local" {
  name           = "goals"
  billing_mode   = "PAY_PER_REQUEST"
  hash_key       = "goal_id"

  attribute {
    name = "goal_id"
    type = "S"
  }
}

# Create the DynamoDB table for milestones (local testing)
resource "aws_dynamodb_table" "milestones_local" {
  name           = "milestones"
  billing_mode   = "PAY_PER_REQUEST"
  hash_key       = "milestone_id"

  attribute {
    name = "milestone_id"
    type = "S"
  }
}

# Create the DynamoDB table for tasks (local testing)
resource "aws_dynamodb_table" "tasks_local" {
  name           = "tasks"
  billing_mode   = "PAY_PER_REQUEST"
  hash_key       = "task_id"

  attribute {
    name = "task_id"
    type = "S"
  }
}

resource "aws_dynamodb_table" "users_local" {
  name           = "users"
  billing_mode   = "PAY_PER_REQUEST"
  hash_key       = "user_id"

  attribute {
    name = "user_id"
    type = "S"
  }
}


output "local_goals_table_name" {
  description = "Local DynamoDB goals table name"
  value       = aws_dynamodb_table.goals_local.name
}

output "local_goals_table_arn" {
  description = "Local DynamoDB goals table ARN"
  value       = aws_dynamodb_table.goals_local.arn
}

output "local_milestones_table_name" {
  description = "Local DynamoDB milestones table name"
  value       = aws_dynamodb_table.milestones_local.name
}

output "local_milestones_table_arn" {
  description = "Local DynamoDB milestones table ARN"
  value       = aws_dynamodb_table.milestones_local.arn
}

output "local_tasks_table_name" {
  description = "Local DynamoDB tasks table name"
  value       = aws_dynamodb_table.tasks_local.name
}

output "local_tasks_table_arn" {
  description = "Local DynamoDB tasks table ARN"
  value       = aws_dynamodb_table.tasks_local.arn
}
