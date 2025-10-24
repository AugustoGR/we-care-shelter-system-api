# Exemplos de Requisições da API

## Teste com curl

### 1. Health Check
```bash
curl http://localhost:3000/health
```

### 2. Registrar um novo usuário
```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Usuário Teste",
    "email": "teste@example.com",
    "password": "senha123"
  }'
```

### 3. Login
```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "teste@example.com",
    "password": "senha123"
  }'
```

**Salve o token retornado para usar nas próximas requisições!**

### 4. Obter perfil do usuário (precisa do token)
```bash
# Substitua SEU_TOKEN_AQUI pelo token recebido no login
curl http://localhost:3000/users/me \
  -H "Authorization: Bearer SEU_TOKEN_AQUI"
```

### 5. Listar todos os usuários (precisa do token)
```bash
# Substitua SEU_TOKEN_AQUI pelo token recebido no login
curl http://localhost:3000/users \
  -H "Authorization: Bearer SEU_TOKEN_AQUI"
```

## Teste com Postman/Insomnia

### 1. Criar novo usuário (Register)
- **Método:** POST
- **URL:** `http://localhost:3000/auth/register`
- **Headers:** 
  - `Content-Type: application/json`
- **Body (raw JSON):**
```json
{
  "name": "Usuário Teste",
  "email": "teste@example.com",
  "password": "senha123"
}
```

**Validações:**
- `name`: obrigatório, deve ser uma string
- `email`: obrigatório, deve ser um email válido
- `password`: obrigatório, mínimo 6 caracteres

### 2. Login
- **Método:** POST
- **URL:** `http://localhost:3000/auth/login`
- **Headers:** 
  - `Content-Type: application/json`
- **Body (raw JSON):**
```json
{
  "email": "teste@example.com",
  "password": "senha123"
}
```

**Resposta esperada:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid-do-usuario",
    "email": "teste@example.com",
    "name": "Usuário Teste",
    "createdAt": "2025-10-23T...",
    "updatedAt": "2025-10-23T..."
  }
}
```

### 3. Obter perfil (Rota protegida)
- **Método:** GET
- **URL:** `http://localhost:3000/users/me`
- **Headers:** 
  - `Authorization: Bearer {seu_token_aqui}`

### 4. Listar usuários (Rota protegida)
- **Método:** GET
- **URL:** `http://localhost:3000/users`
- **Headers:** 
  - `Authorization: Bearer {seu_token_aqui}`

## Teste com HTTPie

### 1. Registrar usuário
```bash
http POST localhost:3000/auth/register \
  email="teste@example.com" \
  password="senha123" \
  name="Usuário Teste"
```

### 2. Login
```bash
http POST localhost:3000/auth/login \
  email="teste@example.com" \
  password="senha123"
```

### 3. Obter perfil
```bash
http GET localhost:3000/users/me \
  Authorization:"Bearer SEU_TOKEN_AQUI"
```

## Validações

A API valida os seguintes campos:

### Register / Login
- **email:** Deve ser um e-mail válido
- **password:** Mínimo 6 caracteres
- **name:** Obrigatório (apenas no register)

### Erros comuns

**400 Bad Request:**
```json
{
  "statusCode": 400,
  "message": [
    "email must be an email",
    "password must be longer than or equal to 6 characters"
  ],
  "error": "Bad Request"
}
```

**401 Unauthorized:**
```json
{
  "statusCode": 401,
  "message": "Invalid credentials"
}
```

**401 Token inválido:**
```json
{
  "statusCode": 401,
  "message": "Unauthorized"
}
```
