variable "ambiente" {
  description = "Ambiente (dev, prod)"
  type        = string
}

variable "nome_banco" {
  description = "Nome do database inicial (ex: ticketon)"
  type        = string
}

variable "usuario_banco" {
  description = "Usuário master do banco"
  type        = string
}

variable "senha_banco" {
  description = "Senha master do banco"
  type        = string
  sensitive   = true # Impede que o Terraform printe a senha no terminal
}

variable "ids_grupos_seguranca" {
  description = "Security Groups para liberar acesso ao banco"
  type        = list(string)
}