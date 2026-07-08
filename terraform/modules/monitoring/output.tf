output "grafana_url" {
  description = "URL do Grafana (login: admin / senha definida em grafana_admin_password)"
  value       = "http://${aws_instance.monitoring_server.public_ip}:3005"
}

output "monitoring_public_ip" {
  description = "IP público da instância de monitoramento (uso: SSH tunnel até o Prometheus em :9090)"
  value       = aws_instance.monitoring_server.public_ip
}

output "monitoring_security_group_id" {
  description = "SG da instância de monitoramento — usado para liberar a porta 9100 nas instâncias da API"
  value       = aws_security_group.monitoring_sg.id
}
