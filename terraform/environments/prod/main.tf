# module "backend_prod" {
#   source = "../../modules/backend_node"

#   # 1. Variáveis de Identificação e Tamanho
#   ambiente       = "prod"
#   ami_id         = "ami-091138d0f0d41ff90" # Ubuntu padrão da sua região
#   tipo_instancia = "t3.micro"              # Ou t3.small/medium se prod precisar de mais poder

#   # 2. Redes e Segurança (Aqui você pode usar os mesmos IDs do Dev por enquanto, 
#   # mas o ideal no futuro é ter uma Subnet e SG separados para Produção)
#   id_subrede           = "subnet-027714ec464b97fcb"
#   ids_grupos_seguranca = ["sg-0f1bf6705093825f2"]

#   nome_chave_ssh = "tcc-tickton-prod"

#   # 3. A Mágica do Docker: Script de Inicialização
#   # A sintaxe <<-EOF permite escrevermos um bloco de texto grande no Terraform
#   script_inicializacao = <<-EOF
#     #!/bin/bash
#     # Atualiza pacotes e instala o Docker
#     apt-get update -y
#     apt-get install docker.io -y
#     systemctl start docker
#     systemctl enable docker

#     # Adiciona o usuário padrão ao grupo do docker
#     usermod -aG docker ubuntu

#     # Sobe o container do NestJS
#     # NOTA: Substitua 'sua-imagem-nestjs:latest' pela imagem real do seu backend 
#     # que deve estar no Docker Hub ou no AWS ECR.
#     docker run -d \
#       --name api-prod \
#       --restart always \
#       -p 80:3000 \
#       -e NODE_ENV=production \
#       sua-imagem-nestjs:latest
#   EOF
# }
# resource "aws_security_group" "rds_sg_prod" {
#   name        = "ticketon-rds-sg-prod"
#   description = "Permite acesso da EC2 ao banco MySQL"

#   # Libera a porta 3306 APENAS para quem vier do Security Group da sua EC2
#   ingress {
#     from_port       = 3306
#     to_port         = 3306
#     protocol        = "tcp"
#     security_groups = ["sg-0f1bf6705093825f2"]
#   }

#   #Se você também quiser acessar o banco da sua casa pelo DBeaver, descomente a regra abaixo:
#   ingress {
#     from_port   = 3306
#     to_port     = 3306
#     protocol    = "tcp"
#     cidr_blocks = ["0.0.0.0/0"] # (Aviso: Libera para o mundo, use com cuidado)
#   }

#   egress {
#     from_port   = 0
#     to_port     = 0
#     protocol    = "-1"
#     cidr_blocks = ["0.0.0.0/0"]
#   }
# }

# module "banco_prod" {
#   source = "../../modules/database"

#   ambiente             = "prod"
#   nome_banco           = "ticketon"
#   usuario_banco        = "admin"
#   senha_banco          = "SenhaSuperForte123!" # Em cenários reais maduros, injetamos isso via AWS Secrets Manager
#   ids_grupos_seguranca = [aws_security_group.rds_sg_prod.id]
# }

# # Pede para o ambiente de prod imprimir o endereço gerado pelo módulo
# output "rds_endpoint" {
#   value = module.banco_prod.endereco_banco
# }

module "backend_prod" {
  source = "../../modules/backend_node"

  ambiente       = "prod"
  tipo_instancia = "t3.micro"
  nome_chave_ssh = "ticketon-prod-key"
  
  # Dados de Rede (Substitua pelos dados reais da sua VPC da AWS)
  id_vpc           = "vpc-0123456789abcdef0"
  ids_subredes_ec2 = ["subnet-027714ec464b97fcb"]
  ids_subredes_alb = ["subnet-027714ec464b97fcb", "subnet-outrasubnetdaoutra_az"]

  # Dados do Banco de Dados Gerenciado (RDS)
  db_host     = module.banco_prod.endereco_banco
  db_user     = "admin"
  db_password = "SenhaSuperForte123!"
  db_name     = "ticketon"

  # Esta tag será atualizada automaticamente ou manualmente quando quiser mudar a versão
  docker_image_tag = "latest"
}

module "banco_prod" {
  source = "../../modules/database"

  ambiente             = "prod"
  nome_banco           = "ticketon"
  usuario_banco        = "admin"
  senha_banco          = "SenhaSuperForte123!"
  
  # REGRA SÊNIOR: Liberamos o banco APENAS para o Security Group dinâmico das EC2 do ASG
  ids_grupos_seguranca = [module.backend_prod.ec2_security_group_id]
}

output "url_final_da_api" {
  value = module.backend_prod.alb_dns_name
}