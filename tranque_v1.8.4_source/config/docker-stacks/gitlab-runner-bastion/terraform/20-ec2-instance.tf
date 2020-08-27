# gitlab-runner-bastion ec2 instance
resource "aws_instance" "gitlab_runner_bastion_ec2" {
  ami               = "${var.gitlab_runner_bastion_ami}"
  instance_type     = "t3.micro"
  availability_zone = "${var.aws_az}"
  key_name          = "tranque-dev-${var.aws_region}"
  security_groups   = ["${aws_security_group.gitlab_runner_bastion_sg.name}", "default"]

  tags = {
   Name      = "${var.name_prefix}-gitlab-runner-bastion"
   app_group = "${var.name_prefix}"
   Role      = "gitlab-runner"
  }
}
