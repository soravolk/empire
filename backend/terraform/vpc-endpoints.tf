# VPC Endpoint for Secrets Manager
# This allows Lambda in private subnets to access Secrets Manager without NAT Gateway

resource "aws_vpc_endpoint" "secretsmanager" {
  count = var.enable_vpc ? 1 : 0
  
  vpc_id              = data.aws_vpc.main[0].id
  service_name        = "com.amazonaws.${var.aws_region}.secretsmanager"
  vpc_endpoint_type   = "Interface"
  subnet_ids          = var.subnet_ids
  security_group_ids  = [aws_security_group.vpc_endpoint[0].id]
  
  private_dns_enabled = true

  tags = merge(var.tags, {
    Name = "${var.app_name}-${var.environment}-secretsmanager-endpoint"
  })
}

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

# Security group for VPC endpoints
resource "aws_security_group" "vpc_endpoint" {
  count = var.enable_vpc ? 1 : 0
  
  name        = "${var.app_name}-${var.environment}-vpc-endpoint-sg"
  description = "Security group for VPC endpoints"
  vpc_id      = data.aws_vpc.main[0].id

  ingress {
    description     = "HTTPS from EC2 security group"
    from_port       = 443
    to_port         = 443
    protocol        = "tcp"
    security_groups = ["sg-07e7ada493a28cdc2"]
  }

  # Allow HTTPS traffic from the Lambda security group as well
  ingress {
    description     = "HTTPS from Lambda security group"
    from_port       = 443
    to_port         = 443
    protocol        = "tcp"
    security_groups = [aws_security_group.lambda[0].id]
  }

  egress {
    description = "Allow all outbound"
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = merge(var.tags, {
    Name = "${var.app_name}-${var.environment}-vpc-endpoint-sg"
  })
}
