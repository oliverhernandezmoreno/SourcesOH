variable "aws_access_key" {}
variable "aws_secret_key" {}
variable "aws_key_name" {
  type    = "string"
  default = "tranque-dev-us-west-2"
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
    bucket = "tranque-terraform-state"
    key    = "staging.observatorioderelaves.cl/terraform.tfstate"
    region = "us-east-1"
  }
}

# aws credentials
provider "aws" {
  access_key = "${var.aws_access_key}"
  secret_key = "${var.aws_secret_key}"
  region     = "us-west-2"
}

# elastic IP for "tranque-staging-smc"
resource "aws_eip" "tranque-staging-smc_ip" {
  instance = "${aws_instance.tranque-staging-smc.id}"
}

# elastic IP for "tranque-staging-sml-1"
resource "aws_eip" "tranque-staging-sml-1_ip" {
  instance = "${aws_instance.tranque-staging-sml-1.id}"
}

# elastic IP for "tranque-staging-sml-2"
resource "aws_eip" "tranque-staging-sml-2_ip" {
  instance = "${aws_instance.tranque-staging-sml-2.id}"
}

# elastic IP for "tranque-staging-sml-3"
resource "aws_eip" "tranque-staging-sml-3_ip" {
  instance = "${aws_instance.tranque-staging-sml-3.id}"
}

# security group "tranque-staging-smc"
resource "aws_security_group" "tranque-staging-smc" {
  name        = "tranque-staging-smc"
  description = "tranque-staging-smc"

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
      "${aws_eip.tranque-staging-sml-1_ip.public_ip}/32",
      "${aws_eip.tranque-staging-sml-2_ip.public_ip}/32",
      "${aws_eip.tranque-staging-sml-3_ip.public_ip}/32",
      "${var.allowed_segments}"
    ]
  }

  # MinIO
  ingress {
    from_port   = 9000
    to_port     = 9000
    protocol    = "tcp"
    cidr_blocks = [
      "${aws_eip.tranque-staging-sml-1_ip.public_ip}/32",
      "${aws_eip.tranque-staging-sml-2_ip.public_ip}/32",
      "${aws_eip.tranque-staging-sml-3_ip.public_ip}/32",
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

# security group "tranque-staging-sml"
resource "aws_security_group" "tranque-staging-sml" {
  name        = "tranque-staging-sml"
  description = "tranque-staging-sml"

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

# instance "tranque-staging-smc"
resource "aws_instance" "tranque-staging-smc" {
  ami               = "ami-04b762b4289fba92b"
  instance_type     = "t2.large"
  availability_zone = "us-west-2c"
  key_name          = "${var.aws_key_name}"
  security_groups   = ["${aws_security_group.tranque-staging-smc.name}", "default"]

  root_block_device {
    volume_size = "16"
  }

  tags = {
    Name = "tranque-staging-smc"
    Role = "tranque-staging-smc"
  }
}

# instance "tranque-staging-sml-1"
resource "aws_instance" "tranque-staging-sml-1" {
  ami               = "ami-04b762b4289fba92b"
  instance_type     = "t2.large"
  availability_zone = "us-west-2c"
  key_name          = "${var.aws_key_name}"
  security_groups   = ["${aws_security_group.tranque-staging-sml.name}", "default"]

  root_block_device {
    volume_size = "16"
  }

  tags = {
    Name = "tranque-staging-sml-1"
    Role = "tranque-staging-sml-1"
  }
}

# instance "tranque-staging-sml-2"
resource "aws_instance" "tranque-staging-sml-2" {
  ami               = "ami-04b762b4289fba92b"
  instance_type     = "t2.large"
  availability_zone = "us-west-2c"
  key_name          = "${var.aws_key_name}"
  security_groups   = ["${aws_security_group.tranque-staging-sml.name}", "default"]

  root_block_device {
    volume_size = "16"
  }

  tags = {
    Name = "tranque-staging-sml-2"
    Role = "tranque-staging-sml-2"
  }
}

# instance "tranque-staging-sml-3"
resource "aws_instance" "tranque-staging-sml-3" {
  ami               = "ami-04b762b4289fba92b"
  instance_type     = "t2.large"
  availability_zone = "us-west-2c"
  key_name          = "${var.aws_key_name}"
  security_groups   = ["${aws_security_group.tranque-staging-sml.name}", "default"]

  root_block_device {
    volume_size = "16"
  }

  tags = {
    Name = "tranque-staging-sml-3"
    Role = "tranque-staging-sml-3"
  }
}

# DNS names
data "aws_route53_zone" "observatorioderelaves-cl" {
  name = "observatorioderelaves.cl."
}

# A record for staging-smc.observatorioderelaves.cl
resource "aws_route53_record" "staging-smc-observatorioderelaves-cl" {
  zone_id = "${data.aws_route53_zone.observatorioderelaves-cl.zone_id}"
  name    = "staging-smc.${data.aws_route53_zone.observatorioderelaves-cl.name}"
  type    = "A"
  ttl     = "60"
  records = ["${aws_eip.tranque-staging-smc_ip.public_ip}"]
}

# A record for staging-sml-1.observatorioderelaves.cl
resource "aws_route53_record" "staging-sml-1-observatorioderelaves-cl" {
  zone_id = "${data.aws_route53_zone.observatorioderelaves-cl.zone_id}"
  name    = "staging-sml-1.${data.aws_route53_zone.observatorioderelaves-cl.name}"
  type    = "A"
  ttl     = "60"
  records = ["${aws_eip.tranque-staging-sml-1_ip.public_ip}"]
}

# A record for staging-sml-2.observatorioderelaves.cl
resource "aws_route53_record" "staging-sml-2-observatorioderelaves-cl" {
  zone_id = "${data.aws_route53_zone.observatorioderelaves-cl.zone_id}"
  name    = "staging-sml-2.${data.aws_route53_zone.observatorioderelaves-cl.name}"
  type    = "A"
  ttl     = "60"
  records = ["${aws_eip.tranque-staging-sml-2_ip.public_ip}"]
}

# A record for staging-sml-3.observatorioderelaves.cl
resource "aws_route53_record" "staging-sml-3-observatorioderelaves-cl" {
  zone_id = "${data.aws_route53_zone.observatorioderelaves-cl.zone_id}"
  name    = "staging-sml-3.${data.aws_route53_zone.observatorioderelaves-cl.name}"
  type    = "A"
  ttl     = "60"
  records = ["${aws_eip.tranque-staging-sml-3_ip.public_ip}"]
}
