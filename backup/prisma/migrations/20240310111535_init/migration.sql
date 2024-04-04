/*
  Warnings:

  - You are about to drop the column `userOneID` on the `Channel` table. All the data in the column will be lost.
  - You are about to drop the column `userTwoID` on the `Channel` table. All the data in the column will be lost.
  - Added the required column `friendsID` to the `Channel` table without a default value. This is not possible if the table is not empty.

*/
-- CreateTable
CREATE TABLE "Friend" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "requesterID" TEXT NOT NULL,
    "accepterID" TEXT NOT NULL,
    "accepted" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "Friend_requesterID_fkey" FOREIGN KEY ("requesterID") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Friend_accepterID_fkey" FOREIGN KEY ("accepterID") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "friendID" TEXT,
    CONSTRAINT "User_friendID_fkey" FOREIGN KEY ("friendID") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_User" ("email", "id", "name", "password") SELECT "email", "id", "name", "password" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_id_key" ON "User"("id");
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE TABLE "new_Channel" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "last" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "friendsID" TEXT NOT NULL,
    CONSTRAINT "Channel_friendsID_fkey" FOREIGN KEY ("friendsID") REFERENCES "Friend" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Channel" ("id", "last") SELECT "id", "last" FROM "Channel";
DROP TABLE "Channel";
ALTER TABLE "new_Channel" RENAME TO "Channel";
CREATE UNIQUE INDEX "Channel_friendsID_key" ON "Channel"("friendsID");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;

-- CreateIndex
CREATE UNIQUE INDEX "Friend_requesterID_accepterID_key" ON "Friend"("requesterID", "accepterID");
