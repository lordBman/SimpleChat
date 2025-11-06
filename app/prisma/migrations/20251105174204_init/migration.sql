/*
  Warnings:

  - A unique constraint covering the columns `[id,organizationID,projectID]` on the table `Client` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Client_id_organizationID_projectID_key" ON "Client"("id", "organizationID", "projectID");
