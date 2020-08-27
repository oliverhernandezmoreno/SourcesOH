# where to save Terraform state file
terraform {
  backend "s3" {
    bucket = "tranque-terraform-state"
    region = "us-east-1"
    key    = "gitlab-runner-bastion/terraform.tfstate"
  }
}
