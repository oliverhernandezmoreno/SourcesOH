# DNS name for gitlab-runner-bastion
data "aws_route53_zone" "base_domain" {
  name = "${var.dns_zone}"
}

# A record for gitlab-runner-bastion
resource "aws_route53_record" "gitlab_runner_bastion_subdomain" {
  zone_id = "${data.aws_route53_zone.base_domain.zone_id}"
  name    = "${var.dns_subdomain}.${data.aws_route53_zone.base_domain.name}"
  type    = "A"
  ttl     = "60"
  records = ["${aws_eip.gitlab_runner_bastion_eip.public_ip}"]
}
