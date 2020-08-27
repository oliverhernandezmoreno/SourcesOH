variable "aws_region" {
  default = "us-west-1"
}

variable "aws_az" {
  default = "us-west-1a"
}

variable "name_prefix" {
  default = "ci-tranque"
}

variable "default_vpc_id" {
  default = "vpc-1e0b267a"
}

variable "gitlab_runner_bastion_ami" {
  default = "ami-056ee704806822732"
}

variable "dns_zone" {
  default = "observatorioderelaves.cl."
}

variable "dns_subdomain" {
  default = "ci-tranque-gitlab-runner-bastion"
}
