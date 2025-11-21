-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_AccessKey" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "key" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT false,
    "default" BOOLEAN NOT NULL DEFAULT false,
    "projectID" TEXT NOT NULL,
    CONSTRAINT "AccessKey_projectID_fkey" FOREIGN KEY ("projectID") REFERENCES "Project" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_AccessKey" ("enabled", "id", "key", "name", "projectID") SELECT "enabled", "id", "key", "name", "projectID" FROM "AccessKey";
DROP TABLE "AccessKey";
ALTER TABLE "new_AccessKey" RENAME TO "AccessKey";
CREATE UNIQUE INDEX "AccessKey_key_key" ON "AccessKey"("key");
CREATE UNIQUE INDEX "AccessKey_name_key" ON "AccessKey"("name");
CREATE UNIQUE INDEX "AccessKey_projectID_name_key" ON "AccessKey"("projectID", "name");
CREATE TABLE "new_Project" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "ownerID" TEXT NOT NULL,
    "created" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "default" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "Project_ownerID_fkey" FOREIGN KEY ("ownerID") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Project" ("created", "id", "isDeleted", "name", "ownerID", "token") SELECT "created", "id", "isDeleted", "name", "ownerID", "token" FROM "Project";
DROP TABLE "Project";
ALTER TABLE "new_Project" RENAME TO "Project";
CREATE UNIQUE INDEX "Project_token_key" ON "Project"("token");
CREATE UNIQUE INDEX "Project_name_ownerID_key" ON "Project"("name", "ownerID");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
