resource "aws_instance" "api_server" {
  # Usando as variáveis (var.nome_da_variavel)
  ami           = var.ami_id
  instance_type = var.tipo_instancia
  
  subnet_id              = var.id_subrede
  vpc_security_group_ids = var.ids_grupos_seguranca

  # Deixando o nome dinâmico com interpolação de string!
  tags = {
    Name = "backend-nestjs-tcc-${var.ambiente}"
  }

  root_block_device {
    volume_size = 20
    volume_type = "gp3"
  }

  user_data = var.script_inicializacao

  key_name               = var.nome_chave_ssh
}

