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

  tags = {
    Name        = "goals-local"
    Environment = "local"
    ManagedBy   = "Terraform"
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
