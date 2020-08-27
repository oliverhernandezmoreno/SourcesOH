variable "aws_access_key" {}
variable "aws_secret_key" {}

# save terraform status on S3
terraform {
  backend "s3" {
    bucket = "tranque-terraform-state"
    key    = "status.observatorioderelaves.cl/terraform.tfstate"
    region = "us-east-1"
  }
}

# aws credentials
provider "aws" {
  access_key = "${var.aws_access_key}"
  secret_key = "${var.aws_secret_key}"
  region     = "us-west-1"
}

# security group "tranque-statuspage"
resource "aws_security_group" "tranque-statuspage" {
  name        = "tranque-statuspage"
  description = "tranque-statuspage"

  ingress {
    from_port        = 80
    to_port          = 80
    protocol         = "tcp"
    cidr_blocks      = ["0.0.0.0/0"]
    ipv6_cidr_blocks = ["::/0"]
  }

  ingress {
    from_port        = 443
    to_port          = 443
    protocol         = "tcp"
    cidr_blocks      = ["0.0.0.0/0"]
    ipv6_cidr_blocks = ["::/0"]
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

# instance "tranque-statuspage"
resource "aws_instance" "tranque-statuspage" {
  ami               = "ami-01beb64058d271bc4"
  instance_type     = "t3.micro"
  availability_zone = "us-west-1a"
  key_name          = "tranque-dev-us-west-1"
  security_groups   = ["${aws_security_group.tranque-statuspage.name}", "default"]

  tags {
    Name = "tranque-statuspage"
    Role = "tranque-statuspage"
  }
}

# elastic IP for "tranque-statuspage"
resource "aws_eip" "tranque-statuspage_ip" {
  instance = "${aws_instance.tranque-statuspage.id}"
}

# DNS names for "tranque-statuspage" and "backend-dev-manager-2"
data "aws_route53_zone" "observatorioderelaves-cl" {
  name = "observatorioderelaves.cl."
}

resource "aws_route53_record" "status-observatorioderelaves-cl" {
  zone_id = "${data.aws_route53_zone.observatorioderelaves-cl.zone_id}"
  name    = "status.${data.aws_route53_zone.observatorioderelaves-cl.name}"
  type    = "A"
  ttl     = "60"
  records = ["${aws_eip.tranque-statuspage_ip.public_ip}"]
}
