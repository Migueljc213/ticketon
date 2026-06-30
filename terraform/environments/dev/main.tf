module "backend_dev" {
  source = "../../modules/backend_node"

  ambiente             = "dev"
  ami_id               = "ami-091138d0f0d41ff90"
  tipo_instancia       = "t3.micro"
  id_subrede           = "subnet-027714ec464b97fcb"
  ids_grupos_seguranca = ["sg-0f1bf6705093825f2"]
}