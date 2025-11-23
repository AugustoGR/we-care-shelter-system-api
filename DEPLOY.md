# 🚀 Guia Completo de Deploy - We Care System

## 📋 Pré-requisitos

- ✅ VPS Ubuntu (20.04 ou superior)
- ✅ Acesso root ou sudo
- ✅ DNS configurado:
  - `wecare-system.com` → IP da VPS
  - `www.wecare-system.com` → IP da VPS
  - `api.wecare-system.com` → IP da VPS

---

## 🔧 Parte 1: Preparação do Servidor VPS

### 1.1 Conectar ao Servidor

```bash
ssh root@SEU_IP_VPS
# ou
ssh seu_usuario@SEU_IP_VPS
```

### 1.2 Atualizar Sistema

```bash
# Atualizar lista de pacotes
sudo apt update

# Atualizar pacotes instalados
sudo apt upgrade -y

# Instalar pacotes essenciais
sudo apt install -y curl wget git build-essential
```

### 1.3 Instalar Docker

```bash
# Remover versões antigas do Docker (se existirem)
sudo apt remove docker docker-engine docker.io containerd runc

# Instalar dependências
sudo apt install -y apt-transport-https ca-certificates curl software-properties-common

# Adicionar chave GPG oficial do Docker
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg

# Adicionar repositório Docker
echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# Atualizar e instalar Docker
sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io

# Verificar instalação
docker --version
```

### 1.4 Instalar Docker Compose

```bash
# Baixar Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose

# Dar permissão de execução
sudo chmod +x /usr/local/bin/docker-compose

# Verificar instalação
docker-compose --version
```

### 1.5 Configurar Usuário Docker (Opcional)

```bash
# Adicionar usuário atual ao grupo docker
sudo usermod -aG docker $USER

# Aplicar mudanças (ou faça logout/login)
newgrp docker
```

### 1.6 Configurar Firewall

```bash
# Permitir SSH
sudo ufw allow OpenSSH

# Permitir HTTP e HTTPS
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Ativar firewall
sudo ufw enable

# Verificar status
sudo ufw status
```

---

## 📦 Parte 2: Preparação do Código

### 2.1 No Seu Computador Local

```bash
# Navegar até o diretório do projeto API
cd we-care-shelter-system-api

# Criar arquivo .env.production
cp .env.production.example .env.production

# Editar .env.production com suas credenciais
nano .env.production
```

**Configurar variáveis no `.env.production`:**

```bash
# PostgreSQL Database
POSTGRES_USER=wecare
POSTGRES_PASSWORD=SuaSenhaForteDoBanco123!@#
POSTGRES_DB=we_care_shelter

# Backend
JWT_SECRET=sua_chave_secreta_jwt_muito_segura_minimo_32_caracteres_12345
DATABASE_URL=postgresql://wecare:SuaSenhaForteDoBanco123!@#@postgres:5432/we_care_shelter?schema=public

# Frontend
NEXT_PUBLIC_API_URL=https://api.wecare-system.com
```

### 2.2 Atualizar Configuração da API do Frontend

```bash
# Navegar até o projeto frontend
cd ../we-care-shelter-system

# Editar arquivo de configuração da API
nano src/services/api.ts
```

Certifique-se que está usando a variável de ambiente:

```typescript
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000',
  // ...
})
```

### 2.3 Fazer Commit nos Repositórios

**Backend (API):**
```bash
cd we-care-shelter-system-api
git add .
git commit -m "Add production deployment configuration"
git push origin main
```

**Frontend:**
```bash
cd ../we-care-shelter-system
git add .
git commit -m "Update API configuration for production"
git push origin main
```

---

## 🌐 Parte 3: Deploy no Servidor

### 3.1 Clonar Projetos na VPS

```bash
# Criar diretório para aplicações
sudo mkdir -p /var/www

# Navegar até o diretório
cd /var/www

# Clonar repositório do backend (API)
sudo git clone https://github.com/seu-usuario/we-care-shelter-system-api.git

# Clonar repositório do frontend
sudo git clone https://github.com/seu-usuario/we-care-shelter-system.git

# Ajustar permissões
sudo chown -R $USER:$USER /var/www/we-care-shelter-system-api
sudo chown -R $USER:$USER /var/www/we-care-shelter-system

# Navegar até o projeto API (onde estão as configs de deploy)
cd we-care-shelter-system-api
```

### 3.2 Configurar Variáveis de Ambiente

```bash
# Copiar arquivo de exemplo
cp .env.production.example .env.production

# Editar com suas credenciais
nano .env.production
```

### 3.3 Criar Diretórios Necessários

```bash
# Criar diretórios para SSL
mkdir -p certbot/conf
mkdir -p certbot/www

# Criar diretório para logs do nginx
mkdir -p nginx/logs
```

---

## 🔐 Parte 4: Configurar SSL com Let's Encrypt

