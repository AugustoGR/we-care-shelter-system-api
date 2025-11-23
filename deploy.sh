#!/bin/bash

# Script de deploy rápido para We Care System
# Uso: ./deploy.sh [comando]

set -e

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Funções auxiliares
info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Verificar se .env.production existe
check_env() {
    if [ ! -f .env.production ]; then
        error "Arquivo .env.production não encontrado!"
        info "Copie o arquivo .env.production.example e configure suas variáveis"
        exit 1
    fi
}

# Build das imagens
build() {
    info "Construindo imagens Docker..."
    docker-compose -f docker-compose.prod.yml build
    info "Build concluído!"
}

# Iniciar serviços
up() {
    check_env
    info "Iniciando serviços..."
    docker-compose -f docker-compose.prod.yml up -d
    info "Serviços iniciados!"
    info "Aguardando containers ficarem prontos..."
    sleep 10
    status
}

# Parar serviços
down() {
    info "Parando serviços..."
    docker-compose -f docker-compose.prod.yml down
    info "Serviços parados!"
}

# Reiniciar serviços
restart() {
    info "Reiniciando serviços..."
    docker-compose -f docker-compose.prod.yml restart
    info "Serviços reiniciados!"
}

# Ver logs
logs() {
    SERVICE=$1
    if [ -z "$SERVICE" ]; then
        docker-compose -f docker-compose.prod.yml logs -f
    else
        docker-compose -f docker-compose.prod.yml logs -f $SERVICE
    fi
}

# Status dos containers
status() {
    info "Status dos containers:"
    docker-compose -f docker-compose.prod.yml ps
}

# Executar migrations
migrate() {
    info "Executando migrations..."
    docker-compose -f docker-compose.prod.yml exec backend npx prisma migrate deploy
    info "Migrations executadas!"
}

# Backup do banco
backup() {
    info "Criando backup do banco de dados..."
    BACKUP_FILE="backup_$(date +%Y%m%d_%H%M%S).sql"
    docker-compose -f docker-compose.prod.yml exec -T postgres pg_dump -U wecare we_care_shelter > $BACKUP_FILE
    info "Backup criado: $BACKUP_FILE"
}

# SSL - Obter certificados
ssl_init() {
    info "Obtendo certificados SSL..."
    read -p "Digite seu email: " EMAIL
    read -p "Digite o domínio principal (ex: wecare-system.com): " DOMAIN
    
    docker-compose -f docker-compose.prod.yml run --rm certbot certonly \
        --webroot \
        --webroot-path=/var/www/certbot \
        --email $EMAIL \
        --agree-tos \
        --no-eff-email \
        -d $DOMAIN \
        -d www.$DOMAIN \
        -d api.$DOMAIN
    
    info "Certificados obtidos! Agora reinicie o Nginx:"
    info "docker-compose -f docker-compose.prod.yml restart nginx"
}

# SSL - Renovar certificados
ssl_renew() {
    info "Renovando certificados SSL..."
    docker-compose -f docker-compose.prod.yml run --rm certbot renew
    docker-compose -f docker-compose.prod.yml exec nginx nginx -s reload
    info "Certificados renovados!"
}

# Deploy completo (build + up + migrate)
deploy() {
    info "Iniciando deploy completo..."
    check_env
    build
    down
    up
    sleep 15
    migrate
    info "Deploy concluído com sucesso!"
    status
}

# Atualizar código e redeploy
update() {
    info "Atualizando código..."
    git pull origin main
    deploy
}

# Limpar recursos do Docker
clean() {
    warn "Isso removerá containers, imagens e volumes não utilizados"
    read -p "Deseja continuar? (y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        info "Limpando recursos..."
        docker system prune -a -f
        info "Limpeza concluída!"
    fi
}

# Ajuda
help() {
    echo "We Care System - Script de Deploy"
    echo ""
    echo "Uso: ./deploy.sh [comando]"
    echo ""
    echo "Comandos disponíveis:"
    echo "  build       - Construir imagens Docker"
    echo "  up          - Iniciar todos os serviços"
    echo "  down        - Parar todos os serviços"
    echo "  restart     - Reiniciar todos os serviços"
    echo "  logs [svc]  - Ver logs (opcional: especificar serviço)"
    echo "  status      - Ver status dos containers"
    echo "  migrate     - Executar migrations do banco"
    echo "  backup      - Criar backup do banco de dados"
    echo "  ssl-init    - Obter certificados SSL iniciais"
    echo "  ssl-renew   - Renovar certificados SSL"
    echo "  deploy      - Deploy completo (build + up + migrate)"
    echo "  update      - Atualizar código e redeploy"
    echo "  clean       - Limpar recursos não utilizados do Docker"
    echo "  help        - Mostrar esta ajuda"
    echo ""
    echo "Exemplos:"
    echo "  ./deploy.sh deploy"
    echo "  ./deploy.sh logs backend"
    echo "  ./deploy.sh backup"
}

# Processar comando
case "$1" in
    build)
        build
        ;;
    up)
        up
        ;;
    down)
        down
        ;;
    restart)
        restart
        ;;
    logs)
        logs $2
        ;;
    status)
        status
        ;;
    migrate)
        migrate
        ;;
    backup)
        backup
        ;;
    ssl-init)
        ssl_init
        ;;
    ssl-renew)
        ssl_renew
        ;;
    deploy)
        deploy
        ;;
    update)
        update
        ;;
    clean)
        clean
        ;;
    help|--help|-h)
        help
        ;;
    *)
        error "Comando inválido: $1"
        echo ""
        help
        exit 1
        ;;
esac
