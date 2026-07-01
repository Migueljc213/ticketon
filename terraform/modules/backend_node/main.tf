# resource "aws_instance" "api_server" {
#   # Usando as variáveis (var.nome_da_variavel)
#   ami           = var.ami_id
#   instance_type = var.tipo_instancia
  
#   subnet_id              = var.id_subrede
#   vpc_security_group_ids = var.ids_grupos_seguranca

#   # Deixando o nome dinâmico com interpolação de string!
#   tags = {
#     Name = "backend-nestjs-tcc-${var.ambiente}"
#   }

#   root_block_device {
#     volume_size = 20
#     volume_type = "gp3"
#   }

#   user_data = var.script_inicializacao

#   key_name               = var.nome_chave_ssh
# }

# ==========================================
# 1. GRUPOS DE SEGURANÇA (FIREWALLS)
# ==========================================

# Firewall do Load Balancer: Permite tráfego HTTP da Internet
resource "aws_security_group" "alb_sg" {
  name        = "ticketon-alb-sg-${var.ambiente}"
  vpc_id      = var.id_vpc

  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"] # Aberto ao mundo
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

# Firewall das Máquinas EC2: Proteção Máxima
resource "aws_security_group" "ec2_sg" {
  name        = "ticketon-ec2-sg-${var.ambiente}"
  vpc_id      = var.id_vpc

  # Permite tráfego APENAS vindo do Load Balancer
  ingress {
    from_port       = 3000 # Porta interna do seu container NestJS
    to_port         = 3000
    protocol        = "tcp"
    security_groups = [aws_security_group.alb_sg.id]
  }

  # Permite acesso SSH para manutenção
  ingress {
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

# ==========================================
# 2. APPLICATION LOAD BALANCER (ALB)
# ==========================================

resource "aws_lb" "api_alb" {
  name               = "ticketon-alb-${var.ambiente}"
  internal           = false
  load_balancer_type = "application"
  security_groups    = [aws_security_group.alb_sg.id]
  subnets            = var.ids_subredes_alb
}

# Grupo de Destino: O ALB vai direcionar o tráfego para cá
resource "aws_lb_target_group" "api_tg" {
  name        = "ticketon-tg-${var.ambiente}"
  port        = 3000
  protocol    = "HTTP"
  vpc_id      = var.id_vpc
  target_type = "instance"

  # Rota de health check para o ALB saber se o NestJS está vivo
  health_check {
    path                = "/health" # Certifique-se de que essa rota existe no seu NestJS
    port                = "3000"
    healthy_threshold   = 2
    unhealthy_threshold = 3
    timeout             = 5
    interval            = 15
    matcher             = "200"
  }
}

# Ouvinte do ALB: Escuta na porta 80 e manda para o Target Group
resource "aws_lb_listener" "http_listener" {
  load_balancer_arn = aws_lb.api_alb.arn
  port              = "80"
  protocol          = "HTTP"

  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.api_tg.arn
  }
}

# ==========================================
# 3. AUTO SCALING GROUP & LAUNCH TEMPLATE
# ==========================================

# O Molde da Máquina: O que o ASG vai ler para criar novos servidores
resource "aws_launch_template" "api_lt" {
  name_prefix   = "ticketon-lt-${var.ambiente}-"
  image_id      = "ami-091138d0f0d41ff90" # Ubuntu padrão da sua região
  instance_type = var.tipo_instancia
  key_name      = var.nome_chave_ssh

  network_interfaces {
    associate_public_ip_address = true
    security_groups             = [aws_security_group.ec2_sg.id]
  }

  # Script de Inicialização Automatizado: Instala o Docker e puxa a imagem do DockerHub
  user_data = base64encode(<<-EOF
    #!/bin/bash
    apt-get update -y
    apt-get install docker.io -y
    systemctl start docker
    systemctl enable docker

    # Executa o container com as credenciais do banco real passadas pelo Terraform
    docker run -d \
      --name ticketon-api \
      --restart always \
      -p 3000:3000 \
      -e NODE_ENV='production' \
      -e DATABASE_HOST='${var.db_host}' \
      -e DATABASE_USERNAME='${var.db_user}' \
      -e DATABASE_PASSWORD='${var.db_password}' \
      -e DATABASE_NAME='${var.db_name}' \
      migueljcdev/ticketon-backend:${var.docker_image_tag}
  EOF
  )

  lifecycle {
    create_before_destroy = true
  }
}

# O Gerenciador de Instâncias: Mantém o número de máquinas estável
resource "aws_autoscaling_group" "api_asg" {
  name                = "ticketon-asg-${var.ambiente}"
  vpc_zone_identifier = var.ids_subredes_ec2
  target_group_arns   = [aws_lb_target_group.api_tg.arn]

  # Definição de capacidade do cluster
  desired_capacity          = 1 # Mantém 1 máquina rodando por padrão (Lab/Baixo Custo)
  min_size                  = 1 # Se a máquina cair, ele sobe 1 nova imediatamente
  max_size                  = 3 # Em pico de tráfego, pode escalar até 3 máquinas

  health_check_type         = "ELB" # Usa o Health Check do ALB para saber se a máquina travou
  health_check_grace_period = 180   # Espera 3 minutos pro Docker compilar/ligar antes de checar

  launch_template {
    id      = aws_launch_template.api_lt.id
    version = "$Latest"
  }

  # Estratégia de atualização automática ao mudar a imagem Docker
  instance_refresh {
    strategy = "Rolling"
    preferences {
      min_healthy_percentage = 50
    }
    triggers = ["tag"]
  }

  # Nomeia as instâncias criadas pelo ASG (senão nascem sem tag Name)
  tag {
    key                 = "Name"
    value               = "ticketon-api-${var.ambiente}"
    propagate_at_launch = true
  }
}