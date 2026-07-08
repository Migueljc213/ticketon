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

# ==========================================
# 1. BUSCA AUTOMÁTICA DE REDE (DATA SOURCES)
# ==========================================

# Pergunta à AWS: "Qual é o ID da minha VPC Padrão?"
data "aws_vpc" "default" {
  default = true
}

# Pergunta à AWS: "Quais são os IDs de todas as subnets dessa VPC?"
data "aws_subnets" "default" {
  filter {
    name   = "vpc-id"
    values = [data.aws_vpc.default.id]
  }
}

# ==========================================
# 2. MÓDULO BACKEND (ASG + ALB)
# ==========================================

module "backend_prod" {
  source = "../../modules/backend_node"

  ambiente       = "prod"
  tipo_instancia = "t3.micro"
  nome_chave_ssh = "tcc-tickton-prod"

  # Agora injetamos os IDs dinâmicos que o Terraform descobriu sozinho!
  id_vpc           = data.aws_vpc.default.id
  ids_subredes_ec2 = data.aws_subnets.default.ids
  ids_subredes_alb = data.aws_subnets.default.ids # ALB usa todas as subnets disponíveis
  nome             = "ticketon-prod"
  # Dados do Banco de Dados Gerenciado (RDS)
  db_host     = module.banco_prod.endereco_banco
  db_user     = "admin"
  db_password = "SenhaSuperForte123!"
  db_name     = "ticketon"

  # A tag do DockerHub (Que depois o GitHub Actions vai atualizar)
  docker_image_tag = "latest"
}

# ==========================================
# 3. FIREWALL EXCLUSIVO PARA O BANCO DE DADOS
# ==========================================

resource "aws_security_group" "rds_sg_prod_v2" {
  name        = "ticketon-rds-sg-prod-v2" # Nome V2 para não dar conflito com o antigo
  description = "Permite acesso do ASG ao banco MySQL"
  vpc_id      = data.aws_vpc.default.id

  ingress {
    from_port = 3306
    to_port   = 3306
    protocol  = "tcp"
    # REGRA SÊNIOR: Só deixa entrar quem vier do Security Group dinâmico das EC2 do ASG
    security_groups = [module.backend_prod.ec2_security_group_id]
  }
}

# ==========================================
# 4. MÓDULO DO BANCO DE DADOS (RDS)
# ==========================================

module "banco_prod" {
  source = "../../modules/database"

  ambiente      = "prod"
  nome_banco    = "ticketon"
  usuario_banco = "admin"
  senha_banco   = "SenhaSuperForte123!"

  # Conecta o RDS ao novo Firewall V2
  ids_grupos_seguranca = [aws_security_group.rds_sg_prod_v2.id]
}

# ==========================================
# 5. OUTPUTS (A URL FINAL)
# ==========================================

output "url_final_da_api" {
  description = "Copie essa URL e cole no NEXT_PUBLIC_API_URL da Vercel"
  value       = module.backend_prod.alb_dns_name
}

# ==========================================
# 6. MÓDULO DE MONITORAMENTO (PROMETHEUS + GRAFANA)
# ==========================================
# Instância dedicada, separada da API — se a instância da API cair, o
# monitoramento continua de pé pra investigar o que houve.

variable "grafana_admin_password" {
  type        = string
  description = "Senha do admin do Grafana em produção — passe via -var na hora do apply, nunca commitar aqui"
  sensitive   = true
}

module "monitoring_prod" {
  source = "../../modules/monitoring"

  ambiente       = "prod"
  tipo_instancia = "t3.micro"
  nome_chave_ssh = "tcc-tickton-prod"

  id_vpc     = data.aws_vpc.default.id
  id_subrede = data.aws_subnets.default.ids[0]
  regiao     = "us-east-1"

  alb_dns_name            = module.backend_prod.alb_dns_name
  tag_name_instancias_api = "ticketon-api-prod"
  grafana_admin_password  = var.grafana_admin_password
}

# ==========================================
# 7. FIREWALL: MONITORAMENTO → API (porta 9100, node-exporter)
# ==========================================
# Mesmo padrão do rds_sg_prod_v2 acima: libera só pro Security Group de quem
# precisa, nunca pro mundo.

resource "aws_security_group_rule" "api_allow_monitoring_node_exporter" {
  type                     = "ingress"
  from_port                = 9100
  to_port                  = 9100
  protocol                 = "tcp"
  security_group_id        = module.backend_prod.ec2_security_group_id
  source_security_group_id = module.monitoring_prod.monitoring_security_group_id
}

output "grafana_url" {
  description = "URL do Grafana em produção"
  value       = module.monitoring_prod.grafana_url
}