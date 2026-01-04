output "api_endpoint" {
  description = "Main API Lambda Function URL endpoint"
  value       = aws_lambda_function_url.api.function_url
}

output "api_lambda_function_name" {
  description = "Main API Lambda function name"
  value       = aws_lambda_function.api.function_name
}

output "api_cloudwatch_log_group" {
  description = "Main API Lambda CloudWatch log group name"
  value       = aws_cloudwatch_log_group.lambda_logs.name
}

output "auth_endpoint" {
  description = "Public Auth Lambda Function URL endpoint"
  value       = aws_lambda_function_url.auth.function_url
}

output "auth_lambda_function_name" {
  description = "Auth Lambda function name"
  value       = aws_lambda_function.auth.function_name
}

output "lambda_security_group_id" {
  description = "Managed Lambda security group ID (created by this module)"
  value       = var.enable_vpc ? aws_security_group.lambda[0].id : ""
}

output "lambda_attached_security_group_ids" {
  description = "All security groups attached to the Lambda (managed + provided)"
  value       = var.enable_vpc ? concat([aws_security_group.lambda[0].id], var.security_group_ids) : []
}

# DynamoDB Outputs
output "goals_table_name" {
  description = "DynamoDB goals table name"
  value       = aws_dynamodb_table.goals.name
}

output "goals_table_arn" {
  description = "DynamoDB goals table ARN"
  value       = aws_dynamodb_table.goals.arn
}

output "goals_table_stream_arn" {
  description = "DynamoDB goals table stream ARN"
  value       = try(aws_dynamodb_table.goals.stream_arn, "")
}