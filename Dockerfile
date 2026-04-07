# =============================================================================
# DOCKERFILE — Backend NestJS (Ticketon)
# =============================================================================
#
# O que é um Dockerfile?
# ──────────────────────
# É uma "receita de bolo" que descreve, passo a passo, como montar
# uma imagem Docker. Cada instrução vira uma CAMADA (layer) da imagem.
#
# Camadas são cacheadas: se o Dockerfile não mudou e os arquivos de
# uma instrução também não mudaram, o Docker reutiliza o cache e pula
# aquela etapa. Por isso a ordem das instruções importa muito!
#
# Anatomia de uma imagem = várias camadas empilhadas:
#   [FROM node:18-alpine]  ← sistema base
#   [WORKDIR /app]         ← configuração
#   [COPY package*.json]   ← arquivos de dependência
#   [RUN npm install]      ← dependências instaladas
#   [EXPOSE + CMD]         ← configuração de runtime
# =============================================================================

# -----------------------------------------------------------------------------
# INSTRUÇÃO FROM — a base da nossa imagem
# -----------------------------------------------------------------------------
# Todo Dockerfile começa com FROM. Aqui escolhemos qual sistema operacional
# e runtime usar como ponto de partida.
#
# "node:18-alpine" significa:
#   • node    → imagem oficial do Node.js (mantida pelo time do Node)
#   • :18     → versão 18 do Node (LTS — Long Term Support)
#   • -alpine → baseada no Alpine Linux, uma distro minúscula (~5MB).
#               A alternativa seria "node:18" (~900MB) ou "node:18-slim" (~200MB).
#               Alpine é perfeita para containers de produção.
FROM node:18-alpine

# -----------------------------------------------------------------------------
# INSTRUÇÃO WORKDIR — define o diretório de trabalho dentro do container
# -----------------------------------------------------------------------------
# Todos os comandos seguintes (COPY, RUN, CMD) serão executados a partir
# deste diretório. É como fazer `cd /app` no início do script.
# Se /app não existir, o Docker cria automaticamente.
WORKDIR /app

# -----------------------------------------------------------------------------
# INSTRUÇÃO COPY — copia arquivos do seu PC para dentro da imagem
# -----------------------------------------------------------------------------
# Copiamos APENAS os arquivos de manifesto de dependências primeiro.
# Por quê? Cache de camadas!
#
# Se você copiar o código todo de uma vez e depois rodar npm install,
# qualquer mudança em qualquer arquivo vai invalidar o cache do npm install,
# forçando reinstalar tudo. Ao separar em dois passos:
#   1. COPY package*.json  → só muda se você adicionar/remover pacotes
#   2. RUN npm install     → só roda novamente se o passo 1 mudou
#   3. COPY . .            → código-fonte (muda com frequência, mas não afeta o cache do npm)
#
# "package*.json" copia tanto o package.json quanto o package-lock.json
COPY package*.json ./

# -----------------------------------------------------------------------------
# INSTRUÇÃO RUN — executa comandos durante o BUILD da imagem
# -----------------------------------------------------------------------------
# npm install instala todas as dependências listadas no package.json.
# Isso acontece apenas durante o build da imagem, não ao iniciar o container.
#
# NOTA: Em produção usaríamos `npm ci` (mais rápido e determinístico),
# mas para dev `npm install` está ótimo.
RUN npm install

# -----------------------------------------------------------------------------
# NOTA SOBRE VOLUMES E HOT RELOAD
# -----------------------------------------------------------------------------
# Você vai notar que NÃO fazemos "COPY . ." para copiar o código-fonte aqui.
# Isso é proposital para o ambiente de DESENVOLVIMENTO.
#
# O docker-compose.yml monta a pasta ./tcc-back como volume em /app:
#   volumes:
#     - ./tcc-back:/app
#
# Isso significa que o código-fonte vive NO SEU PC e é espelhado em tempo
# real para dentro do container. Você edita no VS Code → o container já vê.
# O NestJS em modo `start:dev` detecta as mudanças e reinicia sozinho.
#
# Para PRODUÇÃO, você faria o COPY . . e buildaria o TypeScript:
#   COPY . .
#   RUN npm run build
#   CMD ["node", "dist/main.js"]

# -----------------------------------------------------------------------------
# INSTRUÇÃO EXPOSE — documenta qual porta o container usa
# -----------------------------------------------------------------------------
# EXPOSE não "abre" a porta de verdade — isso é feito no docker-compose.yml
# com a seção "ports". Serve como documentação e para ferramentas como
# o Docker Desktop saberem qual porta é a principal do container.
EXPOSE 3000

# -----------------------------------------------------------------------------
# INSTRUÇÃO CMD — comando padrão ao INICIAR o container
# -----------------------------------------------------------------------------
# Diferença entre RUN e CMD:
#   RUN  → executa durante o BUILD (para criar camadas da imagem)
#   CMD  → executa quando o container INICIA (runtime)
#
# Formato array ["executável", "arg1", "arg2"] é preferido ao formato string.
# Evita que o comando seja processado pelo shell, o que pode causar problemas
# com sinais Unix (SIGTERM para parar gracefully).
#
# `npm run start:dev` executa: nest start --watch
# O --watch ativa o hot reload — detecta mudanças nos arquivos .ts e reinicia.
CMD ["npm", "run", "start:dev"]
