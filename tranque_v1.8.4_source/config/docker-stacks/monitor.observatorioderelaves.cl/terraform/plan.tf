variable "aws_access_key" {}
variable "aws_secret_key" {}

# save terraform status on S3
terraform {
  backend "s3" {
    bucket = "tranque-terraform-state"
    key    = "monitor.observatorioderelaves.cl/terraform.tfstate"
    region = "us-east-1"
  }
}

# aws credentials
provider "aws" {
  access_key = "${var.aws_access_key}"
  secret_key = "${var.aws_secret_key}"
  region     = "us-west-1"
}

# security group "tranque-monitor"
resource "aws_security_group" "tranque-monitor" {
  name        = "tranque-monitor"
  description = "tranque-monitor"

  # MLP:    200.72.249.0/24
  # Inria:  146.83.70.0/27
  # FCH:    190.98.245.0/24
  ingress {
    from_port        = 80
    to_port          = 80
    protocol         = "tcp"
    cidr_blocks      = ["200.72.249.0/24"
                        , "146.83.70.0/27"
                        , "190.98.245.0/24"]
  }

  # MLP:    200.72.249.0/24
  # Inria:  146.83.70.0/27
  # FCH:    190.98.245.0/24
  ingress {
    from_port        = 443
    to_port          = 443
    protocol         = "tcp"
    cidr_blocks      = ["200.72.249.0/24"
                        , "146.83.70.0/27"
                        , "190.98.245.0/24"]
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

# instance "tranque-monitor"
resource "aws_instance" "tranque-monitor" {
  ami               = "ami-01beb64058d271bc4"
  instance_type     = "c5.large"
  availability_zone = "us-west-1a"
  key_name          = "tranque-dev-us-west-1"
  security_groups   = ["${aws_security_group.tranque-monitor.name}", "default"]

  tags {
    Name = "tranque-monitor"
    Role = "tranque-monitor"
  }
}

# elastic IP for "tranque-monitor"
resource "aws_eip" "tranque-monitor_ip" {
  instance = "${aws_instance.tranque-monitor.id}"
}

# DNS names
data "aws_route53_zone" "observatorioderelaves-cl" {
  name = "observatorioderelaves.cl."
}

resource "aws_route53_record" "monitor-observatorioderelaves-cl" {
  zone_id = "${data.aws_route53_zone.observatorioderelaves-cl.zone_id}"
  name    = "monitor.${data.aws_route53_zone.observatorioderelaves-cl.name}"
  type    = "A"
  ttl     = "60"
  records = ["${aws_eip.tranque-monitor_ip.public_ip}"]
}

resource "aws_route53_record" "alerts-observatorioderelaves-cl" {
  zone_id = "${data.aws_route53_zone.observatorioderelaves-cl.zone_id}"
  name    = "alert.${data.aws_route53_zone.observatorioderelaves-cl.name}"
  type    = "A"
  ttl     = "60"
  records = ["${aws_eip.tranque-monitor_ip.public_ip}"]
}

resource "aws_route53_record" "prometheus-observatorioderelaves-cl" {
  zone_id = "${data.aws_route53_zone.observatorioderelaves-cl.zone_id}"
  name    = "prometheus.${data.aws_route53_zone.observatorioderelaves-cl.name}"
  type    = "A"
  ttl     = "60"
  records = ["${aws_eip.tranque-monitor_ip.public_ip}"]
}
