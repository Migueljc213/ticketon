resource "aws_db_instance" "mysql_tcc" {
  identifier             = "ticketon-db-${var.ambiente}"
  engine                 = "mysql"
  engine_version         = "8.0"
  instance_class         = "db.t3.micro" # Fica dentro do Free Tier / Baixo Custo
  allocated_storage      = 20

  db_name                = var.nome_banco
  username               = var.usuario_banco
  password               = var.senha_banco

  vpc_security_group_ids = var.ids_grupos_seguranca

  skip_final_snapshot    = true # Essencial para podermos destruir o lab rápido se precisar
  publicly_accessible    = true # Permite que você conecte do seu DBeaver/Workbench local
}