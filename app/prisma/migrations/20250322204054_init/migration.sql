/*
  Warnings:

  - Made the column `joined` on table `Member` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Member" ALTER COLUMN "joined" SET NOT NULL;
