/*
  Warnings:

  - The primary key for the `Admin` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `Admin` table. All the data in the column will be lost.
  - The primary key for the `Client` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `Client` table. All the data in the column will be lost.
  - The primary key for the `Developer` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `Developer` table. All the data in the column will be lost.
  - Added the required column `credentialID` to the `Admin` table without a default value. This is not possible if the table is not empty.
  - Added the required column `credentialID` to the `Client` table without a default value. This is not possible if the table is not empty.
  - Added the required column `credentialID` to the `Developer` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Admin" (
    "credentialID" TEXT NOT NULL PRIMARY KEY,
    CONSTRAINT "Admin_credentialID_fkey" FOREIGN KEY ("credentialID") REFERENCES "Credential" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
DROP TABLE "Admin";
ALTER TABLE "new_Admin" RENAME TO "Admin";
CREATE UNIQUE INDEX "Admin_credentialID_key" ON "Admin"("credentialID");
CREATE TABLE "new_Client" (
    "credentialID" TEXT NOT NULL PRIMARY KEY,
    "organizationID" INTEGER,
    "projectID" INTEGER NOT NULL,
    CONSTRAINT "Client_credentialID_fkey" FOREIGN KEY ("credentialID") REFERENCES "Credential" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Client_organizationID_fkey" FOREIGN KEY ("organizationID") REFERENCES "Organization" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Client_projectID_fkey" FOREIGN KEY ("projectID") REFERENCES "Project" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Client" ("organizationID", "projectID") SELECT "organizationID", "projectID" FROM "Client";
DROP TABLE "Client";
ALTER TABLE "new_Client" RENAME TO "Client";
CREATE UNIQUE INDEX "Client_credentialID_key" ON "Client"("credentialID");
CREATE TABLE "new_Developer" (
    "credentialID" TEXT NOT NULL PRIMARY KEY,
    "adminID" TEXT NOT NULL,
    CONSTRAINT "Developer_credentialID_fkey" FOREIGN KEY ("credentialID") REFERENCES "Credential" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Developer_adminID_fkey" FOREIGN KEY ("adminID") REFERENCES "Admin" ("credentialID") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Developer" ("adminID") SELECT "adminID" FROM "Developer";
DROP TABLE "Developer";
ALTER TABLE "new_Developer" RENAME TO "Developer";
CREATE UNIQUE INDEX "Developer_credentialID_key" ON "Developer"("credentialID");
CREATE TABLE "new_Project" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "accessToken" TEXT NOT NULL,
    "developerID" TEXT,
    "adminID" TEXT,
    CONSTRAINT "Project_developerID_fkey" FOREIGN KEY ("developerID") REFERENCES "Developer" ("credentialID") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Project_adminID_fkey" FOREIGN KEY ("adminID") REFERENCES "Admin" ("credentialID") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Project" ("accessToken", "adminID", "developerID", "id", "name") SELECT "accessToken", "adminID", "developerID", "id", "name" FROM "Project";
DROP TABLE "Project";
ALTER TABLE "new_Project" RENAME TO "Project";
CREATE UNIQUE INDEX "Project_name_key" ON "Project"("name");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
