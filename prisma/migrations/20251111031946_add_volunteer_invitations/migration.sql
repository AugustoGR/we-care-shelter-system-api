-- CreateEnum
CREATE TYPE "InvitationStatus" AS ENUM ('PENDING', 'ACCEPTED', 'REJECTED');

-- AlterTable
ALTER TABLE "animals" ADD COLUMN     "active" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "sheltered_people" ADD COLUMN     "active" BOOLEAN NOT NULL DEFAULT true;

-- CreateTable
CREATE TABLE "volunteer_invitations" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "shelterId" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "skills" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "status" "InvitationStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "volunteer_invitations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "volunteer_invitations_userId_shelterId_key" ON "volunteer_invitations"("userId", "shelterId");

-- AddForeignKey
ALTER TABLE "volunteer_invitations" ADD CONSTRAINT "volunteer_invitations_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "volunteer_invitations" ADD CONSTRAINT "volunteer_invitations_shelterId_fkey" FOREIGN KEY ("shelterId") REFERENCES "shelters"("id") ON DELETE CASCADE ON UPDATE CASCADE;
