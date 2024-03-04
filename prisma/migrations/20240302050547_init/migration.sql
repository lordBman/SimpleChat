-- CreateTable
CREATE TABLE "Notification" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "message" TEXT,
    "alert" TEXT NOT NULL,
    "created" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "received" BOOLEAN NOT NULL DEFAULT false,
    "recieverID" TEXT NOT NULL,
    CONSTRAINT "Notification_recieverID_fkey" FOREIGN KEY ("recieverID") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
