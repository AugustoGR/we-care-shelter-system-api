# 📚 Documentação Swagger

## ✅ Swagger Configurado com Sucesso!

O Swagger foi adicionado ao projeto e está completamente configurado para documentar todos os endpoints da API.

## 🚀 Como Acessar

### 1. Inicie o servidor

```bash
npm run start:dev
```

### 2. Acesse a documentação

Abra seu navegador e acesse:

**Interface Swagger UI:**
```
http://localhost:3000/api
```

**JSON da API (OpenAPI):**
```
http://localhost:3000/api-json
```

## 📋 O que foi Configurado

### Configuração Principal (main.ts)
- ✅ Swagger UI disponível em `/api`
- ✅ Documentação OpenAPI 3.0
- ✅ Autenticação JWT (Bearer Token)
- ✅ Tags organizadas por módulos
- ✅ CSS customizado
- ✅ Favicon personalizado

### Controllers Documentados

#### 🔐 AuthController (`/auth`)
- **POST /auth/login** - Login de usuário
  - Recebe email e senha
  - Retorna token JWT
  - Exemplos de requisição e resposta
  
- **POST /auth/register** - Registro de novo usuário
  - Recebe email, senha e nome
  - Retorna token JWT
  - Validações documentadas

#### 👤 UsersController (`/users`)
- **GET /users/me** - Perfil do usuário autenticado
  - Requer autenticação JWT
  - Retorna dados do usuário logado
  
- **GET /users** - Listar todos os usuários
  - Requer autenticação JWT
  - Retorna array de usuários

#### 🏠 AppController (`/`)
- **GET /** - Mensagem de boas-vindas
- **GET /health** - Health check da aplicação

### DTOs Documentados

Todos os DTOs possuem anotações Swagger:

**LoginDto:**
- `email`: Email do usuário (exemplo e validação)
- `password`: Senha (mínimo 6 caracteres)

**RegisterDto:**
- `email`: Email do usuário
- `password`: Senha (mínimo 6 caracteres)
- `name`: Nome completo

## 🔒 Testando Autenticação no Swagger

### Passo a passo:

1. **Acesse** `http://localhost:3000/api`

2. **Registre um usuário:**
   - Clique em `POST /auth/register`
   - Clique em "Try it out"
   - Preencha o JSON:
   ```json
   {
     "email": "teste@example.com",
     "password": "senha123",
     "name": "Teste Usuário"
   }
   ```
   - Clique em "Execute"
   - Copie o `access_token` da resposta

3. **Autentique-se:**
   - No topo da página, clique no botão **"Authorize" 🔓**
   - Cole o token copiado (apenas o token, sem "Bearer")
   - Clique em "Authorize"
   - Clique em "Close"

4. **Teste endpoints protegidos:**
   - Agora você pode testar `GET /users/me` e `GET /users`
   - Todos os endpoints com cadeado 🔒 agora funcionarão

## 📦 Dependências Adicionadas

```json
{
  "@nestjs/swagger": "^11.0.0",
  "swagger-ui-express": "^5.0.0"
}
```

## 🎨 Recursos do Swagger

### Tags Organizadas
- **app** - Endpoints gerais
- **auth** - Autenticação
- **users** - Gerenciamento de usuários

### Autenticação JWT
- Tipo: Bearer Token
- Formato: JWT
- Nome: JWT-auth
- Localização: Header

### Exemplos Automáticos
Todos os endpoints possuem:
- ✅ Exemplos de requisição
- ✅ Exemplos de resposta
- ✅ Códigos de status HTTP
- ✅ Descrições detalhadas
- ✅ Validações documentadas

### Responses Documentadas
Cada endpoint documenta:
- `200/201` - Sucesso
- `400` - Dados inválidos
- `401` - Não autorizado
- Exemplos de cada resposta

## 🛠️ Personalização

### Modificar Configuração

Edite `src/main.ts`:

```typescript
const config = new DocumentBuilder()
  .setTitle('Seu Título')           // Título da API
  .setDescription('Sua Descrição')  // Descrição
  .setVersion('1.0')                // Versão
  .addTag('tag', 'Descrição')       // Nova tag
  .build();
```

### Adicionar Novos Decoradores

Nos controllers:

```typescript
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('nome-do-modulo')
@Controller('rota')
export class MeuController {
  
  @Get()
  @ApiOperation({ summary: 'Descrição do endpoint' })
  @ApiResponse({ status: 200, description: 'Sucesso' })
  meuMetodo() {
    // ...
  }
}
```

Nos DTOs:

```typescript
import { ApiProperty } from '@nestjs/swagger';

export class MeuDto {
  @ApiProperty({
    description: 'Descrição do campo',
    example: 'valor de exemplo',
  })
  meuCampo: string;
}
```

## 📸 Preview

Quando você acessar `http://localhost:3000/api`, verá:

- 📚 Interface interativa do Swagger UI
- 🎯 Todos endpoints organizados por tags
- 🔍 Schemas dos DTOs
- 🔒 Botão de autorização JWT
- 🧪 Botão "Try it out" em cada endpoint
- 📝 Exemplos de request/response

## 🌐 URLs Importantes

| URL | Descrição |
|-----|-----------|
| `http://localhost:3000` | API |
| `http://localhost:3000/api` | Swagger UI |
| `http://localhost:3000/api-json` | OpenAPI JSON |
| `http://localhost:3000/health` | Health Check |

## 💡 Dicas

1. **Use o Swagger para testes rápidos** ao invés de Postman/Insomnia
2. **Mantenha os decoradores atualizados** ao adicionar novos campos
3. **Documente sempre** novos endpoints com `@ApiOperation` e `@ApiResponse`
4. **Use exemplos realistas** nos `@ApiProperty`
5. **Organize com tags** (`@ApiTags`) para facilitar navegação

## 🔄 Atualizando Documentação

Sempre que adicionar ou modificar:
- Novos endpoints → Adicionar decoradores Swagger
- Novos DTOs → Adicionar `@ApiProperty`
- Novas respostas → Adicionar `@ApiResponse`

A documentação é gerada automaticamente quando o servidor inicia!

## 📚 Recursos Adicionais

- [Documentação NestJS Swagger](https://docs.nestjs.com/openapi/introduction)
- [OpenAPI Specification](https://swagger.io/specification/)
- [Swagger UI](https://swagger.io/tools/swagger-ui/)

---

**Configurado em:** 23/10/2025  
**Versão Swagger:** 11.0.0  
**Status:** ✅ Pronto para uso