### 4.1 Configuração Inicial do Nginx (Sem SSL)

Primeiro, vamos obter os certificados SSL. Edite temporariamente o arquivo de configuração do Nginx:

```bash
nano nginx/conf.d/wecare.conf
```

Comente as linhas SSL temporariamente e use apenas HTTP:

```nginx
# Configuração temporária para obter certificado
server {
    listen 80;
    server_name wecare-system.com www.wecare-system.com api.wecare-system.com;
    
    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }

    location / {
        return 200 'OK';
        add_header Content-Type text/plain;
    }
}
```

### 4.2 Subir Nginx Temporariamente

```bash
# Subir apenas o Nginx para obter certificado
docker-compose -f docker-compose.prod.yml up -d nginx
```

### 4.3 Obter Certificados SSL

```bash
# Obter certificado para todos os domínios
docker-compose -f docker-compose.prod.yml run --rm certbot certonly \
  --webroot \
  --webroot-path=/var/www/certbot \
  --email seu-email@exemplo.com \
  --agree-tos \
  --no-eff-email \
  -d wecare-system.com \
  -d www.wecare-system.com \
  -d api.wecare-system.com
```

### 4.4 Restaurar Configuração SSL do Nginx

```bash
# Parar Nginx
docker-compose -f docker-compose.prod.yml down

# Restaurar configuração original (descomente as linhas SSL)
nano nginx/conf.d/wecare.conf
```

Use a configuração completa com SSL que foi criada anteriormente.

---

## 🚀 Parte 5: Deploy Completo

### 5.1 Build e Iniciar Containers

```bash
# Navegar até o diretório do projeto
cd /var/www/wecare

# Build das imagens (primeira vez)
docker-compose -f docker-compose.prod.yml build

# Subir todos os serviços
docker-compose -f docker-compose.prod.yml up -d

# Verificar status dos containers
docker-compose -f docker-compose.prod.yml ps
```

### 5.2 Verificar Logs

```bash
# Ver logs de todos os serviços
docker-compose -f docker-compose.prod.yml logs -f

# Ver logs de um serviço específico
docker-compose -f docker-compose.prod.yml logs -f backend
docker-compose -f docker-compose.prod.yml logs -f frontend
docker-compose -f docker-compose.prod.yml logs -f nginx
docker-compose -f docker-compose.prod.yml logs -f postgres
```

### 5.3 Executar Migrations do Banco

```bash
# Executar migrations (se necessário)
docker-compose -f docker-compose.prod.yml exec backend npx prisma migrate deploy

# Ou popular banco com dados iniciais
docker-compose -f docker-compose.prod.yml exec backend npx prisma db seed
```

---

## ✅ Parte 6: Verificação

### 6.1 Testar Aplicação

1. **Frontend**: Acesse `https://www.wecare-system.com`
2. **Backend API**: Acesse `https://api.wecare-system.com`
3. **Swagger Docs**: Acesse `https://api.wecare-system.com/api`

### 6.2 Verificar Containers

```bash
# Listar containers rodando
docker ps

# Ver uso de recursos
docker stats

# Verificar saúde dos containers
docker-compose -f docker-compose.prod.yml ps
```

### 6.3 Testar Conectividade do Banco

```bash
# Conectar ao PostgreSQL
docker-compose -f docker-compose.prod.yml exec postgres psql -U wecare -d we_care_shelter

# Listar tabelas
\dt

# Sair
\q
```

---

## 🔄 Parte 7: Manutenção e Atualizações

### 7.1 Atualizar Código

```bash
# Parar serviços
docker-compose -f docker-compose.prod.yml down

# Atualizar código
git pull origin main

# Rebuild e reiniciar
docker-compose -f docker-compose.prod.yml build
docker-compose -f docker-compose.prod.yml up -d
```

### 7.2 Backup do Banco de Dados

```bash
# Criar backup
docker-compose -f docker-compose.prod.yml exec postgres pg_dump -U wecare we_care_shelter > backup_$(date +%Y%m%d_%H%M%S).sql

# Restaurar backup
docker-compose -f docker-compose.prod.yml exec -T postgres psql -U wecare we_care_shelter < backup_20231111_120000.sql
```

### 7.3 Ver Logs em Tempo Real

```bash
# Logs de todos os serviços
docker-compose -f docker-compose.prod.yml logs -f

# Logs de um serviço específico
docker-compose -f docker-compose.prod.yml logs -f backend
```

### 7.4 Reiniciar Serviços

```bash
# Reiniciar todos os serviços
docker-compose -f docker-compose.prod.yml restart

# Reiniciar um serviço específico
docker-compose -f docker-compose.prod.yml restart backend
```

---

## 🛡️ Parte 8: Segurança Adicional

### 8.1 Fail2Ban (Proteção contra Brute Force)

