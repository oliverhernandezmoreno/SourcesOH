variable "aws_access_key" {}
variable "aws_secret_key" {}
variable "aws_key_name" {
  type    = "string"
  default = "tranque-emac-qa"
}

# save terraform status on S3
terraform {
  backend "s3" {
    bucket = "tranque-terraform-state-qa"
    key    = "emac-qa.observatorioderelaves.cl/terraform.tfstate"
    region = "us-east-1"
  }
}

# aws credentials
provider "aws" {
  access_key = "${var.aws_access_key}"
  secret_key = "${var.aws_secret_key}"
  region     = "us-east-2"
}

# elastic IP for "tranque-emac-qa"
data "aws_eip" "tranque-emac-qa_ip" {
  tags = {
    Name = "tranque-emac-qa"
  }
}

# security group "tranque-emac-qa"
resource "aws_security_group" "tranque-emac-qa" {
  name        = "tranque-emac-qa"
  description = "tranque-emac-qa"

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

# instance "tranque-emac-qa"
resource "aws_instance" "tranque-emac-qa" {
  ami               = "ami-0350c5670171b5391"
  instance_type     = "t2.xlarge"
  availability_zone = "us-east-2a"
  key_name          = "${var.aws_key_name}"
  security_groups   = ["${aws_security_group.tranque-emac-qa.name}", "default"]

  root_block_device {
    volume_size = "16"
  }

  tags = {
    Name = "tranque-emac-qa"
    Role = "tranque-emac-qa"
  }
}

# association for tranque-emac-qa
resource "aws_eip_association" "tranque-emac-qa_assoc" {
  instance_id   = "${aws_instance.tranque-emac-qa.id}"
  allocation_id = "${data.aws_eip.tranque-emac-qa_ip.id}"
}
