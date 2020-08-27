variable "aws_access_key" {}
variable "aws_secret_key" {}
variable "aws_key_name" {
  type    = "string"
  default = "tranque-qa"
}
variable "allowed_segments" {
  type    = "list"
  default = [
    "200.72.249.0/24",   # MLP
    "146.83.70.0/27",    # Inria
    "190.98.245.0/24",   # FCh
    "190.98.205.162/32"  # SNGM
  ]
}

# save terraform status on S3
terraform {
  backend "s3" {
    bucket = "tranque-terraform-state-qa"
    key    = "qa.observatorioderelaves.cl/terraform.tfstate"
    region = "us-east-1"
  }
}

# aws credentials
provider "aws" {
  access_key = "${var.aws_access_key}"
  secret_key = "${var.aws_secret_key}"
  region     = "us-west-2"
}

# elastic IP for "tranque-qa-smc"
data "aws_eip" "tranque-qa-smc_ip" {
  tags = {
    Name = "tranque-qa-smc"
  }
}

# elastic IP for "tranque-qa-sml-1"
data "aws_eip" "tranque-qa-sml-1_ip" {
  tags = {
    Name = "tranque-qa-sml-1"
  }
}

# elastic IP for "tranque-qa-sml-2"
data "aws_eip" "tranque-qa-sml-2_ip" {
  tags = {
    Name = "tranque-qa-sml-2"
  }
}

# elastic IP for "tranque-qa-sml-3"
data "aws_eip" "tranque-qa-sml-3_ip" {
  tags = {
    Name = "tranque-qa-sml-3"
  }
}

# security group "tranque-qa-smc"
resource "aws_security_group" "tranque-qa-smc" {
  name        = "tranque-qa-smc"
  description = "tranque-qa-smc"

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

  # RabbitMQ management
  ingress {
    from_port   = 15671
    to_port     = 15672
    protocol    = "tcp"
    cidr_blocks = "${var.allowed_segments}"
  }

  # RabbitMQ
  ingress {
    from_port   = 5671
    to_port     = 5672
    protocol    = "tcp"
    cidr_blocks = [
      "${data.aws_eip.tranque-qa-sml-1_ip.public_ip}/32",
      "${data.aws_eip.tranque-qa-sml-2_ip.public_ip}/32",
      "${data.aws_eip.tranque-qa-sml-3_ip.public_ip}/32",
      "${var.allowed_segments}"
    ]
  }

  # MinIO
  ingress {
    from_port   = 9000
    to_port     = 9000
    protocol    = "tcp"
    cidr_blocks = [
      "${data.aws_eip.tranque-qa-sml-1_ip.public_ip}/32",
      "${data.aws_eip.tranque-qa-sml-2_ip.public_ip}/32",
      "${data.aws_eip.tranque-qa-sml-3_ip.public_ip}/32",
      "${var.allowed_segments}"
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

# security group "tranque-qa-sml"
resource "aws_security_group" "tranque-qa-sml" {
  name        = "tranque-qa-sml"
  description = "tranque-qa-sml"

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

  # MinIO
  ingress {
    from_port   = 9000
    to_port     = 9000
    protocol    = "tcp"
    cidr_blocks = "${var.allowed_segments}"
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

# instance "tranque-qa-smc"
resource "aws_instance" "tranque-qa-smc" {
  ami               = "ami-04b762b4289fba92b"
  instance_type     = "t2.large"
  availability_zone = "us-west-2c"
  key_name          = "${var.aws_key_name}"
  security_groups   = ["${aws_security_group.tranque-qa-smc.name}", "default"]

  root_block_device {
    volume_size = "16"
  }

  tags = {
    Name = "tranque-qa-smc"
    Role = "tranque-qa-smc"
  }
}

# instance "tranque-qa-sml-1"
resource "aws_instance" "tranque-qa-sml-1" {
  ami               = "ami-04b762b4289fba92b"
  instance_type     = "t2.large"
  availability_zone = "us-west-2c"
  key_name          = "${var.aws_key_name}"
  security_groups   = ["${aws_security_group.tranque-qa-sml.name}", "default"]

  root_block_device {
    volume_size = "16"
  }

  tags = {
    Name = "tranque-qa-sml-1"
    Role = "tranque-qa-sml-1"
  }
}

# instance "tranque-qa-sml-2"
resource "aws_instance" "tranque-qa-sml-2" {
  ami               = "ami-04b762b4289fba92b"
  instance_type     = "t2.large"
  availability_zone = "us-west-2c"
  key_name          = "${var.aws_key_name}"
  security_groups   = ["${aws_security_group.tranque-qa-sml.name}", "default"]

  root_block_device {
    volume_size = "16"
  }

  tags = {
    Name = "tranque-qa-sml-2"
    Role = "tranque-qa-sml-2"
  }
}

# instance "tranque-qa-sml-3"
resource "aws_instance" "tranque-qa-sml-3" {
  ami               = "ami-04b762b4289fba92b"
  instance_type     = "t2.large"
  availability_zone = "us-west-2c"
  key_name          = "${var.aws_key_name}"
  security_groups   = ["${aws_security_group.tranque-qa-sml.name}", "default"]

  root_block_device {
    volume_size = "16"
  }

  tags = {
    Name = "tranque-qa-sml-3"
    Role = "tranque-qa-sml-3"
  }
}

# association for tranque-qa-smc
resource "aws_eip_association" "tranque-qa-smc_assoc" {
  instance_id   = "${aws_instance.tranque-qa-smc.id}"
  allocation_id = "${data.aws_eip.tranque-qa-smc_ip.id}"
}

# association for tranque-qa-sml-1
resource "aws_eip_association" "tranque-qa-sml-1_assoc" {
  instance_id   = "${aws_instance.tranque-qa-sml-1.id}"
  allocation_id = "${data.aws_eip.tranque-qa-sml-1_ip.id}"
}

# association for tranque-qa-sml-2
resource "aws_eip_association" "tranque-qa-sml-2_assoc" {
  instance_id   = "${aws_instance.tranque-qa-sml-2.id}"
  allocation_id = "${data.aws_eip.tranque-qa-sml-2_ip.id}"
}

# association for tranque-qa-sml-3
resource "aws_eip_association" "tranque-qa-sml-3_assoc" {
  instance_id   = "${aws_instance.tranque-qa-sml-3.id}"
  allocation_id = "${data.aws_eip.tranque-qa-sml-3_ip.id}"
}
