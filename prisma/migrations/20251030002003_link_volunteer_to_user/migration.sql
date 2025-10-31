/*
  Warnings:

  - You are about to drop the column `email` on the `volunteers` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `volunteers` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[userId]` on the table `volunteers` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `userId` to the `volunteers` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "volunteers" DROP COLUMN "email",
DROP COLUMN "name",
ADD COLUMN     "userId" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "volunteers_userId_key" ON "volunteers"("userId");

-- AddForeignKey
ALTER TABLE "volunteers" ADD CONSTRAINT "volunteers_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
