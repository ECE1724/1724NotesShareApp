-- DropForeignKey
ALTER TABLE "Annotation" DROP CONSTRAINT "Annotation_fileId_fkey";

-- DropForeignKey
ALTER TABLE "Annotation" DROP CONSTRAINT "Annotation_parentId_fkey";

-- DropForeignKey
ALTER TABLE "FileAccess" DROP CONSTRAINT "FileAccess_fileId_fkey";

-- AddForeignKey
ALTER TABLE "FileAccess" ADD CONSTRAINT "FileAccess_fileId_fkey" FOREIGN KEY ("fileId") REFERENCES "FileItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Annotation" ADD CONSTRAINT "Annotation_fileId_fkey" FOREIGN KEY ("fileId") REFERENCES "FileItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Annotation" ADD CONSTRAINT "Annotation_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "Annotation"("id") ON DELETE CASCADE ON UPDATE CASCADE;
