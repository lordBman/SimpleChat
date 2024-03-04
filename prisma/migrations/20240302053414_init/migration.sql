-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Channel" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "last" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userOneID" TEXT NOT NULL,
    "userTwoID" TEXT NOT NULL,
    CONSTRAINT "Channel_userOneID_fkey" FOREIGN KEY ("userOneID") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Channel_userTwoID_fkey" FOREIGN KEY ("userTwoID") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Channel" ("id", "userOneID", "userTwoID") SELECT "id", "userOneID", "userTwoID" FROM "Channel";
DROP TABLE "Channel";
ALTER TABLE "new_Channel" RENAME TO "Channel";
CREATE UNIQUE INDEX "Channel_id_key" ON "Channel"("id");
CREATE UNIQUE INDEX "Channel_userOneID_userTwoID_key" ON "Channel"("userOneID", "userTwoID");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
