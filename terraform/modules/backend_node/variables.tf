# variable "ambiente" {
#   description = "Nome do ambiente (ex: dev, homolog, prod)"
#   type        = string
# }

# variable "ami_id" {
#   description = "ID da Imagem do Sistema Operacional (AMI)"
#   type        = string
# }

# variable "tipo_instancia" {
#   description = "Tamanho da máquina (ex: t2.micro, t3.micro)"
#   type        = string
#   default     = "t3.micro" # Valor padrão se ninguém informar nada
# }

# variable "id_subrede" {
#   description = "ID da Subnet onde a máquina será criada"
#   type        = string
# }

# variable "ids_grupos_seguranca" {
#   description = "Lista com os IDs dos Security Groups (Firewall)"
#   type        = list(string)
# }

# variable "script_inicializacao" {
#   description = "Script bash para rodar quando a máquina ligar pela primeira vez"
#   type        = string
#   default     = "" # Se não passarmos nada, ele fica vazio (útil para o dev que já estava pronto)
# }

# variable "nome_chave_ssh" {
#   description = "Nome do Key Pair criado na AWS para acesso SSH"
#   type        = string
#   default     = "" # Deixamos vazio como padrão para não quebrar o Dev
# }

variable "ambiente" {
  type        = string
  description = "Ambiente da infraestrutura (dev, prod)"
}

variable "tipo_instancia" {
  type        = string
  description = "Tamanho da máquina EC2"
}

variable "nome_chave_ssh" {
  type        = string
  description = "Nome da chave PEM criada na AWS"
}

variable "id_vpc" {
  type        = string
  description = "ID da VPC padrão ou customizada onde a infra será criada"
}

variable "ids_subredes_ec2" {
  type        = list(string)
  description = "Lista de subnets onde as instâncias EC2 podem nascer"
}

variable "ids_subredes_alb" {
  type        = list(string)
  description = "Lista de subnets para o Load Balancer (Mínimo 2 em AZs diferentes)"
}

variable "docker_image_tag" {
  type        = string
  description = "Tag da imagem docker enviada pelo CI/CD"
  default     = "latest"
}

# Variáveis do Banco de Dados que o NestJS precisa para não dar Crash Loop
variable "db_host" { type = string }
variable "db_user" { type = string }
variable "db_password" { type = string }
variable "db_name" { type = string }

