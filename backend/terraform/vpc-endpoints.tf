
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