-- CreateTable
CREATE TABLE "Credential" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "username" TEXT,
    "email" TEXT,
    "password" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "surname" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'client'
);

-- CreateTable
CREATE TABLE "Admin" (
    "credentialID" TEXT NOT NULL PRIMARY KEY,
    CONSTRAINT "Admin_credentialID_fkey" FOREIGN KEY ("credentialID") REFERENCES "Credential" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Developer" (
    "credentialID" TEXT NOT NULL PRIMARY KEY,
    "adminID" TEXT NOT NULL,
    CONSTRAINT "Developer_credentialID_fkey" FOREIGN KEY ("credentialID") REFERENCES "Credential" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Developer_adminID_fkey" FOREIGN KEY ("adminID") REFERENCES "Admin" ("credentialID") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Client" (
    "credentialID" TEXT NOT NULL PRIMARY KEY,
    "organizationID" INTEGER,
    "projectID" INTEGER NOT NULL,
    CONSTRAINT "Client_credentialID_fkey" FOREIGN KEY ("credentialID") REFERENCES "Credential" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Client_organizationID_fkey" FOREIGN KEY ("organizationID") REFERENCES "Organization" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Client_projectID_fkey" FOREIGN KEY ("projectID") REFERENCES "Project" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Project" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "accessToken" TEXT NOT NULL,
    "ownerID" TEXT NOT NULL,
    CONSTRAINT "Project_ownerID_fkey" FOREIGN KEY ("ownerID") REFERENCES "Developer" ("credentialID") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Project_ownerID_fkey" FOREIGN KEY ("ownerID") REFERENCES "Admin" ("credentialID") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "AccessKey" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "key" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT false,
    "projectID" INTEGER NOT NULL,
    CONSTRAINT "AccessKey_projectID_fkey" FOREIGN KEY ("projectID") REFERENCES "Project" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Organization" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "projectID" INTEGER NOT NULL,
    CONSTRAINT "Organization_projectID_fkey" FOREIGN KEY ("projectID") REFERENCES "Project" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Chat" (
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

-- CreateTable
CREATE TABLE "Friend" (
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

-- CreateTable
CREATE TABLE "Group" (
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

-- CreateTable
CREATE TABLE "Member" (
    "credentialID" TEXT NOT NULL,
    "groupID" TEXT NOT NULL,
    "joined" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "role" TEXT NOT NULL DEFAULT 'member',
    "accepted" BOOLEAN NOT NULL DEFAULT false,

    PRIMARY KEY ("credentialID", "groupID"),
    CONSTRAINT "Member_credentialID_fkey" FOREIGN KEY ("credentialID") REFERENCES "Client" ("credentialID") ON DELETE RESTRICT ON UPDATE CASCADE,
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
    CONSTRAINT "Notification_recieverID_fkey" FOREIGN KEY ("recieverID") REFERENCES "Client" ("credentialID") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Admin_credentialID_key" ON "Admin"("credentialID");

-- CreateIndex
CREATE UNIQUE INDEX "Developer_credentialID_key" ON "Developer"("credentialID");

-- CreateIndex
CREATE UNIQUE INDEX "Client_credentialID_key" ON "Client"("credentialID");

-- CreateIndex
CREATE UNIQUE INDEX "Project_name_key" ON "Project"("name");

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
CREATE UNIQUE INDEX "Member_credentialID_key" ON "Member"("credentialID");
