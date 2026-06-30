variable "ambiente" {
  description = "Nome do ambiente (ex: dev, homolog, prod)"
  type        = string
}

variable "ami_id" {
  description = "ID da Imagem do Sistema Operacional (AMI)"
  type        = string
}

variable "tipo_instancia" {
  description = "Tamanho da máquina (ex: t2.micro, t3.micro)"
  type        = string
  default     = "t3.micro" # Valor padrão se ninguém informar nada
}

variable "id_subrede" {
  description = "ID da Subnet onde a máquina será criada"
  type        = string
}

variable "ids_grupos_seguranca" {
  description = "Lista com os IDs dos Security Groups (Firewall)"
  type        = list(string)
}

variable "script_inicializacao" {
  description = "Script bash para rodar quando a máquina ligar pela primeira vez"
  type        = string
  default     = "" # Se não passarmos nada, ele fica vazio (útil para o dev que já estava pronto)
}

variable "nome_chave_ssh" {
  description = "Nome do Key Pair criado na AWS para acesso SSH"
  type        = string
  default     = "" # Deixamos vazio como padrão para não quebrar o Dev
}


