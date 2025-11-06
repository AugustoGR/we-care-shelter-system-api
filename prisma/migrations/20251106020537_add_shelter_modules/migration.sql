-- CreateTable
CREATE TABLE "shelter_modules" (
    "id" TEXT NOT NULL,
    "shelterId" TEXT NOT NULL,
    "moduleKey" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "responsibleVolunteerId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "shelter_modules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "module_volunteers" (
    "id" TEXT NOT NULL,
    "moduleId" TEXT NOT NULL,
    "volunteerId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "module_volunteers_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "shelter_modules_shelterId_moduleKey_key" ON "shelter_modules"("shelterId", "moduleKey");

-- CreateIndex
CREATE UNIQUE INDEX "module_volunteers_moduleId_volunteerId_key" ON "module_volunteers"("moduleId", "volunteerId");

-- AddForeignKey
ALTER TABLE "shelter_modules" ADD CONSTRAINT "shelter_modules_shelterId_fkey" FOREIGN KEY ("shelterId") REFERENCES "shelters"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shelter_modules" ADD CONSTRAINT "shelter_modules_responsibleVolunteerId_fkey" FOREIGN KEY ("responsibleVolunteerId") REFERENCES "volunteers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "module_volunteers" ADD CONSTRAINT "module_volunteers_moduleId_fkey" FOREIGN KEY ("moduleId") REFERENCES "shelter_modules"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "module_volunteers" ADD CONSTRAINT "module_volunteers_volunteerId_fkey" FOREIGN KEY ("volunteerId") REFERENCES "volunteers"("id") ON DELETE CASCADE ON UPDATE CASCADE;
