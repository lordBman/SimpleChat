/*
  Warnings:

  - A unique constraint covering the columns `[requesterID,acceptorID,projectID]` on the table `Friend` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "Friend_requesterID_acceptorID_key";

-- CreateIndex
CREATE UNIQUE INDEX "Friend_requesterID_acceptorID_projectID_key" ON "Friend"("requesterID", "acceptorID", "projectID");
