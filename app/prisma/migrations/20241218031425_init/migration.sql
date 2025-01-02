/*
  Warnings:

  - You are about to drop the column `type` on the `Project` table. All the data in the column will be lost.
  - You are about to drop the `Admin` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Developer` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Admin" DROP CONSTRAINT "Admin_credentialID_fkey";

-- DropForeignKey
ALTER TABLE "Developer" DROP CONSTRAINT "Developer_adminID_fkey";

-- DropForeignKey
ALTER TABLE "Developer" DROP CONSTRAINT "Developer_credentialID_fkey";

-- DropForeignKey
ALTER TABLE "Project" DROP CONSTRAINT "admin_fk";

-- DropForeignKey
ALTER TABLE "Project" DROP CONSTRAINT "developer_fk";

-- AlterTable
ALTER TABLE "Credential" ADD COLUMN     "adminID" TEXT;

-- AlterTable
ALTER TABLE "Project" DROP COLUMN "type";

-- DropTable
DROP TABLE "Admin";

-- DropTable
DROP TABLE "Developer";

-- DropEnum
DROP TYPE "OwnerType";

-- AddForeignKey
ALTER TABLE "Credential" ADD CONSTRAINT "Credential_adminID_fkey" FOREIGN KEY ("adminID") REFERENCES "Credential"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Project" ADD CONSTRAINT "developer_fk" FOREIGN KEY ("ownerID") REFERENCES "Credential"("id") ON DELETE CASCADE ON UPDATE CASCADE;
