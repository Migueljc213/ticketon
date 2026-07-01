output "alb_dns_name" {
  description = "A URL estável para colocar no seu Frontend (Next.js)"
  value       = aws_lb.api_alb.dns_name
}

output "ec2_security_group_id" {
  value = aws_security_group.ec2_sg.id
}