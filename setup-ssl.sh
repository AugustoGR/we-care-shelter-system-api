#!/bin/bash

# Script para configurar SSL com Let's Encrypt
# Execute este script APÓS o sistema estar funcionando com HTTP

set -e

echo "🔒 Configurando SSL para We Care Shelter System"
echo "================================================"

# Ler email do .env.production
if [ -f .env.production ]; then
    source .env.production
fi

EMAIL="${CERTBOT_EMAIL:-seu-email@exemplo.com}"
DOMAIN="${DOMAIN:-wecare-system.com}"

echo "Domínio: $DOMAIN"
echo "Email: $EMAIL"
echo ""

# Verificar se o domínio está respondendo
echo "Verificando se os domínios estão acessíveis..."
if ! curl -s -o /dev/null -w "%{http_code}" http://$DOMAIN | grep -q "200\|301\|302"; then
    echo "❌ ERRO: O domínio $DOMAIN não está respondendo"
    echo "Certifique-se que:"
    echo "1. O DNS está apontando para este servidor"
    echo "2. O Docker está rodando: docker compose --env-file .env.production -f docker-compose.prod.yml ps"
    echo "3. O Nginx está funcionando"
    exit 1
fi

echo "✅ Domínios acessíveis"

# Criar diretórios para certbot
echo "Criando diretórios para certificados..."
mkdir -p ./certbot/conf
mkdir -p ./certbot/www

# Primeiro, vamos usar a configuração sem SSL
echo "Parando containers..."
docker compose --env-file .env.production -f docker-compose.prod.yml down

# Criar configuração temporária para validação
echo "Criando configuração temporária para validação do domínio..."
cat > ./nginx/conf.d/temp-ssl-setup.conf << 'EOF'
server {
    listen 80;
    server_name wecare-system.com www.wecare-system.com api.wecare-system.com;
    
    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }

    location / {
        return 200 "OK - Aguardando SSL";
        add_header Content-Type text/plain;
    }
}
EOF

# Atualizar docker-compose para usar configuração temporária
echo "Iniciando Nginx temporário para validação..."
docker compose --env-file .env.production -f docker-compose.prod.yml up -d nginx certbot

sleep 5

# Obter certificados
echo ""
echo "Obtendo certificados SSL..."
echo "ATENÇÃO: Certifique-se de que os domínios estão apontando para este servidor!"
echo ""

docker compose --env-file .env.production -f docker-compose.prod.yml run --rm certbot certonly \
    --webroot \
    --webroot-path=/var/www/certbot \
    --email "$EMAIL" \
    --agree-tos \
    --no-eff-email \
    -d $DOMAIN \
    -d www.$DOMAIN \
    -d api.$DOMAIN

if [ $? -eq 0 ]; then
    echo "✅ Certificados obtidos com sucesso!"
    
    # Remover configuração temporária
    rm -f ./nginx/conf.d/temp-ssl-setup.conf
    
    echo ""
    echo "Reiniciando serviços com SSL..."
    docker compose --env-file .env.production -f docker-compose.prod.yml down
    docker compose --env-file .env.production -f docker-compose.prod.yml up -d
    
    echo ""
    echo "✅ SSL configurado com sucesso!"
    echo "Acesse: https://$DOMAIN e https://api.$DOMAIN"
else
    echo "❌ Falha ao obter certificados"
    echo "Verifique os logs e tente novamente"
    rm -f ./nginx/conf.d/temp-ssl-setup.conf
    exit 1
fi
