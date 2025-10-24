#!/bin/bash

# Script de inicialização rápida do projeto
# Usage: ./quick-start.sh

echo "🚀 Iniciando We Care Shelter System API..."

# Cores para output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Verificar se Docker está instalado
if ! command -v docker &> /dev/null; then
    echo "❌ Docker não está instalado. Por favor, instale o Docker primeiro."
    exit 1
fi

# Subir banco de dados
echo -e "${YELLOW}📦 Iniciando PostgreSQL...${NC}"
docker compose up -d

# Aguardar banco estar pronto
echo -e "${YELLOW}⏳ Aguardando banco de dados...${NC}"
sleep 5

# Instalar dependências
echo -e "${YELLOW}📚 Instalando dependências...${NC}"
npm install

# Gerar Prisma Client
echo -e "${YELLOW}🔧 Gerando Prisma Client...${NC}"
npm run prisma:generate

# Executar migrations
echo -e "${YELLOW}🗄️  Executando migrations...${NC}"
npm run prisma:migrate

# Iniciar aplicação
echo -e "${GREEN}✅ Setup completo!${NC}"
echo -e "${GREEN}🎉 Iniciando aplicação...${NC}"
npm run start:dev
