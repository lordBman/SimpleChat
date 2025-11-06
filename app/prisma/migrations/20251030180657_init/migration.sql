/*
  Warnings:

  - You are about to drop the column `groupID` on the `Notification` table. All the data in the column will be lost.
  - Added the required column `nType` to the `Notification` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Member_id_key";

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Notification" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "message" TEXT,
    "alert" TEXT NOT NULL,
    "created" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "received" BOOLEAN NOT NULL DEFAULT false,
    "recieverID" TEXT NOT NULL,
    "nType" TEXT NOT NULL,
    CONSTRAINT "Notification_recieverID_fkey" FOREIGN KEY ("recieverID") REFERENCES "Details" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Notification_recieverID_fkey" FOREIGN KEY ("recieverID") REFERENCES "Group" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Notification" ("alert", "created", "id", "message", "received", "recieverID") SELECT "alert", "created", "id", "message", "received", "recieverID" FROM "Notification";
DROP TABLE "Notification";
ALTER TABLE "new_Notification" RENAME TO "Notification";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
