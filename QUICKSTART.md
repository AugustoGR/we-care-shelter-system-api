# Quick Start - Deploy no Servidor

## 📁 Estrutura dos Repositórios

Os projetos são repositórios separados que devem estar no mesmo nível:

```
/var/www/
├── we-care-shelter-system-api/    # Backend (contém configs de deploy)
│   ├── docker-compose.prod.yml
│   ├── deploy.sh
│   ├── .env.production
│   ├── nginx/
│   └── ...
└── we-care-shelter-system/        # Frontend
    └── ...
```

## 🚀 Comandos Rápidos

```bash
# 0. Clonar repositórios (na VPS)
cd /var/www
git clone https://github.com/seu-usuario/we-care-shelter-system-api.git
git clone https://github.com/seu-usuario/we-care-shelter-system.git

# Navegar até a pasta da API (onde estão as configs)
cd we-care-shelter-system-api

# 1. Configurar variáveis de ambiente
cp .env.production.example .env.production
nano .env.production

# 2. Deploy completo
./deploy.sh deploy

# 3. Obter certificado SSL
./deploy.sh ssl-init

# 4. Ver logs
./deploy.sh logs

# 5. Status
./deploy.sh status
```

## 📋 Comandos Disponíveis

- `./deploy.sh build` - Construir imagens
- `./deploy.sh up` - Iniciar serviços
- `./deploy.sh down` - Parar serviços
- `./deploy.sh restart` - Reiniciar serviços
- `./deploy.sh logs [serviço]` - Ver logs
- `./deploy.sh status` - Status dos containers
- `./deploy.sh migrate` - Executar migrations
- `./deploy.sh backup` - Backup do banco
- `./deploy.sh ssl-init` - Obter SSL
- `./deploy.sh ssl-renew` - Renovar SSL
- `./deploy.sh deploy` - Deploy completo
- `./deploy.sh update` - Atualizar código
- `./deploy.sh clean` - Limpar recursos

## 📖 Documentação Completa

Veja [DEPLOY.md](./DEPLOY.md) para o guia completo passo a passo.
