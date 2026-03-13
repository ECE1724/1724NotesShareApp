import { Router } from "express";
import { db } from "../database";
import * as middleware from "../middleware";
import type { FileItem } from "../types";
import multer from "multer";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { s3 } from "../services/spaceClient"


// interface MulterRequest extends Request {
//     file: Express.Multer.File; // for single file upload
// }

const router = Router();
const upload = multer()

// -----------------------
// Helper (provided)
// -----------------------
function isErrorWithMessage(e: unknown): e is { message: string } {
  return (
    typeof e === "object" &&
    e !== null &&
    "message" in e &&
    typeof (e as { message?: unknown }).message === "string"
  );
}

function buildFileUrl(key: string): string {
  return `${process.env.FILE_BUCKET_BASE}${key}`;
}

// -----------------------
// GET /api/files/:id
// -----------------------
/**
 * Get a single file by id.
 */
router.get(
  "/:id",
  async (_req, res, next) => {
    try {
      const file = await db.getFileById(Number(_req.params.id));

      if (file == null) {
        return res.status(404).json({ error: "File not found" });
      } else {
        return res.json({
          ...file,
          fileUrl: buildFileUrl(file.fileUrl)
        });
      }
    } catch (e) {
      next(e);
    }
  },
);

// -----------------------
// GET /api/files/course/:id
// -----------------------
/**
 * Get all files under a single course
 */
router.get(
  "/course/:id",
  async (_req, res, next) => {
    try {
      const result = await db.getCourseFiles(Number(_req.params.id));

      return res.json(result);
      
    } catch (e) {
      next(e);
    }
  },
);

// -----------------------
// POST /api/files/
// -----------------------
/**
 *  Upload a single file
 */
router.post("/", upload.single("file"), async (req, res) => {
    try {
        const file = req.file;
        const courseId = Number(req.body.courseId)
        console.log('course id: ', Number(courseId))
        const ownerId = Number(req.body.ownerId)
        console.log('owner id: ', Number(ownerId))
        console.log(req.body)
        console.log(req.file)
        if (!file) return res.status(400).json({error: "No file uploaded"});

        const key = `${Date.now()}-${file.originalname}`;

        const command = new PutObjectCommand({
            Bucket: "ece1724-final-project",
            Key: key,
            Body: file.buffer,
            ContentType: file.mimetype,
            ACL: "public-read"
        });

        await s3.send(command); // <-- Using the client
        console.log("Reached")

        const fileUrl = `${key}`;
        console.log('file url: ', fileUrl)
        const file_info: FileItem = {
            courseId: courseId,
            ownerId: ownerId,
            title: file.originalname,
            fileUrl: fileUrl,
        }
        const created_file = await db.create_file(file_info)
        res.status(200).json(created_file)

    }
    catch (err){
        res.status(400).json({error: "Error uploading file"})
    }
});

router.delete("/:id", async (_req, res, next) => {
    try{
        const deleted = await db.delete_file(Number(_req.params.id))
        res.status(204).json({})
    }
    catch (err){
        res.status(400).json({error: "Error deleting files"})
    }
})

export default router;
