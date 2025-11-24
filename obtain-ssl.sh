#!/bin/bash

# Script para obter certificados SSL usando Certbot
# Este script deve ser executado DEPOIS que os domínios estiverem acessíveis via HTTP

set -e

echo "🔐 Configurando SSL para We Care Shelter System"
echo "================================================"

# Configurações
DOMAINS=("wecare-system.com" "www.wecare-system.com" "api.wecare-system.com")
EMAIL="augusto.garciadarosa@gmail.com"  # ALTERE ISSO!
STAGING=0  # 0 = produção, 1 = teste (staging)

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Verificar se o email foi alterado
if [ "$EMAIL" = "seu-email@example.com" ]; then
    echo -e "${RED}❌ ERRO: Você precisa alterar o EMAIL no script!${NC}"
    echo "   Edite o arquivo setup-ssl.sh e mude a variável EMAIL"
    exit 1
fi

# Verificar se os domínios estão acessíveis
echo ""
echo "📡 Verificando acessibilidade dos domínios..."
for domain in "${DOMAINS[@]}"; do
    echo -n "   Testando $domain... "
    if curl -s -I "http://$domain" > /dev/null 2>&1; then
        echo -e "${GREEN}✓${NC}"
    else
        echo -e "${RED}✗ Falhou!${NC}"
        echo -e "${RED}   Domínio $domain não está acessível via HTTP${NC}"
        echo "   Certifique-se de que:"
        echo "   1. O DNS está configurado corretamente"
        echo "   2. A porta 80 está aberta"
        echo "   3. O Nginx está rodando"
        exit 1
    fi
done

# Criar diretórios necessários
echo ""
echo "📁 Criando diretórios..."
mkdir -p certbot/www
mkdir -p certbot/conf

# Garantir que Nginx está rodando
echo ""
echo "🔄 Garantindo que Nginx está rodando..."
docker compose --env-file .env.production -f docker-compose.prod.yml up -d nginx
sleep 3

# Configurar opções do certbot
CERTBOT_OPTS="--webroot --webroot-path=/var/www/certbot"
if [ $STAGING -eq 1 ]; then
    CERTBOT_OPTS="$CERTBOT_OPTS --staging"
    echo -e "${YELLOW}⚠️  Modo STAGING ativado (certificados de teste)${NC}"
fi

# Obter certificados para cada domínio
echo ""
echo "🔒 Obtendo certificados SSL..."

# Frontend domains
echo ""
echo "📝 Certificado para wecare-system.com..."
docker run --rm \
    -v "$(pwd)/certbot/www:/var/www/certbot:rw" \
    -v "$(pwd)/certbot/conf:/etc/letsencrypt:rw" \
    --network we-care-shelter-system-api_wecare_network \
    certbot/certbot certonly \
    $CERTBOT_OPTS \
    --email "$EMAIL" \
    --agree-tos \
    --no-eff-email \
    -d wecare-system.com \
    -d www.wecare-system.com

# Backend domain
echo ""
echo "📝 Certificado para api.wecare-system.com..."
docker run --rm \
    -v "$(pwd)/certbot/www:/var/www/certbot:rw" \
    -v "$(pwd)/certbot/conf:/etc/letsencrypt:rw" \
    --network we-care-shelter-system-api_wecare_network \
    certbot/certbot certonly \
    $CERTBOT_OPTS \
    --email "$EMAIL" \
    --agree-tos \
    --no-eff-email \
    -d api.wecare-system.com

# Renomear configuração do Nginx para usar SSL
echo ""
echo "🔧 Ativando configuração SSL do Nginx..."
if [ -f nginx/conf.d/default.conf ]; then
    mv nginx/conf.d/default.conf nginx/conf.d/default-http-only.conf.bak
    echo "   ✓ Backup da config HTTP: default-http-only.conf.bak"
fi

if [ -f nginx/conf.d/wecare-ssl.conf.disabled ]; then
    mv nginx/conf.d/wecare-ssl.conf.disabled nginx/conf.d/wecare-ssl.conf
    echo "   ✓ Config SSL ativada: wecare-ssl.conf"
elif [ -f nginx/conf.d/wecare-ssl.conf.bak ]; then
    mv nginx/conf.d/wecare-ssl.conf.bak nginx/conf.d/wecare-ssl.conf
    echo "   ✓ Config SSL ativada: wecare-ssl.conf"
fi

# Reiniciar serviços
echo ""
echo "🔄 Reiniciando serviços..."
docker compose --env-file .env.production -f docker-compose.prod.yml up -d

# Aguardar Nginx iniciar
echo ""
echo "⏳ Aguardando Nginx inicializar..."
sleep 5

# Verificar se HTTPS está funcionando
echo ""
echo "🧪 Testando HTTPS..."
for domain in "wecare-system.com" "api.wecare-system.com"; do
    echo -n "   Testando https://$domain... "
    if curl -s -I "https://$domain" > /dev/null 2>&1; then
        echo -e "${GREEN}✓${NC}"
    else
        echo -e "${YELLOW}⚠️  Ainda não acessível (pode levar alguns segundos)${NC}"
    fi
done

echo ""
echo -e "${GREEN}✅ Configuração SSL concluída!${NC}"
echo ""
echo "📋 Próximos passos:"
echo "   1. Teste os sites:"
echo "      - https://wecare-system.com"
echo "      - https://api.wecare-system.com"
echo "   2. Os certificados serão renovados automaticamente"
echo "   3. Verifique os logs: docker compose -f docker-compose.prod.yml logs nginx"
echo ""
echo "📌 Notas importantes:"
echo "   - Certificados Let's Encrypt expiram em 90 dias"
echo "   - O container certbot renova automaticamente a cada 12 horas"
echo "   - Certificados estão em: ./certbot/conf/live/"
echo ""
