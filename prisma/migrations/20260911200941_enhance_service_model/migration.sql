/*
  Warnings:

  - You are about to drop the column `duration` on the `Service` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Service" DROP COLUMN "duration",
ADD COLUMN     "active" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "badge" TEXT,
ADD COLUMN     "order" INTEGER NOT NULL DEFAULT 0;
