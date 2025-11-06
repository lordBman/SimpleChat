/*
  Warnings:

  - You are about to drop the column `username` on the `Credential` table. All the data in the column will be lost.
  - Made the column `email` on table `Credential` required. This step will fail if there are existing NULL values in that column.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Credential" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL
);
INSERT INTO "new_Credential" ("email", "id", "password") SELECT "email", "id", "password" FROM "Credential";
DROP TABLE "Credential";
ALTER TABLE "new_Credential" RENAME TO "Credential";
CREATE UNIQUE INDEX "Credential_id_key" ON "Credential"("id");
CREATE UNIQUE INDEX "Credential_email_key" ON "Credential"("email");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
