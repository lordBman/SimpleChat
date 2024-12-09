/*
  Warnings:

  - A unique constraint covering the columns `[name]` on the table `Project` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "Project_name_developerID_adminID_key";

-- CreateIndex
CREATE UNIQUE INDEX "Project_name_key" ON "Project"("name");
