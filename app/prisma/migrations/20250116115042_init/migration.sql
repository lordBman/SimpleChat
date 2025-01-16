/*
  Warnings:

  - The primary key for the `Chat` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `deleted` on the `Chat` table. All the data in the column will be lost.
  - You are about to drop the column `deleted` on the `Credential` table. All the data in the column will be lost.
  - You are about to drop the column `deleted` on the `Friend` table. All the data in the column will be lost.
  - You are about to drop the column `deleted` on the `Group` table. All the data in the column will be lost.
  - The primary key for the `Organization` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `deleted` on the `Project` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "ResourceType" AS ENUM ('Credential', 'Project', 'Group', 'Chat', 'Friend');

-- DropForeignKey
ALTER TABLE "Chat" DROP CONSTRAINT "Chat_referenceID_fkey";

-- DropForeignKey
ALTER TABLE "Client" DROP CONSTRAINT "Client_organizationID_fkey";

-- DropForeignKey
ALTER TABLE "Friend" DROP CONSTRAINT "Friend_organizationID_fkey";

-- DropForeignKey
ALTER TABLE "Group" DROP CONSTRAINT "Group_organizationID_fkey";

-- AlterTable
ALTER TABLE "Chat" DROP CONSTRAINT "Chat_pkey",
DROP COLUMN "deleted",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "referenceID" SET DATA TYPE TEXT,
ADD CONSTRAINT "Chat_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "Chat_id_seq";

-- AlterTable
ALTER TABLE "Client" ALTER COLUMN "organizationID" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "Credential" DROP COLUMN "deleted";

-- AlterTable
ALTER TABLE "Friend" DROP COLUMN "deleted",
ALTER COLUMN "organizationID" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "Group" DROP COLUMN "deleted",
ALTER COLUMN "organizationID" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "Organization" DROP CONSTRAINT "Organization_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "Organization_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "Organization_id_seq";

-- AlterTable
ALTER TABLE "Project" DROP COLUMN "deleted";

-- CreateTable
CREATE TABLE "Deleted" (
    "resourceID" TEXT NOT NULL,
    "on" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "type" "ResourceType" NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Deleted_resourceID_key" ON "Deleted"("resourceID");

-- AddForeignKey
ALTER TABLE "Client" ADD CONSTRAINT "Client_organizationID_fkey" FOREIGN KEY ("organizationID") REFERENCES "Organization"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Chat" ADD CONSTRAINT "Chat_referenceID_fkey" FOREIGN KEY ("referenceID") REFERENCES "Chat"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Friend" ADD CONSTRAINT "Friend_organizationID_fkey" FOREIGN KEY ("organizationID") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Group" ADD CONSTRAINT "Group_organizationID_fkey" FOREIGN KEY ("organizationID") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Deleted" ADD CONSTRAINT "credential_fk" FOREIGN KEY ("resourceID") REFERENCES "Credential"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Deleted" ADD CONSTRAINT "friend_fk" FOREIGN KEY ("resourceID") REFERENCES "Friend"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Deleted" ADD CONSTRAINT "group_fk" FOREIGN KEY ("resourceID") REFERENCES "Group"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Deleted" ADD CONSTRAINT "chat_fk" FOREIGN KEY ("resourceID") REFERENCES "Chat"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Deleted" ADD CONSTRAINT "project_fk" FOREIGN KEY ("resourceID") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;
