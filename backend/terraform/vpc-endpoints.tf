
# Data source to get VPC information
data "aws_vpc" "main" {
  count = var.enable_vpc ? 1 : 0
  
  filter {
    name   = "vpc-id"
    values = [data.aws_subnet.selected[0].vpc_id]
  }
}

data "aws_subnet" "selected" {
  count = var.enable_vpc ? 1 : 0
  id    = var.subnet_ids[0]
}

# Security group for Lambda function
resource "aws_security_group" "lambda" {
  count = var.enable_vpc ? 1 : 0
  
  name        = "${var.app_name}-${var.environment}-lambda-sg"
  description = "Security group for Lambda function - allows access to RDS and VPC endpoints"
  vpc_id      = data.aws_vpc.main[0].id

  # Allow all outbound traffic (to RDS, VPC endpoints, etc.)
  egress {
    description = "Allow all outbound traffic"
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = merge(var.tags, {
    Name = "${var.app_name}-${var.environment}-lambda-sg"
  })
}

# DynamoDB VPC Gateway Endpoint (no cost)
resource "aws_vpc_endpoint" "dynamodb" {
  count = var.enable_vpc ? 1 : 0
  
  vpc_id       = data.aws_vpc.main[0].id
  service_name = "com.amazonaws.${data.aws_region.current.name}.dynamodb"
  
  vpc_endpoint_type = "Gateway"
  
  # Associate with route tables automatically
  route_table_ids = var.enable_vpc ? data.aws_route_tables.vpc_route_tables[0].ids : []
  
  tags = merge(var.tags, {
    Name = "${var.app_name}-${var.environment}-dynamodb-endpoint"
  })
}

# Get current AWS region
data "aws_region" "current" {}

# Get all route tables in the VPC
data "aws_route_tables" "vpc_route_tables" {
  count = var.enable_vpc ? 1 : 0
  
  vpc_id = data.aws_vpc.main[0].id
}