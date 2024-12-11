/*
  Warnings:

  - You are about to drop the `User` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropIndex
DROP INDEX "User_id_key";

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "User";
PRAGMA foreign_keys=on;

-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Chat" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "message" TEXT NOT NULL,
    "created" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "delivered" BOOLEAN NOT NULL DEFAULT false,
    "senderID" TEXT NOT NULL,
    "ownerID" TEXT NOT NULL,
    "referenceID" INTEGER,
    CONSTRAINT "Chat_senderID_fkey" FOREIGN KEY ("senderID") REFERENCES "Client" ("credentialID") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Chat_referenceID_fkey" FOREIGN KEY ("referenceID") REFERENCES "Chat" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Chat" ("created", "delivered", "id", "message", "ownerID", "referenceID", "senderID") SELECT "created", "delivered", "id", "message", "ownerID", "referenceID", "senderID" FROM "Chat";
DROP TABLE "Chat";
ALTER TABLE "new_Chat" RENAME TO "Chat";
CREATE UNIQUE INDEX "Chat_id_ownerID_key" ON "Chat"("id", "ownerID");
CREATE TABLE "new_Group" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "last" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "attachment" TEXT,
    "creatorID" TEXT NOT NULL,
    "organizationID" INTEGER,
    "projectID" INTEGER NOT NULL,
    CONSTRAINT "Group_creatorID_fkey" FOREIGN KEY ("creatorID") REFERENCES "Client" ("credentialID") ON DELETE NO ACTION ON UPDATE CASCADE,
    CONSTRAINT "Group_organizationID_fkey" FOREIGN KEY ("organizationID") REFERENCES "Organization" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Group_projectID_fkey" FOREIGN KEY ("projectID") REFERENCES "Project" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Group" ("attachment", "creatorID", "id", "last", "name", "organizationID", "projectID") SELECT "attachment", "creatorID", "id", "last", "name", "organizationID", "projectID" FROM "Group";
DROP TABLE "Group";
ALTER TABLE "new_Group" RENAME TO "Group";
CREATE UNIQUE INDEX "Group_id_key" ON "Group"("id");
CREATE TABLE "new_Member" (
    "userID" TEXT NOT NULL,
    "groupID" TEXT NOT NULL,
    "joined" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "role" TEXT NOT NULL DEFAULT 'member',
    "accepted" BOOLEAN NOT NULL DEFAULT false,

    PRIMARY KEY ("userID", "groupID"),
    CONSTRAINT "Member_userID_fkey" FOREIGN KEY ("userID") REFERENCES "Client" ("credentialID") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Member_groupID_fkey" FOREIGN KEY ("groupID") REFERENCES "Group" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Member" ("accepted", "groupID", "joined", "role", "userID") SELECT "accepted", "groupID", "joined", "role", "userID" FROM "Member";
DROP TABLE "Member";
ALTER TABLE "new_Member" RENAME TO "Member";
CREATE TABLE "new_Friend" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "requesterID" TEXT NOT NULL,
    "acceptorID" TEXT NOT NULL,
    "accepted" BOOLEAN NOT NULL DEFAULT false,
    "organizationID" INTEGER,
    "projectID" INTEGER NOT NULL,
    CONSTRAINT "Friend_requesterID_fkey" FOREIGN KEY ("requesterID") REFERENCES "Client" ("credentialID") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Friend_acceptorID_fkey" FOREIGN KEY ("acceptorID") REFERENCES "Client" ("credentialID") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Friend_organizationID_fkey" FOREIGN KEY ("organizationID") REFERENCES "Organization" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Friend_projectID_fkey" FOREIGN KEY ("projectID") REFERENCES "Project" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Friend" ("accepted", "acceptorID", "id", "organizationID", "projectID", "requesterID") SELECT "accepted", "acceptorID", "id", "organizationID", "projectID", "requesterID" FROM "Friend";
DROP TABLE "Friend";
ALTER TABLE "new_Friend" RENAME TO "Friend";
CREATE UNIQUE INDEX "Friend_requesterID_acceptorID_projectID_key" ON "Friend"("requesterID", "acceptorID", "projectID");
CREATE TABLE "new_Notification" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "message" TEXT,
    "alert" TEXT NOT NULL,
    "created" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "received" BOOLEAN NOT NULL DEFAULT false,
    "groupID" TEXT,
    "recieverID" TEXT NOT NULL,
    CONSTRAINT "Notification_groupID_fkey" FOREIGN KEY ("groupID") REFERENCES "Group" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Notification_recieverID_fkey" FOREIGN KEY ("recieverID") REFERENCES "Client" ("credentialID") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Notification" ("alert", "created", "groupID", "id", "message", "received", "recieverID") SELECT "alert", "created", "groupID", "id", "message", "received", "recieverID" FROM "Notification";
DROP TABLE "Notification";
ALTER TABLE "new_Notification" RENAME TO "Notification";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
