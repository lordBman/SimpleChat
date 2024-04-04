-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "Channel" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "last" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userOneID" TEXT NOT NULL,
    "userTwoID" TEXT NOT NULL,
    CONSTRAINT "Channel_userOneID_fkey" FOREIGN KEY ("userOneID") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Channel_userTwoID_fkey" FOREIGN KEY ("userTwoID") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Chat" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "message" TEXT NOT NULL,
    "created" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "delivered" BOOLEAN NOT NULL DEFAULT false,
    "senderID" TEXT NOT NULL,
    "channelID" TEXT NOT NULL,
    "referenceID" INTEGER,
    CONSTRAINT "Chat_senderID_fkey" FOREIGN KEY ("senderID") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Chat_channelID_fkey" FOREIGN KEY ("channelID") REFERENCES "Channel" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Chat_referenceID_fkey" FOREIGN KEY ("referenceID") REFERENCES "Chat" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Group" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "lastCommunicated" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "attachment" TEXT,
    "creatorID" TEXT NOT NULL,
    CONSTRAINT "Group_creatorID_fkey" FOREIGN KEY ("creatorID") REFERENCES "User" ("id") ON DELETE NO ACTION ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "GroupChat" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "message" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "senderID" TEXT NOT NULL,
    "groupID" INTEGER NOT NULL,
    "referenceID" INTEGER,
    CONSTRAINT "GroupChat_senderID_fkey" FOREIGN KEY ("senderID") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "GroupChat_groupID_fkey" FOREIGN KEY ("groupID") REFERENCES "Group" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "GroupChat_referenceID_fkey" FOREIGN KEY ("referenceID") REFERENCES "GroupChat" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Member" (
    "userID" TEXT NOT NULL,
    "groupID" INTEGER NOT NULL,
    "joined" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "role" TEXT NOT NULL DEFAULT 'member',

    PRIMARY KEY ("userID", "groupID"),
    CONSTRAINT "Member_userID_fkey" FOREIGN KEY ("userID") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Member_groupID_fkey" FOREIGN KEY ("groupID") REFERENCES "Group" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Delivered" (
    "userID" TEXT NOT NULL,
    "groupID" INTEGER NOT NULL,
    "chatID" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    CONSTRAINT "Delivered_userID_groupID_fkey" FOREIGN KEY ("userID", "groupID") REFERENCES "Member" ("userID", "groupID") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Delivered_chatID_fkey" FOREIGN KEY ("chatID") REFERENCES "GroupChat" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "message" TEXT,
    "alert" TEXT NOT NULL,
    "created" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "received" BOOLEAN NOT NULL DEFAULT false,
    "groupID" INTEGER,
    "recieverID" TEXT NOT NULL,
    CONSTRAINT "Notification_groupID_fkey" FOREIGN KEY ("groupID") REFERENCES "Group" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Notification_recieverID_fkey" FOREIGN KEY ("recieverID") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "User_id_key" ON "User"("id");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Channel_userOneID_userTwoID_key" ON "Channel"("userOneID", "userTwoID");

-- CreateIndex
CREATE UNIQUE INDEX "Group_name_key" ON "Group"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Delivered_chatID_key" ON "Delivered"("chatID");
