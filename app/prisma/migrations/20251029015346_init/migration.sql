-- CreateTable
CREATE TABLE "Credential" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "username" TEXT,
    "email" TEXT,
    "password" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "Details" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "surname" TEXT NOT NULL,
    "username" TEXT,
    "email" TEXT,
    CONSTRAINT "Details_id_fkey" FOREIGN KEY ("id") REFERENCES "Credential" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "role" TEXT NOT NULL DEFAULT 'Developer',
    "adminID" TEXT,
    "created" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "User_id_fkey" FOREIGN KEY ("id") REFERENCES "Credential" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "User_id_fkey" FOREIGN KEY ("id") REFERENCES "Details" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "User_adminID_fkey" FOREIGN KEY ("adminID") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Client" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "organizationID" TEXT,
    "projectID" TEXT NOT NULL,
    "created" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "Client_id_fkey" FOREIGN KEY ("id") REFERENCES "Details" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Client_organizationID_fkey" FOREIGN KEY ("organizationID") REFERENCES "Organization" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Client_projectID_fkey" FOREIGN KEY ("projectID") REFERENCES "Project" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Project" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "ownerID" TEXT NOT NULL,
    "created" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "Project_ownerID_fkey" FOREIGN KEY ("ownerID") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "AccessKey" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "key" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT false,
    "projectID" TEXT NOT NULL,
    CONSTRAINT "AccessKey_projectID_fkey" FOREIGN KEY ("projectID") REFERENCES "Project" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Organization" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "projectID" TEXT NOT NULL,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "Organization_projectID_fkey" FOREIGN KEY ("projectID") REFERENCES "Project" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Chat" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "message" TEXT NOT NULL,
    "created" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "delivered" BOOLEAN NOT NULL DEFAULT false,
    "edited" BOOLEAN NOT NULL DEFAULT false,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "senderID" TEXT NOT NULL,
    "ownerID" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "referenceID" TEXT,
    CONSTRAINT "Chat_senderID_fkey" FOREIGN KEY ("senderID") REFERENCES "Client" ("id") ON DELETE NO ACTION ON UPDATE CASCADE,
    CONSTRAINT "Chat_ownerID_fkey" FOREIGN KEY ("ownerID") REFERENCES "Friend" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Chat_ownerID_fkey" FOREIGN KEY ("ownerID") REFERENCES "Group" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Chat_referenceID_fkey" FOREIGN KEY ("referenceID") REFERENCES "Chat" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Friend" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "created" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "requesterID" TEXT NOT NULL,
    "acceptorID" TEXT NOT NULL,
    "accepted" BOOLEAN NOT NULL DEFAULT false,
    "organizationID" TEXT,
    "projectID" TEXT NOT NULL,
    CONSTRAINT "Friend_requesterID_fkey" FOREIGN KEY ("requesterID") REFERENCES "Client" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Friend_acceptorID_fkey" FOREIGN KEY ("acceptorID") REFERENCES "Client" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Friend_organizationID_fkey" FOREIGN KEY ("organizationID") REFERENCES "Organization" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Friend_projectID_fkey" FOREIGN KEY ("projectID") REFERENCES "Project" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Group" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "last" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "attachment" TEXT,
    "created" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "creatorID" TEXT NOT NULL,
    "organizationID" TEXT,
    "projectID" TEXT NOT NULL,
    CONSTRAINT "Group_creatorID_fkey" FOREIGN KEY ("creatorID") REFERENCES "Client" ("id") ON DELETE NO ACTION ON UPDATE CASCADE,
    CONSTRAINT "Group_organizationID_fkey" FOREIGN KEY ("organizationID") REFERENCES "Organization" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Group_projectID_fkey" FOREIGN KEY ("projectID") REFERENCES "Project" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Member" (
    "id" TEXT NOT NULL,
    "groupID" TEXT NOT NULL,
    "joined" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "role" TEXT NOT NULL DEFAULT 'Member',
    "accepted" BOOLEAN NOT NULL DEFAULT false,
    "deleted" DATETIME,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    PRIMARY KEY ("id", "groupID"),
    CONSTRAINT "Member_id_fkey" FOREIGN KEY ("id") REFERENCES "Client" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Member_groupID_fkey" FOREIGN KEY ("groupID") REFERENCES "Group" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "message" TEXT,
    "alert" TEXT NOT NULL,
    "created" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "received" BOOLEAN NOT NULL DEFAULT false,
    "groupID" TEXT,
    "recieverID" TEXT NOT NULL,
    CONSTRAINT "Notification_groupID_fkey" FOREIGN KEY ("groupID") REFERENCES "Group" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Notification_recieverID_fkey" FOREIGN KEY ("recieverID") REFERENCES "Client" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Deleted" (
    "resourceID" TEXT NOT NULL,
    "on" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "type" TEXT NOT NULL,
    CONSTRAINT "Deleted_resourceID_fkey" FOREIGN KEY ("resourceID") REFERENCES "Client" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Deleted_resourceID_fkey" FOREIGN KEY ("resourceID") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Deleted_resourceID_fkey" FOREIGN KEY ("resourceID") REFERENCES "Friend" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Deleted_resourceID_fkey" FOREIGN KEY ("resourceID") REFERENCES "Group" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Deleted_resourceID_fkey" FOREIGN KEY ("resourceID") REFERENCES "Chat" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Deleted_resourceID_fkey" FOREIGN KEY ("resourceID") REFERENCES "Project" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Deleted_resourceID_fkey" FOREIGN KEY ("resourceID") REFERENCES "Organization" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Credential_id_key" ON "Credential"("id");

-- CreateIndex
CREATE UNIQUE INDEX "Details_id_key" ON "Details"("id");

-- CreateIndex
CREATE UNIQUE INDEX "Project_name_ownerID_key" ON "Project"("name", "ownerID");

-- CreateIndex
CREATE UNIQUE INDEX "AccessKey_key_key" ON "AccessKey"("key");

-- CreateIndex
CREATE UNIQUE INDEX "AccessKey_name_key" ON "AccessKey"("name");

-- CreateIndex
CREATE UNIQUE INDEX "AccessKey_projectID_name_key" ON "AccessKey"("projectID", "name");

-- CreateIndex
CREATE UNIQUE INDEX "Organization_name_projectID_key" ON "Organization"("name", "projectID");

-- CreateIndex
CREATE UNIQUE INDEX "Chat_id_ownerID_key" ON "Chat"("id", "ownerID");

-- CreateIndex
CREATE UNIQUE INDEX "Friend_requesterID_acceptorID_projectID_key" ON "Friend"("requesterID", "acceptorID", "projectID");

-- CreateIndex
CREATE UNIQUE INDEX "Group_id_key" ON "Group"("id");

-- CreateIndex
CREATE UNIQUE INDEX "Member_id_key" ON "Member"("id");

-- CreateIndex
CREATE UNIQUE INDEX "Deleted_resourceID_key" ON "Deleted"("resourceID");
