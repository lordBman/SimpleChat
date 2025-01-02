/*
  Warnings:

  - The `role` column on the `Credential` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `role` column on the `Member` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Added the required column `type` to the `Chat` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "Roles" AS ENUM ('Client', 'Admin', 'Developer');

-- CreateEnum
CREATE TYPE "OwnerType" AS ENUM ('Admin', 'Developer');

-- CreateEnum
CREATE TYPE "ChatType" AS ENUM ('Group', 'Friends');

-- CreateEnum
CREATE TYPE "MemberRole" AS ENUM ('Member', 'Admin');

-- AlterTable
ALTER TABLE "Chat" ADD COLUMN     "type" "ChatType" NOT NULL;

-- AlterTable
ALTER TABLE "Credential" DROP COLUMN "role",
ADD COLUMN     "role" "Roles" NOT NULL DEFAULT 'Client';

-- AlterTable
ALTER TABLE "Member" DROP COLUMN "role",
ADD COLUMN     "role" "MemberRole" NOT NULL DEFAULT 'Member';

-- AlterTable
ALTER TABLE "Project" ADD COLUMN     "type" "OwnerType" NOT NULL DEFAULT 'Developer';

-- AddForeignKey
ALTER TABLE "Chat" ADD CONSTRAINT "friend_fk" FOREIGN KEY ("ownerID") REFERENCES "Friend"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Chat" ADD CONSTRAINT "group_fk" FOREIGN KEY ("ownerID") REFERENCES "Group"("id") ON DELETE CASCADE ON UPDATE CASCADE;
