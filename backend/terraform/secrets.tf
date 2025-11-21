# Data source to read existing secret from AWS Secrets Manager
# This secret should be created manually in AWS Console (see SECRETS_SETUP.md)
data "aws_secretsmanager_secret" "app_secrets" {
  # Name is now parameterized; default lives in variables.tf (app_secret_name)
  name = var.app_secret_name
}

data "aws_secretsmanager_secret_version" "app_secrets" {
  secret_id = data.aws_secretsmanager_secret.app_secrets.id
}
