# elastic IP for gitlab-runner-bastion
resource "aws_eip" "gitlab_runner_bastion_eip" {
  instance = "${aws_instance.gitlab_runner_bastion_ec2.id}"
}
