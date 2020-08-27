variable "aws_access_key" {}
variable "aws_secret_key" {}

# save terraform status on S3
terraform {
  backend "s3" {
    bucket = "tranque-terraform-state"
    key    = "generic-qa/__REPLACED_TARGET_HOST__/terraform.tfstate"
    region = "us-east-1"
  }
}

# aws credentials
provider "aws" {
  access_key = "${var.aws_access_key}"
  secret_key = "${var.aws_secret_key}"
  region     = "us-west-1"
}

# security group "tranque-qa"
resource "aws_security_group" "tranque-qa" {
  name        = "tranque-qa"
  description = "tranque-qa"

  ingress {
    from_port        = 80
    to_port          = 80
    protocol         = "tcp"
    cidr_blocks      = ["0.0.0.0/0"]
  }

  ingress {
    from_port        = 443
    to_port          = 443
    protocol         = "tcp"
    cidr_blocks      = ["0.0.0.0/0"]
  }

  ingress {
    from_port        = 5672
    to_port          = 5672
    protocol         = "tcp"
    cidr_blocks      = ["0.0.0.0/0"]
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

  ingress {
    from_port        = 9000
    to_port          = 9000
    protocol         = "tcp"
    cidr_blocks      = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

# ec2 instance
resource "aws_instance" "qa-instance" {
  ami               = "ami-0f56279347d2fa43e"
  instance_type     = "t2.xlarge"
  availability_zone = "us-west-1a"
  key_name          = "tranque-dev-us-west-1"
  security_groups   = ["${aws_security_group.tranque-qa.name}", "default"]
  user_data         = "${file("docker-stacks/generic-qa/terraform/install_dependencies.sh")}"

  root_block_device {
    volume_size = "32"
  }

  tags {
    Name = "__REPLACED_TARGET_HOST__"
    Role = "__REPLACED_TARGET_HOST__"
  }
}

# DNS zone
data "aws_route53_zone" "observatorioderelaves-cl" {
  name = "observatorioderelaves.cl."
}

# A record for target_host
resource "aws_route53_record" "qa-record" {
  zone_id = "${data.aws_route53_zone.observatorioderelaves-cl.zone_id}"
  name    = "__REPLACED_TARGET_HOST__"
  type    = "A"
  ttl     = "60"
  records = ["${aws_instance.qa-instance.public_ip}"]
}
