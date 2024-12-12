/*
  Warnings:

  - The primary key for the `Member` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `userID` on the `Member` table. All the data in the column will be lost.
  - Added the required column `credentialID` to the `Member` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Credential" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "username" TEXT,
    "email" TEXT,
    "password" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "surname" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'client'
);
INSERT INTO "new_Credential" ("email", "id", "name", "password", "role", "surname", "username") SELECT "email", "id", "name", "password", "role", "surname", "username" FROM "Credential";
DROP TABLE "Credential";
ALTER TABLE "new_Credential" RENAME TO "Credential";
CREATE UNIQUE INDEX "Credential_id_key" ON "Credential"("id");
CREATE TABLE "new_Member" (
    "credentialID" TEXT NOT NULL,
    "groupID" TEXT NOT NULL,
    "joined" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "role" TEXT NOT NULL DEFAULT 'member',
    "accepted" BOOLEAN NOT NULL DEFAULT false,

    PRIMARY KEY ("credentialID", "groupID"),
    CONSTRAINT "Member_credentialID_fkey" FOREIGN KEY ("credentialID") REFERENCES "Client" ("credentialID") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Member_groupID_fkey" FOREIGN KEY ("groupID") REFERENCES "Group" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Member" ("accepted", "groupID", "joined", "role") SELECT "accepted", "groupID", "joined", "role" FROM "Member";
DROP TABLE "Member";
ALTER TABLE "new_Member" RENAME TO "Member";
CREATE UNIQUE INDEX "Member_credentialID_key" ON "Member"("credentialID");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
