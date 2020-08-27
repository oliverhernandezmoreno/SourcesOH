variable "aws_access_key" {}
variable "aws_secret_key" {}
variable "aws_key_name" {
  type    = "string"
  default = "tranque-dpais-qa"
}

# save terraform status on S3
terraform {
  backend "s3" {
    bucket = "tranque-terraform-state-qa"
    key    = "dpais-qa.observatorioderelaves.cl/terraform.tfstate"
    region = "us-east-1"
  }
}

# aws credentials
provider "aws" {
  access_key = "${var.aws_access_key}"
  secret_key = "${var.aws_secret_key}"
  region     = "us-east-2"
}

# elastic IP for "tranque-dpais-qa-smc"
data "aws_eip" "tranque-dpais-qa-smc_ip" {
  tags = {
    Name = "tranque-dpais-qa-smc"
  }
}

# elastic IP for "tranque-dpais-qa-sml"
data "aws_eip" "tranque-dpais-qa-sml_ip" {
  tags = {
    Name = "tranque-dpais-qa-sml"
  }
}

# To-be-disconnected SML doesn't require an EIP

# security group "tranque-dpais-qa-smc"
resource "aws_security_group" "tranque-dpais-qa-smc" {
  name        = "tranque-dpais-qa-smc"
  description = "tranque-dpais-qa-smc"

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

  # RabbitMQ
  ingress {
    from_port   = 5671
    to_port     = 5672
    protocol    = "tcp"
    cidr_blocks = [
      "${data.aws_eip.tranque-dpais-qa-sml_ip.public_ip}/32",
      "${aws_instance.tranque-dpais-qa-sml-disconnected.public_ip}/32"
    ]
  }

  # MinIO
  ingress {
    from_port   = 9000
    to_port     = 9000
    protocol    = "tcp"
    cidr_blocks = [
      "${data.aws_eip.tranque-dpais-qa-sml_ip.public_ip}/32",
      "${aws_instance.tranque-dpais-qa-sml-disconnected.public_ip}/32"
    ]
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

# security group "tranque-dpais-qa-sml"
resource "aws_security_group" "tranque-dpais-qa-sml" {
  name        = "tranque-dpais-qa-sml"
  description = "tranque-dpais-qa-sml"

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

# instance "tranque-dpais-qa-smc"
resource "aws_instance" "tranque-dpais-qa-smc" {
  ami               = "ami-0350c5670171b5391"
  instance_type     = "t2.large"
  availability_zone = "us-east-2a"
  key_name          = "${var.aws_key_name}"
  security_groups   = ["${aws_security_group.tranque-dpais-qa-smc.name}", "default"]

  root_block_device {
    volume_size = "16"
  }

  tags = {
    Name = "tranque-dpais-qa-smc"
    Role = "tranque-dpais-qa-smc"
  }
}

# instance "tranque-dpais-qa-sml"
resource "aws_instance" "tranque-dpais-qa-sml" {
  ami               = "ami-0350c5670171b5391"
  instance_type     = "t2.large"
  availability_zone = "us-east-2a"
  key_name          = "${var.aws_key_name}"
  security_groups   = ["${aws_security_group.tranque-dpais-qa-sml.name}", "default"]

  root_block_device {
    volume_size = "16"
  }

  tags = {
    Name = "tranque-dpais-qa-sml"
    Role = "tranque-dpais-qa-sml"
  }
}

# instance "tranque-dpais-qa-sml-disconnected"
resource "aws_instance" "tranque-dpais-qa-sml-disconnected" {
  ami               = "ami-0350c5670171b5391"
  instance_type     = "t2.large"
  availability_zone = "us-east-2a"
  key_name          = "${var.aws_key_name}"
  security_groups   = ["${aws_security_group.tranque-dpais-qa-sml.name}", "default"]

  root_block_device {
    volume_size = "16"
  }

  tags = {
    Name = "tranque-dpais-qa-sml-disconnected"
    Role = "tranque-dpais-qa-sml-disconnected"
  }
}

# association for tranque-dpais-qa-smc
resource "aws_eip_association" "tranque-dpais-qa-smc_assoc" {
  instance_id   = "${aws_instance.tranque-dpais-qa-smc.id}"
  allocation_id = "${data.aws_eip.tranque-dpais-qa-smc_ip.id}"
}

# association for tranque-dpais-qa-sml
resource "aws_eip_association" "tranque-dpais-qa-sml_assoc" {
  instance_id   = "${aws_instance.tranque-dpais-qa-sml.id}"
  allocation_id = "${data.aws_eip.tranque-dpais-qa-sml_ip.id}"
}
