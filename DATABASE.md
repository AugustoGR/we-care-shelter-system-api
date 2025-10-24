# Estrutura do Banco de Dados

## Tabela: users

| Campo     | Tipo      | Descrição                          | Constraints      |
|-----------|-----------|------------------------------------|------------------|
| id        | String    | Identificador único (UUID)         | PRIMARY KEY      |
| email     | String    | E-mail do usuário                  | UNIQUE, NOT NULL |
| password  | String    | Senha hasheada (bcrypt)            | NOT NULL         |
| name      | String    | Nome completo do usuário           | NOT NULL         |
| createdAt | DateTime  | Data de criação do registro        | DEFAULT NOW()    |
| updatedAt | DateTime  | Data da última atualização         | AUTO UPDATE      |

## Diagrama ER

```
┌─────────────────────────┐
│         Users           │
├─────────────────────────┤
│ id (PK)      String     │
│ email        String     │
│ password     String     │
│ name         String     │
│ createdAt    DateTime   │
│ updatedAt    DateTime   │
└─────────────────────────┘
```

## Índices

- **PRIMARY KEY**: `id`
- **UNIQUE INDEX**: `email`

## Observações

1. **Senhas**: São armazenadas com hash bcrypt (salt rounds = 10)
2. **UUIDs**: Gerados automaticamente pelo Prisma
3. **Timestamps**: Gerenciados automaticamente pelo Prisma

## Expandindo o Schema

Para adicionar novas tabelas ou campos:

1. Edite o arquivo `prisma/schema.prisma`
2. Execute `npm run prisma:migrate` para criar a migration
3. Execute `npm run prisma:generate` para atualizar o Prisma Client

### Exemplo: Adicionar campo telefone

```prisma
model User {
  id        String   @id @default(uuid())
  email     String   @unique
  password  String
  name      String
  phone     String?  // Campo opcional
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@map("users")
}
```

## Conexão com o Banco

A aplicação se conecta ao PostgreSQL usando a URL definida em `.env`:

```
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/we_care_shelter?schema=public"
```

**Formato:**
```
postgresql://[USER]:[PASSWORD]@[HOST]:[PORT]/[DATABASE]?schema=[SCHEMA]
```

## Prisma Studio

Para visualizar e editar dados diretamente no navegador:

```bash
npm run prisma:studio
```

Acessível em: `http://localhost:5555`
