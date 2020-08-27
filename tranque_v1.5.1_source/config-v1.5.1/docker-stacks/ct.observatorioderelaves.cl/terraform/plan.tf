variable "aws_access_key" {}
variable "aws_secret_key" {}
variable "aws_key_name" {
  type    = "string"
  default = "tranque-ct"
}

# save terraform status on S3
terraform {
  backend "s3" {
    bucket = "tranque-terraform-state-qa"
    key    = "ct.observatorioderelaves.cl/terraform.tfstate"
    region = "us-east-1"
  }
}

# aws credentials
provider "aws" {
  access_key = "${var.aws_access_key}"
  secret_key = "${var.aws_secret_key}"
  region     = "us-east-1"
}

# elastic IP for "tranque-ct-smc"
data "aws_eip" "tranque-ct-smc_ip" {
  tags = {
    Name = "tranque-ct-smc"
  }
}

# elastic IP for "tranque-ct-sml"
data "aws_eip" "tranque-ct-sml_ip" {
  tags = {
    Name = "tranque-ct-sml"
  }
}

# security group "tranque-ct-smc"
resource "aws_security_group" "tranque-ct-smc" {
  name        = "tranque-ct-smc"
  description = "tranque-ct-smc"

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
      "${data.aws_eip.tranque-ct-sml_ip.public_ip}/32"
    ]
  }

  # MinIO
  ingress {
    from_port   = 9000
    to_port     = 9000
    protocol    = "tcp"
    cidr_blocks = [
      "${data.aws_eip.tranque-ct-sml_ip.public_ip}/32"
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

# security group "tranque-ct-sml"
resource "aws_security_group" "tranque-ct-sml" {
  name        = "tranque-ct-sml"
  description = "tranque-ct-sml"

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

# instance "tranque-ct-smc"
resource "aws_instance" "tranque-ct-smc" {
  ami               = "ami-013be31976ca2c322"
  instance_type     = "t2.large"
  availability_zone = "us-east-1a"
  key_name          = "${var.aws_key_name}"
  security_groups   = ["${aws_security_group.tranque-ct-smc.name}", "default"]

  root_block_device {
    volume_size = "16"
  }

  tags = {
    Name = "tranque-ct-smc"
    Role = "tranque-ct-smc"
  }
}

# instance "tranque-ct-sml"
resource "aws_instance" "tranque-ct-sml" {
  ami               = "ami-013be31976ca2c322"
  instance_type     = "t2.large"
  availability_zone = "us-east-1a"
  key_name          = "${var.aws_key_name}"
  security_groups   = ["${aws_security_group.tranque-ct-sml.name}", "default"]

  root_block_device {
    volume_size = "16"
  }

  tags = {
    Name = "tranque-ct-sml"
    Role = "tranque-ct-sml"
  }
}

# association for tranque-ct-smc
resource "aws_eip_association" "tranque-ct-smc_assoc" {
  instance_id   = "${aws_instance.tranque-ct-smc.id}"
  allocation_id = "${data.aws_eip.tranque-ct-smc_ip.id}"
}

# association for tranque-ct-sml
resource "aws_eip_association" "tranque-ct-sml_assoc" {
  instance_id   = "${aws_instance.tranque-ct-sml.id}"
  allocation_id = "${data.aws_eip.tranque-ct-sml_ip.id}"
}