```bash
# Instalar Fail2Ban
sudo apt install -y fail2ban

# Copiar configuração
sudo cp /etc/fail2ban/jail.conf /etc/fail2ban/jail.local

# Editar configuração
sudo nano /etc/fail2ban/jail.local

# Iniciar serviço
sudo systemctl start fail2ban
sudo systemctl enable fail2ban
```

### 8.2 Configurar Backup Automático

```bash
# Criar script de backup
nano /var/www/wecare/backup.sh
```

Conteúdo do `backup.sh`:

```bash
#!/bin/bash

BACKUP_DIR="/var/backups/wecare"
DATE=$(date +%Y%m%d_%H%M%S)

# Criar diretório de backup
mkdir -p $BACKUP_DIR

# Backup do banco
docker-compose -f /var/www/wecare/docker-compose.prod.yml exec -T postgres pg_dump -U wecare we_care_shelter > $BACKUP_DIR/db_backup_$DATE.sql

# Manter apenas últimos 7 dias
find $BACKUP_DIR -name "db_backup_*.sql" -mtime +7 -delete

echo "Backup realizado com sucesso: $DATE"
```

```bash
# Dar permissão de execução
chmod +x /var/www/wecare/backup.sh

# Adicionar ao crontab (executar diariamente às 2h)
crontab -e
```

Adicione a linha:
```
0 2 * * * /var/www/wecare/backup.sh >> /var/log/wecare_backup.log 2>&1
```

### 8.3 Monitoramento

```bash
# Instalar htop para monitoramento
sudo apt install -y htop

# Ver uso de recursos
htop
```

---

## 📊 Parte 9: Monitoramento e Logs

### 9.1 Configurar Logrotate

```bash
sudo nano /etc/logrotate.d/wecare
```

Conteúdo:
```
/var/www/wecare/nginx/logs/*.log {
    daily
    missingok
    rotate 14
    compress
    delaycompress
    notifempty
    create 0640 www-data adm
    sharedscripts
}
```

### 9.2 Verificar Status do Sistema

```bash
# Status dos containers
docker-compose -f docker-compose.prod.yml ps

# Uso de disco
df -h

# Uso de memória
free -h

# Processos
top
```

---

## 🔧 Parte 10: Troubleshooting

### 10.1 Container não Inicia

```bash
# Ver logs detalhados
docker-compose -f docker-compose.prod.yml logs -f NOME_DO_SERVICO

# Verificar configuração
docker-compose -f docker-compose.prod.yml config

# Rebuild do container
docker-compose -f docker-compose.prod.yml build --no-cache NOME_DO_SERVICO
```

### 10.2 Erro de Conexão com Banco

```bash
# Verificar se o PostgreSQL está rodando
docker-compose -f docker-compose.prod.yml ps postgres

# Testar conexão
docker-compose -f docker-compose.prod.yml exec postgres psql -U wecare -d we_care_shelter -c "SELECT 1;"
```

### 10.3 Erro de Certificado SSL

```bash
# Renovar certificado manualmente
docker-compose -f docker-compose.prod.yml run --rm certbot renew

# Recarregar Nginx
docker-compose -f docker-compose.prod.yml exec nginx nginx -s reload
```

### 10.4 Limpar Recursos do Docker

```bash
# Remover containers parados
docker container prune -f

# Remover imagens não utilizadas
docker image prune -a -f

# Remover volumes não utilizados
docker volume prune -f

# Limpar tudo
docker system prune -a -f
```

---

## 📝 Comandos Úteis

```bash
# Parar todos os serviços
docker-compose -f docker-compose.prod.yml down

# Parar e remover volumes
docker-compose -f docker-compose.prod.yml down -v

# Reconstruir imagem específica
docker-compose -f docker-compose.prod.yml build --no-cache backend

# Executar comando em container
docker-compose -f docker-compose.prod.yml exec backend sh

# Ver variáveis de ambiente
docker-compose -f docker-compose.prod.yml exec backend env

# Exportar banco de dados
docker-compose -f docker-compose.prod.yml exec postgres pg_dump -U wecare we_care_shelter > backup.sql
```

---

## 🎉 Finalização

Após seguir todos os passos, seu sistema We Care estará:

- ✅ Rodando em produção com Docker
- ✅ Acessível via HTTPS com certificado SSL
- ✅ Backend na API separada
- ✅ Frontend otimizado
- ✅ Banco de dados PostgreSQL isolado
- ✅ Nginx como reverse proxy
- ✅ Backups automatizados
- ✅ Logs configurados

**URLs Finais:**
- Frontend: `https://wecare-system.com` ou `https://www.wecare-system.com`
- Backend API: `https://api.wecare-system.com`
- Documentação: `https://api.wecare-system.com/api`

---

## 📞 Suporte

Para problemas ou dúvidas:
1. Verifique os logs: `docker-compose logs -f`
2. Consulte a documentação do Docker
3. Verifique a configuração do DNS
4. Teste conectividade: `ping api.wecare-system.com`

**Bom deploy! 🚀**
