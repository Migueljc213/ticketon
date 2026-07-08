# ==========================================
# 1. FIREWALL DA INSTÂNCIA DE MONITORAMENTO
# ==========================================

resource "aws_security_group" "monitoring_sg" {
  name        = "ticketon-monitoring-sg-${var.ambiente}"
  description = "Grafana público (com senha) + SSH; Prometheus (9090) não é exposto"
  vpc_id      = var.id_vpc

  # Grafana — aberto ao mundo, protegido só pela senha do admin (decisão consciente,
  # documentada no plano: mais simples pra acessar de qualquer lugar na defesa do TCC)
  ingress {
    from_port   = 3005
    to_port     = 3005
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # Acesso SSH para manutenção (mesmo padrão já usado no ec2_sg do backend_node)
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
# 2. PERMISSÃO PARA O PROMETHEUS ENXERGAR AS
#    INSTÂNCIAS DA API (EC2 SERVICE DISCOVERY)
# ==========================================
# A API roda numa Auto Scaling Group — os IPs mudam a cada deploy/scale. Em vez de
# hardcodar IP no prometheus.yml (quebra silenciosamente quando o ASG substitui a
# instância), a instância de monitoramento ganha permissão IAM só de LEITURA para
# listar instâncias EC2, e o Prometheus descobre os alvos sozinho via tag Name.

resource "aws_iam_role" "monitoring_role" {
  name = "ticketon-monitoring-role-${var.ambiente}"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Action    = "sts:AssumeRole"
      Effect    = "Allow"
      Principal = { Service = "ec2.amazonaws.com" }
    }]
  })
}

resource "aws_iam_role_policy" "monitoring_ec2_describe" {
  name = "ticketon-monitoring-ec2-describe-${var.ambiente}"
  role = aws_iam_role.monitoring_role.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect   = "Allow"
      Action   = ["ec2:DescribeInstances"]
      Resource = "*"
    }]
  })
}

resource "aws_iam_instance_profile" "monitoring_profile" {
  name = "ticketon-monitoring-profile-${var.ambiente}"
  role = aws_iam_role.monitoring_role.name
}

# ==========================================
# 3. INSTÂNCIA EC2 DE MONITORAMENTO
# ==========================================
# Instância única (não ASG) — monitoramento não precisa escalar, e ficar numa
# instância própria (em vez de dividir com a API) é o que garante que ela
# continua de pé mesmo se a instância da API cair.

resource "aws_instance" "monitoring_server" {
  ami                    = "ami-091138d0f0d41ff90" # mesma AMI Ubuntu usada no backend_node
  instance_type          = var.tipo_instancia
  subnet_id              = var.id_subrede
  vpc_security_group_ids = [aws_security_group.monitoring_sg.id]
  iam_instance_profile   = aws_iam_instance_profile.monitoring_profile.name
  key_name               = var.nome_chave_ssh

  root_block_device {
    volume_size = 20
    volume_type = "gp3"
  }

  user_data = base64encode(<<-EOF
    #!/bin/bash
    apt-get update -y
    apt-get install docker.io -y
    systemctl start docker
    systemctl enable docker

    mkdir -p /etc/prometheus

    cat <<'PROM_EOF' > /etc/prometheus/prometheus.yml
    global:
      scrape_interval: 15s

    scrape_configs:
      - job_name: prometheus
        static_configs:
          - targets: ['localhost:9090']

      - job_name: node-monitoring-host
        static_configs:
          - targets: ['localhost:9100']

      - job_name: ticketon-backend
        metrics_path: /metrics
        static_configs:
          - targets: ['${var.alb_dns_name}']

      - job_name: ticketon-api-host
        ec2_sd_configs:
          - region: ${var.regiao}
            port: 9100
            filters:
              - name: tag:Name
                values: ["${var.tag_name_instancias_api}"]
              - name: instance-state-name
                values: ["running"]
        relabel_configs:
          - source_labels: [__meta_ec2_tag_Name]
            target_label: instance_name
    PROM_EOF

    mkdir -p /etc/grafana/provisioning/datasources

    cat <<'DS_EOF' > /etc/grafana/provisioning/datasources/prometheus.yml
    apiVersion: 1

    datasources:
      - name: Prometheus
        uid: prometheus
        type: prometheus
        access: proxy
        url: http://localhost:9090
        isDefault: true
        editable: true
    DS_EOF

    docker run -d \
      --name node-exporter \
      --restart always \
      --net="host" \
      --pid="host" \
      -v "/:/host:ro,rslave" \
      prom/node-exporter:latest \
      --path.rootfs=/host

    docker run -d \
      --name prometheus \
      --restart always \
      --network host \
      -v /etc/prometheus/prometheus.yml:/etc/prometheus/prometheus.yml:ro \
      prom/prometheus:latest

    docker run -d \
      --name grafana \
      --restart always \
      --network host \
      -e GF_SERVER_HTTP_PORT=3005 \
      -e GF_SECURITY_ADMIN_USER=admin \
      -e GF_SECURITY_ADMIN_PASSWORD='${var.grafana_admin_password}' \
      -v /etc/grafana/provisioning:/etc/grafana/provisioning:ro \
      grafana/grafana:latest
  EOF
  )

  tags = {
    Name = "ticketon-monitoring-${var.ambiente}"
  }
}
