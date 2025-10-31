-- CreateTable
CREATE TABLE "animals" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "species" TEXT NOT NULL,
    "breed" TEXT,
    "age" INTEGER,
    "sex" TEXT NOT NULL,
    "health" TEXT NOT NULL,
    "care" TEXT,
    "rabies" BOOLEAN NOT NULL DEFAULT false,
    "cinomose" BOOLEAN NOT NULL DEFAULT false,
    "parvo" BOOLEAN NOT NULL DEFAULT false,
    "felina" BOOLEAN NOT NULL DEFAULT false,
    "photo" TEXT,
    "status" TEXT NOT NULL DEFAULT 'Em Cuidado',
    "shelterId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "animals_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "animals" ADD CONSTRAINT "animals_shelterId_fkey" FOREIGN KEY ("shelterId") REFERENCES "shelters"("id") ON DELETE CASCADE ON UPDATE CASCADE;
