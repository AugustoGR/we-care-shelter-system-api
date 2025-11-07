-- CreateEnum para ShelterRole
CREATE TYPE "ShelterRole" AS ENUM ('OWNER', 'ADMIN', 'VOLUNTEER');

-- CreateTable UserShelter
CREATE TABLE "user_shelters" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "shelterId" TEXT NOT NULL,
    "role" "ShelterRole" NOT NULL DEFAULT 'VOLUNTEER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_shelters_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_shelters_userId_shelterId_key" ON "user_shelters"("userId", "shelterId");

-- AddForeignKey
ALTER TABLE "user_shelters" ADD CONSTRAINT "user_shelters_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_shelters" ADD CONSTRAINT "user_shelters_shelterId_fkey" FOREIGN KEY ("shelterId") REFERENCES "shelters"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Migrar dados existentes: owners dos shelters
INSERT INTO "user_shelters" ("id", "userId", "shelterId", "role", "createdAt", "updatedAt")
SELECT 
    gen_random_uuid(),
    "ownerId",
    "id",
    'OWNER'::\"ShelterRole\",
    NOW(),
    NOW()
FROM "shelters"
ON CONFLICT DO NOTHING;

-- Migrar dados existentes: volunteers
INSERT INTO "user_shelters" ("id", "userId", "shelterId", "role", "createdAt", "updatedAt")
SELECT 
    gen_random_uuid(),
    v."userId",
    v."shelterId",
    CASE 
        WHEN u."role" = 'ADMIN' THEN 'ADMIN'::\"ShelterRole\"
        ELSE 'VOLUNTEER'::\"ShelterRole\"
    END,
    NOW(),
    NOW()
FROM "volunteers" v
INNER JOIN "users" u ON u."id" = v."userId"
WHERE NOT EXISTS (
    SELECT 1 FROM "user_shelters" us 
    WHERE us."userId" = v."userId" AND us."shelterId" = v."shelterId"
)
ON CONFLICT DO NOTHING;

-- Remover coluna role da tabela users (após confirmar que os dados foram migrados)
-- ALTER TABLE "users" DROP COLUMN "role";

-- DropEnum UserRole (após remover a coluna)
-- DROP TYPE "UserRole";
