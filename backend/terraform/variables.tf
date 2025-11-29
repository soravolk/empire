variable "aws_profile" {
  description = "AWS CLI profile to use"
  type        = string
  default     = "default"
}

variable "aws_region" {
  description = "AWS region to deploy resources"
  type        = string
  default     = "eu-west-1"
}

variable "app_name" {
  description = "Application name"
  type        = string
  default     = "empire"
}

variable "environment" {
  description = "Environment name (dev, staging, production)"
  type        = string
}

variable "frontend_url" {
  description = "Frontend URL for CORS"
  type        = string
}

variable "cors_allowed_origins" {
  description = "List of allowed origins for CORS"
  type        = list(string)
}

variable "lambda_timeout" {
  description = "Lambda function timeout in seconds"
  type        = number
  default     = 30
}

variable "lambda_memory_size" {
  description = "Lambda function memory size in MB"
  type        = number
  default     = 512
}

variable "log_retention_days" {
  description = "CloudWatch logs retention in days"
  type        = number
  default     = 30
}

variable "enable_vpc" {
  description = "Enable VPC configuration for Lambda"
  type        = bool
  default     = false
}

variable "subnet_ids" {
  description = "Subnet IDs for Lambda VPC configuration"
  type        = list(string)
  default     = []
}

variable "security_group_ids" {
  description = "Security group IDs for Lambda VPC configuration"
  type        = list(string)
  default     = []
}

# NAT Gateway (optional) to allow Internet egress from private subnets
variable "enable_nat" {
  description = "Create a NAT Gateway for private subnets Internet egress"
  type        = bool
  default     = false
}

variable "public_subnet_id" {
  description = "Public subnet ID where the NAT Gateway will be created"
  type        = string
  default     = ""
}

variable "private_route_table_ids" {
  description = "List of private route table IDs to add a 0.0.0.0/0 route via the NAT Gateway"
  type        = list(string)
  default     = []
}

variable "ssm_params" {
  description = "Map of logical keys to SSM parameter names (SecureString/String). Keys: DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME, GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, JWT_SECRET, BACKEND_URL"
  type        = map(string)
}

variable "tags" {
  description = "Common tags for all resources"
  type        = map(string)
  default = {
    Project   = "Empire"
    ManagedBy = "Terraform"
  }
}