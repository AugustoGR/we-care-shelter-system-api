# We Care System - Deployment Structure

Este é o repositório do **backend (API)** do We Care System. Ele também contém todas as configurações de deploy em produção.

## 📁 Estrutura dos Repositórios

O sistema é composto por **2 repositórios separados**:

```
/var/www/  (ou seu diretório de projetos)
│
├── we-care-shelter-system-api/        ← ESTE REPOSITÓRIO
│   ├── src/                           (código NestJS)
│   ├── prisma/                        (database schema)
│   ├── docker-compose.prod.yml        (orquestração)
│   ├── Dockerfile.prod                (build backend)
│   ├── deploy.sh                      (script automação)
│   ├── nginx/                         (configs Nginx)
│   ├── DEPLOY.md                      (guia completo)
│   └── ...
│
└── we-care-shelter-system/            ← REPOSITÓRIO DO FRONTEND
    ├── src/                           (código Next.js)
    ├── Dockerfile.prod                (build frontend)
    └── ...
```

## 🚀 Deploy em Produção

### Pré-requisitos

1. **VPS Ubuntu** com Docker e Docker Compose instalados
2. **Domínio configurado** (DNS apontando para seu servidor):
   - `wecare-system.com`
   - `www.wecare-system.com`
   - `api.wecare-system.com`

### Instalação Rápida

```bash
# 1. Clonar ambos os repositórios no mesmo nível
cd /var/www
git clone <url-deste-repo> we-care-shelter-system-api
git clone <url-repo-frontend> we-care-shelter-system

# 2. Navegar até a API (onde estão as configs)
cd we-care-shelter-system-api

# 3. Configurar variáveis de ambiente
cp .env.production.example .env.production
nano .env.production

# 4. Executar deploy completo
./deploy.sh deploy

# 5. Obter certificados SSL
./deploy.sh ssl-init
```

### Documentação de Deploy

- **[DEPLOYMENT.md](./DEPLOYMENT.md)** - Visão geral da estrutura
- **[DEPLOY.md](./DEPLOY.md)** - Guia completo passo a passo (10 partes)
- **[QUICKSTART.md](./QUICKSTART.md)** - Referência rápida de comandos

## 🛠️ Desenvolvimento Local

### Backend (este repositório)

```bash
# Instalar dependências
npm install

# Copiar .env de exemplo
cp .env.example .env

# Subir banco de dados
docker-compose up -d

# Executar migrations
npx prisma migrate dev

# Rodar em desenvolvimento
npm run start:dev
```

API disponível em: `http://localhost:3000`

### Frontend (outro repositório)

Consulte o README do repositório `we-care-shelter-system`.

## 🐳 Docker Compose Services

O `docker-compose.prod.yml` orquestra:

- **postgres**: PostgreSQL 15
- **backend**: NestJS API (porta 3000)
- **frontend**: Next.js app (porta 3002)
- **nginx**: Reverse proxy (portas 80/443)
- **certbot**: SSL/TLS automático

## 📜 Script de Deploy

O `deploy.sh` oferece comandos para gerenciar a aplicação:

```bash
./deploy.sh build        # Construir imagens
./deploy.sh up           # Iniciar containers
./deploy.sh down         # Parar containers
./deploy.sh logs         # Ver logs
./deploy.sh status       # Status
./deploy.sh migrate      # Executar migrations
./deploy.sh backup       # Backup do banco
./deploy.sh deploy       # Deploy completo
./deploy.sh update       # Atualizar código
```

## 🌐 Arquitetura de Produção

```
Internet
    ↓
Nginx (porta 80/443)
    ├─→ www.wecare-system.com → Frontend (Next.js)
    └─→ api.wecare-system.com → Backend (NestJS)
                                      ↓
                                 PostgreSQL
```

## 📚 Documentação Adicional

- **[README.md](./README.md)** - Documentação da API
- **[SETUP.md](./SETUP.md)** - Setup de desenvolvimento
- **[SWAGGER.md](./SWAGGER.md)** - Documentação da API

## 🔒 Segurança

**IMPORTANTE**: Nunca commitar arquivos sensíveis:
- `.env.production` (credenciais reais)
- `certbot/` (certificados SSL)
- Backups do banco (`.sql`)

O `.gitignore` já está configurado para proteger esses arquivos.

## 📞 Suporte

Para problemas de deploy, consulte a **Parte 10** do [DEPLOY.md](./DEPLOY.md).

---

**Desenvolvido para facilitar o gerenciamento de abrigos e voluntários em situações de emergência.**
