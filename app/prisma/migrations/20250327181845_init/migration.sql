-- AlterEnum
ALTER TYPE "ResourceType" ADD VALUE 'Organization';

-- AlterTable
ALTER TABLE "Organization" ADD COLUMN     "isDeleted" BOOLEAN NOT NULL DEFAULT false;

-- AddForeignKey
ALTER TABLE "Deleted" ADD CONSTRAINT "organization_fk" FOREIGN KEY ("resourceID") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;
