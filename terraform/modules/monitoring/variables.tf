variable "ambiente" {
  type        = string
  description = "Ambiente da infraestrutura (dev, prod)"
}

variable "tipo_instancia" {
  type        = string
  description = "Tamanho da máquina EC2 de monitoramento"
  default     = "t3.micro"
}

variable "nome_chave_ssh" {
  type        = string
  description = "Nome da chave PEM criada na AWS"
}

variable "id_vpc" {
  type        = string
  description = "ID da VPC onde a instância de monitoramento será criada"
}

variable "id_subrede" {
  type        = string
  description = "ID da subnet onde a instância de monitoramento nasce"
}

variable "regiao" {
  type        = string
  description = "Região AWS (usada pelo Prometheus para descobrir as instâncias da API via EC2 service discovery)"
  default     = "us-east-1"
}

variable "alb_dns_name" {
  type        = string
  description = "DNS do ALB da API — o Prometheus faz scrape de /metrics através dele"
}

variable "tag_name_instancias_api" {
  type        = string
  description = "Valor da tag Name usada pelas instâncias EC2 da API (ASG), para o Prometheus descobri-las via EC2 service discovery e coletar node-exporter"
}

variable "grafana_admin_password" {
  type        = string
  description = "Senha do usuário admin do Grafana — não tem valor padrão de propósito, precisa ser passada explicitamente no apply"
  sensitive   = true
}
