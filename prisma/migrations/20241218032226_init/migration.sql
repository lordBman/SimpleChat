-- RenameForeignKey
ALTER TABLE "Project" RENAME CONSTRAINT "developer_fk" TO "Project_ownerID_fkey";
