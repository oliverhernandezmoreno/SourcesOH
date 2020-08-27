variable "aws_access_key" {}
variable "aws_secret_key" {}
variable "cname_name" {}
variable "cname_value" {}

# save terraform status on S3
terraform {
  backend "s3" {
    bucket = "tranque-terraform-state"
    key    = "observatorioderelaves.cl/terraform.tfstate"
    region = "us-east-1"
  }
}

# aws credentials
provider "aws" {
  access_key = "${var.aws_access_key}"
  secret_key = "${var.aws_secret_key}"
  region     = "us-east-2"
}

# security group "tranque-prod"
resource "aws_security_group" "tranque-prod" {
  name        = "tranque-prod"
  description = "tranque-prod"

  # MLP:    200.72.249.0/24
  # Inria:  146.83.70.0/27
  # FCH:    190.98.245.0/24
  # SNGM:   190.98.205.162/32
  ingress {
    from_port        = 80
    to_port          = 80
    protocol         = "tcp"
    cidr_blocks      = ["200.72.249.0/24"
                        , "146.83.70.0/27"
                        , "190.98.245.0/24"
                        , "190.98.205.162/32"]
  }

  # MLP:    200.72.249.0/24
  # Inria:  146.83.70.0/27
  # FCH:    190.98.245.0/24
  # SNGM:   190.98.205.162/32
  ingress {
    from_port        = 443
    to_port          = 443
    protocol         = "tcp"
    cidr_blocks      = ["200.72.249.0/24"
                        , "146.83.70.0/27"
                        , "190.98.245.0/24"
                        , "190.98.205.162/32"]
  }

  # Inria:  146.83.70.0/27
  # MLP:    200.72.249.0/24
  # FCH:    190.98.245.0/24
  ingress {
    from_port        = 15671
    to_port          = 15672
    protocol         = "tcp"
    cidr_blocks      = ["146.83.70.0/27"
                        , "200.72.249.0/24"
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

# instance "prod-leader"
resource "aws_instance" "prod-leader" {
  ami               = "ami-0350c5670171b5391"
  instance_type     = "t3.micro"
  availability_zone = "us-east-2a"
  key_name          = "tranque-prod-us-east-2"
  security_groups   = ["${aws_security_group.tranque-prod.name}", "default"]

  tags {
    Name = "prod-leader"
    Role = "docker-leader"
  }
}

# elastic IP for "prod-leader"
resource "aws_eip" "prod-leader_ip" {
  instance = "${aws_instance.prod-leader.id}"
}

# instance "prod-manager"
resource "aws_instance" "prod-manager" {
  ami               = "ami-0350c5670171b5391"
  instance_type     = "t3.micro"
  availability_zone = "us-east-2b"
  key_name          = "tranque-prod-us-east-2"
  security_groups   = ["${aws_security_group.tranque-prod.name}", "default"]

  tags {
    Name = "prod-manager"
    Role = "docker-manager"
  }
}

# elastic IP for "prod-manager"
resource "aws_eip" "prod-manager_ip" {
  instance = "${aws_instance.prod-manager.id}"
}

# DNS names for "prod-leader" and "prod-manager"
data "aws_route53_zone" "observatorioderelaves-cl" {
  name = "observatorioderelaves.cl."
}

# CNAME record for observatorioderelaves.cl SSL validation (DV)
resource "aws_route53_record" "ssl-observatorioderelaves_cl-cname" {
  zone_id = "${data.aws_route53_zone.observatorioderelaves-cl.zone_id}"
  name    = "${var.cname_name}.${data.aws_route53_zone.observatorioderelaves-cl.name}"
  type    = "CNAME"
  ttl     = "60"
  records = ["${var.cname_value}"]
}

# CNAME record for dev.observatorioderelaves.cl SSL validation (DV)
resource "aws_route53_record" "ssl-dev_observatorioderelaves_cl-cname" {
  zone_id = "${data.aws_route53_zone.observatorioderelaves-cl.zone_id}"
  name    = "${var.cname_name}.dev.${data.aws_route53_zone.observatorioderelaves-cl.name}"
  type    = "CNAME"
  alias {
    name = "${aws_route53_record.ssl-observatorioderelaves_cl-cname.name}"
    zone_id = "${aws_route53_record.ssl-observatorioderelaves_cl-cname.zone_id}"
    evaluate_target_health = false
  }
}

# CNAME record for www.observatorioderelaves.cl SSL validation (DV)
resource "aws_route53_record" "ssl-www_observatorioderelaves_cl-cname" {
  zone_id = "${data.aws_route53_zone.observatorioderelaves-cl.zone_id}"
  name    = "${var.cname_name}.www.${data.aws_route53_zone.observatorioderelaves-cl.name}"
  type    = "CNAME"
  alias {
    name = "${aws_route53_record.ssl-observatorioderelaves_cl-cname.name}"
    zone_id = "${aws_route53_record.ssl-observatorioderelaves_cl-cname.zone_id}"
    evaluate_target_health = false
  }
}

# A record for observatorioderelaves.cl
resource "aws_route53_record" "observatorioderelaves-cl" {
  zone_id = "${data.aws_route53_zone.observatorioderelaves-cl.zone_id}"
  name    = "${data.aws_route53_zone.observatorioderelaves-cl.name}"
  type    = "A"
  ttl     = "60"
  records = ["${aws_eip.prod-leader_ip.public_ip}", "${aws_eip.prod-manager_ip.public_ip}"]
}

# A record for www.observatorioderelaves.cl
resource "aws_route53_record" "www-observatorioderelaves-cl" {
  zone_id = "${data.aws_route53_zone.observatorioderelaves-cl.zone_id}"
  name    = "www.${data.aws_route53_zone.observatorioderelaves-cl.name}"
  type    = "A"
  alias {
    name = "${aws_route53_record.observatorioderelaves-cl.name}"
    zone_id = "${aws_route53_record.observatorioderelaves-cl.zone_id}"
    evaluate_target_health = false
  }
}

# A record for docker leader node
resource "aws_route53_record" "leader-observatorioderelaves-cl" {
  zone_id = "${data.aws_route53_zone.observatorioderelaves-cl.zone_id}"
  name    = "leader.${data.aws_route53_zone.observatorioderelaves-cl.name}"
  type    = "A"
  ttl     = "60"
  records = ["${aws_eip.prod-leader_ip.public_ip}"]
}

# A record for docker manager (non-leader) node
resource "aws_route53_record" "manager-observatorioderelaves-cl" {
  zone_id = "${data.aws_route53_zone.observatorioderelaves-cl.zone_id}"
  name    = "manager.${data.aws_route53_zone.observatorioderelaves-cl.name}"
  type    = "A"
  ttl     = "60"
  records = ["${aws_eip.prod-manager_ip.public_ip}"]
}

# prod-worker-backend instance
resource "aws_instance" "prod-worker-backend" {
  ami               = "ami-0350c5670171b5391"
  instance_type     = "t3.medium"
  availability_zone = "us-east-2a"
  key_name          = "tranque-prod-us-east-2"
  security_groups   = ["${aws_security_group.tranque-prod.name}", "default"]

  root_block_device {
    volume_size = "16"
  }

  tags {
    Name = "prod-worker-backend"
    Role = "docker-worker-backend"
  }
}

# prod-worker-broker instance
resource "aws_instance" "prod-worker-broker" {
  ami               = "ami-0350c5670171b5391"
  instance_type     = "t3.large"
  availability_zone = "us-east-2a"
  key_name          = "tranque-prod-us-east-2"
  security_groups   = ["${aws_security_group.tranque-prod.name}", "default"]

  tags {
    Name = "prod-worker-broker"
    Role = "docker-worker-broker"
  }
}

# prod-worker-elasticsearch instance
resource "aws_instance" "prod-worker-elasticsearch" {
  ami               = "ami-0350c5670171b5391"
  instance_type     = "t3.large"
  availability_zone = "us-east-2a"
  key_name          = "tranque-prod-us-east-2"
  security_groups   = ["${aws_security_group.tranque-prod.name}", "default"]

  tags {
    Name = "prod-worker-elasticsearch"
    Role = "docker-worker-elasticsearch"
  }
}
# attach elasticsearch EBS volume (vol-005c2761d74213c1b was created manually)
resource "aws_volume_attachment" "prod-worker-elasticsearch-ebs-att" {
  device_name = "/dev/sdf"
  volume_id   = "vol-005c2761d74213c1b"
  instance_id = "${aws_instance.prod-worker-elasticsearch.id}"
}

# prod-worker-postgres instance
resource "aws_instance" "prod-worker-postgres" {
  ami               = "ami-0350c5670171b5391"
  instance_type     = "t3.small"
  availability_zone = "us-east-2a"
  key_name          = "tranque-prod-us-east-2"
  security_groups   = ["${aws_security_group.tranque-prod.name}", "default"]

  tags {
    Name = "prod-worker-postgres"
    Role = "docker-worker-postgres"
  }
}

# prod-worker-kibana instance
resource "aws_instance" "prod-worker-kibana" {
  ami               = "ami-0350c5670171b5391"
  instance_type     = "t3.small"
  availability_zone = "us-east-2a"
  key_name          = "tranque-prod-us-east-2"
  security_groups   = ["${aws_security_group.tranque-prod.name}", "default"]

  tags {
    Name = "prod-worker-kibana"
    Role = "docker-worker-kibana"
  }
}

# prod-worker-monitor instance
resource "aws_instance" "prod-worker-monitor" {
  ami               = "ami-0350c5670171b5391"
  instance_type     = "t3.small"
  availability_zone = "us-east-2a"
  key_name          = "tranque-prod-us-east-2"
  security_groups   = ["${aws_security_group.tranque-prod.name}", "default"]

  tags {
    Name = "prod-worker-monitor"
    Role = "docker-worker-monitor"
  }
}
