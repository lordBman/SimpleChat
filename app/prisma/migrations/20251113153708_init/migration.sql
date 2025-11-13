-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Details" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "surname" TEXT NOT NULL,
    "username" TEXT,
    "email" TEXT
);
INSERT INTO "new_Details" ("email", "id", "name", "surname", "username") SELECT "email", "id", "name", "surname", "username" FROM "Details";
DROP TABLE "Details";
ALTER TABLE "new_Details" RENAME TO "Details";
CREATE UNIQUE INDEX "Details_id_key" ON "Details"("id");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
