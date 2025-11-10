-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Member" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userID" TEXT NOT NULL,
    "groupID" TEXT NOT NULL,
    "joined" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "role" TEXT NOT NULL DEFAULT 'Member',
    "accepted" BOOLEAN NOT NULL DEFAULT false,
    "deleted" DATETIME,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "Member_userID_fkey" FOREIGN KEY ("userID") REFERENCES "Client" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Member_groupID_fkey" FOREIGN KEY ("groupID") REFERENCES "Group" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Member" ("accepted", "deleted", "groupID", "id", "isDeleted", "joined", "role", "userID") SELECT "accepted", "deleted", "groupID", "id", "isDeleted", "joined", "role", "userID" FROM "Member";
DROP TABLE "Member";
ALTER TABLE "new_Member" RENAME TO "Member";
CREATE UNIQUE INDEX "Member_id_key" ON "Member"("id");
CREATE UNIQUE INDEX "Member_userID_groupID_key" ON "Member"("userID", "groupID");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
