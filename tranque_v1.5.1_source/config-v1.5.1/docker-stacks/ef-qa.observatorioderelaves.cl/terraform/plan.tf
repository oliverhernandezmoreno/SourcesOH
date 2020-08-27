variable "aws_access_key" {}
variable "aws_secret_key" {}
variable "aws_key_name" {
  type    = "string"
  default = "tranque-ef-qa"
}

# save terraform status on S3
terraform {
  backend "s3" {
    bucket = "tranque-terraform-state-qa"
    key    = "ef-qa.observatorioderelaves.cl/terraform.tfstate"
    region = "us-east-1"
  }
}

# aws credentials
provider "aws" {
  access_key = "${var.aws_access_key}"
  secret_key = "${var.aws_secret_key}"
  region     = "us-east-2"
}

# elastic IP for "tranque-ef-qa"
data "aws_eip" "tranque-ef-qa_ip" {
  tags = {
    Name = "tranque-ef-qa"
  }
}

# security group "tranque-ef-qa"
resource "aws_security_group" "tranque-ef-qa" {
  name        = "tranque-ef-qa"
  description = "tranque-ef-qa"

  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    from_port = 0
    to_port   = 0
    protocol  = "-1"
    self      = true
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

# instance "tranque-ef-qa"
resource "aws_instance" "tranque-ef-qa" {
  ami               = "ami-0350c5670171b5391"
  instance_type     = "t2.large"
  availability_zone = "us-east-2a"
  key_name          = "${var.aws_key_name}"
  security_groups   = ["${aws_security_group.tranque-ef-qa.name}", "default"]

  root_block_device {
    volume_size = "16"
  }

  tags = {
    Name = "tranque-ef-qa"
    Role = "tranque-ef-qa"
  }
}

# association for tranque-ct-smc
resource "aws_eip_association" "tranque-ef-qa_assoc" {
  instance_id   = "${aws_instance.tranque-ef-qa.id}"
  allocation_id = "${data.aws_eip.tranque-ef-qa_ip.id}"
}
