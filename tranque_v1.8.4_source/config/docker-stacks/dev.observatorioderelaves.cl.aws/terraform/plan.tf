variable "aws_access_key" {}
variable "aws_secret_key" {}
variable "cname_name" {}
variable "cname_value" {}

# save terraform status on S3
terraform {
  backend "s3" {
    bucket = "tranque-terraform-state"
    key    = "dev.observatorioderelaves.cl/terraform.tfstate"
    region = "us-east-1"
  }
}

# aws credentials
provider "aws" {
  access_key = "${var.aws_access_key}"
  secret_key = "${var.aws_secret_key}"
  region     = "us-east-1"
}

# security group "tranque-dev"
resource "aws_security_group" "tranque-dev" {
  name        = "tranque-dev"
  description = "tranque-dev"

  # MLP:    200.72.249.0/24
  # Inria:  146.83.70.0/27
  # FCH:    190.98.245.0/24
  ingress {
    from_port        = 80
    to_port          = 80
    protocol         = "tcp"
    cidr_blocks      = ["0.0.0.0/0"]
  }

  # MLP:    200.72.249.0/24
  # Inria:  146.83.70.0/27
  # FCH:    190.98.245.0/24
  ingress {
    from_port        = 443
    to_port          = 443
    protocol         = "tcp"
    cidr_blocks      = ["0.0.0.0/0"]
  }

  # Inria:  146.83.70.0/27
  # FCH:    190.98.245.0/24
  ingress {
    from_port        = 15671
    to_port          = 15672
    protocol         = "tcp"
    cidr_blocks      = ["146.83.70.0/27"
                        , "190.98.245.0/24"]
  }

  # MLP:    200.72.249.0/24
  # Inria:  146.83.70.0/27
  # FCH:    190.98.245.0/24
  ingress {
    from_port        = 5671
    to_port          = 5672
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
    from_port   = 5601
    to_port     = 5601
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
    from_port        = 9090
    to_port          = 9090
    protocol         = "tcp"
    cidr_blocks      = ["0.0.0.0/0"]
    ipv6_cidr_blocks = ["::/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

# instance "dev-leader"
resource "aws_instance" "dev-leader" {
  ami               = "ami-013be31976ca2c322"
  instance_type     = "t3.micro"
  availability_zone = "us-east-1a"
  key_name          = "tranque-dev-us-east-1"
  security_groups   = ["${aws_security_group.tranque-dev.name}", "default"]

  tags {
    Name = "dev-leader"
    Role = "docker-leader"
  }
}

# elastic IP for "dev-leader"
resource "aws_eip" "dev-leader_ip" {
  instance = "${aws_instance.dev-leader.id}"
}

# DNS names for "dev-leader"
data "aws_route53_zone" "observatorioderelaves-cl" {
  name = "observatorioderelaves.cl."
}

# A record for dev.observatorioderelaves.cl
resource "aws_route53_record" "dev-observatorioderelaves-cl" {
  zone_id = "${data.aws_route53_zone.observatorioderelaves-cl.zone_id}"
  name    = "dev.${data.aws_route53_zone.observatorioderelaves-cl.name}"
  type    = "A"
  ttl     = "60"
  records = ["${aws_eip.dev-leader_ip.public_ip}"]
}

# dev-worker-backend instance
resource "aws_instance" "dev-worker-backend" {
  ami               = "ami-013be31976ca2c322"
  instance_type     = "t3.medium"
  availability_zone = "us-east-1a"
  key_name          = "tranque-dev-us-east-1"
  security_groups   = ["${aws_security_group.tranque-dev.name}", "default"]

  root_block_device {
    volume_size = "16"
  }

  tags {
    Name = "dev-worker-backend"
    Role = "docker-worker-backend"
  }
}

# dev-worker-broker instance
resource "aws_instance" "dev-worker-broker" {
  ami               = "ami-013be31976ca2c322"
  instance_type     = "t3.large"
  availability_zone = "us-east-1a"
  key_name          = "tranque-dev-us-east-1"
  security_groups   = ["${aws_security_group.tranque-dev.name}", "default"]

  tags {
    Name = "dev-worker-broker"
    Role = "docker-worker-broker"
  }
}

# dev-worker-elasticsearch instance
resource "aws_instance" "dev-worker-elasticsearch" {
  ami               = "ami-013be31976ca2c322"
  instance_type     = "t3.large"
  availability_zone = "us-east-1a"
  key_name          = "tranque-dev-us-east-1"
  security_groups   = ["${aws_security_group.tranque-dev.name}", "default"]

  tags {
    Name = "dev-worker-elasticsearch"
    Role = "docker-worker-elasticsearch"
  }
}
# attach elasticsearch EBS volume (vol-0428fafdd091ad988 was created manually)
resource "aws_volume_attachment" "dev-worker-elasticsearch-ebs-att" {
  device_name = "/dev/sdf"
  volume_id   = "vol-0428fafdd091ad988"
  instance_id = "${aws_instance.dev-worker-elasticsearch.id}"
}

# dev-worker-postgres instance
resource "aws_instance" "dev-worker-postgres" {
  ami               = "ami-013be31976ca2c322"
  instance_type     = "t3.small"
  availability_zone = "us-east-1a"
  key_name          = "tranque-dev-us-east-1"
  security_groups   = ["${aws_security_group.tranque-dev.name}", "default"]

  tags {
    Name = "dev-worker-postgres"
    Role = "docker-worker-postgres"
  }
}

# dev-worker-kibana instance
resource "aws_instance" "dev-worker-kibana" {
  ami               = "ami-013be31976ca2c322"
  instance_type     = "t3.small"
  availability_zone = "us-east-1a"
  key_name          = "tranque-dev-us-east-1"
  security_groups   = ["${aws_security_group.tranque-dev.name}", "default"]

  tags {
    Name = "dev-worker-kibana"
    Role = "docker-worker-kibana"
  }
}

# dev-worker-monitor instance
resource "aws_instance" "dev-worker-monitor" {
  ami               = "ami-013be31976ca2c322"
  instance_type     = "t3.small"
  availability_zone = "us-east-1a"
  key_name          = "tranque-dev-us-east-1"
  security_groups   = ["${aws_security_group.tranque-dev.name}", "default"]

  tags {
    Name = "dev-worker-monitor"
    Role = "docker-worker-monitor"
  }
}
