# We Care Shelter System API

API desenvolvida com NestJS, Prisma e PostgreSQL para o sistema We Care Shelter.

## 🚀 Tecnologias

- **NestJS** - Framework Node.js progressivo
- **Prisma** - ORM moderno para TypeScript e Node.js
- **PostgreSQL** - Banco de dados relacional
- **JWT** - Autenticação com JSON Web Tokens
- **Swagger/OpenAPI** - Documentação interativa da API
- **Docker** - Containerização
- **TypeScript** - Superset JavaScript com tipagem estática

## 📋 Pré-requisitos

- Node.js 20+
- Docker e Docker Compose
- npm ou yarn

## 🔧 Instalação

### 1. Clone o repositório (se ainda não estiver no diretório)

```bash
cd we-care-shelter-system-api
```

### 2. Instale as dependências

```bash
npm install
```

### 3. Configure as variáveis de ambiente

Copie o arquivo `.env.example` para `.env` e ajuste as configurações:

```bash
cp .env.example .env
```

### 4. Suba o banco de dados com Docker

```bash
docker-compose up -d
```

### 5. Execute as migrações do Prisma

```bash
npm run prisma:generate
npm run prisma:migrate
```

## 🏃 Executando a aplicação

### Modo de desenvolvimento

```bash
npm run start:dev
```

A API estará disponível em `http://localhost:3000`  
**Documentação Swagger:** `http://localhost:3000/api`

### Modo de produção

```bash
npm run build
npm run start:prod
```

## 📚 Documentação da API

### Swagger/OpenAPI

Acesse a documentação interativa em:
```
http://localhost:3000/api
```

A interface Swagger permite:
- ✅ Visualizar todos os endpoints
- ✅ Testar requisições diretamente
- ✅ Ver schemas dos DTOs
- ✅ Autenticar com JWT
- ✅ Ver exemplos de request/response

Veja o arquivo [SWAGGER.md](SWAGGER.md) para mais detalhes.

## 📚 Endpoints da API

### Autenticação

#### Registrar novo usuário
```http
POST /auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "senha123",
  "name": "Nome do Usuário"
}
```

#### Login
```http
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "senha123"
}
```

Retorna:
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "Nome do Usuário",
    "createdAt": "2025-10-23T...",
    "updatedAt": "2025-10-23T..."
  }
}
```

### Usuários (Rotas Protegidas)

Para acessar as rotas abaixo, inclua o token JWT no header:
```
Authorization: Bearer {seu_token_aqui}
```

#### Obter perfil do usuário logado
```http
GET /users/me
Authorization: Bearer {token}
```

#### Listar todos os usuários
```http
GET /users
Authorization: Bearer {token}
```

### Health Check

```http
GET /health
```

## 🛠️ Scripts Disponíveis

- `npm run start:dev` - Inicia o servidor em modo desenvolvimento com hot-reload
- `npm run build` - Compila o projeto
- `npm run start:prod` - Inicia o servidor em modo produção
- `npm run lint` - Executa o linter
- `npm run format` - Formata o código com Prettier
- `npm run test` - Executa os testes
- `npm run prisma:generate` - Gera o Prisma Client
- `npm run prisma:migrate` - Executa as migrações do banco
- `npm run prisma:studio` - Abre o Prisma Studio (interface visual do banco)

## 🐳 Docker

### Iniciar o banco de dados

```bash
docker-compose up -d
```

### Parar o banco de dados

```bash
docker-compose down
```

### Ver logs do banco

```bash
docker-compose logs -f postgres
```

## 📝 Estrutura do Projeto

```
src/
├── auth/                  # Módulo de autenticação
│   ├── dto/              # Data Transfer Objects
│   ├── guards/           # Guards de autenticação
│   ├── strategies/       # Estratégias Passport (JWT, Local)
│   ├── auth.controller.ts
│   ├── auth.module.ts
│   └── auth.service.ts
├── prisma/               # Configuração do Prisma
│   ├── prisma.module.ts
│   └── prisma.service.ts
├── users/                # Módulo de usuários
│   ├── dto/
│   ├── users.controller.ts
│   ├── users.module.ts
│   └── users.service.ts
├── app.controller.ts
├── app.module.ts
├── app.service.ts
└── main.ts
```

## 🔐 Segurança

- Senhas são hasheadas com bcrypt
- Autenticação JWT com tokens de 7 dias de validade
- Validação de dados com class-validator
- CORS habilitado

## 📖 Prisma

### Acessar o Prisma Studio

```bash
npm run prisma:studio
```

O Prisma Studio abrirá em `http://localhost:5555`

### Criar uma nova migration

```bash
npx prisma migrate dev --name nome_da_migration
```

## 🤝 Contribuindo

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença UNLICENSED.
