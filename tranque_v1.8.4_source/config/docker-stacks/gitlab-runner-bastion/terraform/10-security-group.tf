# gitlab-runner-bastion security group
resource "aws_security_group" "gitlab_runner_bastion_sg" {
  name   = "${var.name_prefix}-gitlab-runner-bastion-sg"
  vpc_id = "${var.default_vpc_id}"

  tags = {
    Name      = "${var.name_prefix}-gitlab-runner-bastion-sg"
    app_group = "${var.name_prefix}"
  }

  ingress {
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    protocol  = "tcp"
    from_port = 2375
    to_port   = 2376
    self      = true
  }

  egress {
    protocol    = "-1"
    from_port   = 0
    to_port     = 0
    cidr_blocks = ["0.0.0.0/0"]
  }
}
