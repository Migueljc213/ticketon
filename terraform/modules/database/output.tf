output "endereco_banco" {
  description = "O Endpoint real para conectar no MySQL"
  value       = aws_db_instance.mysql_tcc.address
}