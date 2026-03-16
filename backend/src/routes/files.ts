import { Router } from "express";
import { db } from "../database";
import * as middleware from "../middleware";
import type { FileItem } from "../types";
import multer from "multer";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { s3 } from "../services/spacesClient";


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
  if (!key) return key;
  // if key already appears to be a full URL, return as-is
  if (typeof key === 'string' && (key.startsWith('http://') || key.startsWith('https://'))) {
    return key;
  }
  const base = process.env.FILE_BUCKET_BASE || process.env.VITE_SPACES_BASE || '';
  if (!base) return key;
  // remove leading slash from key if present
  const normalizedKey = key.startsWith('/') ? key.slice(1) : key;
  // ensure single slash between base and key
  const sep = base.endsWith('/') ? '' : '/';
  return `${base}${sep}${normalizedKey}`;
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

      // Map stored file keys to full public URLs
      const mapped = {
        ...result,
        files: result.files.map((f: any) => ({
          ...f,
          fileUrl: buildFileUrl(f.fileUrl),
        })),
      };

      return res.json(mapped);
      
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
        const ownerId = Number(req.body.ownerId)
        console.log('course id: ', Number(courseId))
        console.log('owner id: ', Number(ownerId))
        console.log('req.body keys:', Object.keys(req.body))
        console.log('file present?', !!req.file)
        if (!file) return res.status(400).json({error: "No file uploaded"});

        const key = `${Date.now()}-${file.originalname}`;

        console.log('Preparing PutObjectCommand with key:', key, 'mimetype:', file.mimetype, 'size:', file.size)

        const command = new PutObjectCommand({
            Bucket: "ece1724-final-project",
            Key: key,
            Body: file.buffer,
            ContentType: file.mimetype,
            ACL: "public-read"
        });

        try {
          await s3.send(command); // <-- Using the client
          console.log('s3.send succeeded for key:', key)
        } catch (s3err) {
          console.error('s3.send error:', s3err);
          return res.status(500).json({ error: 'S3 upload failed', details: (s3err as any)?.message || String(s3err) });
        }

        const fileUrl = `${key}`;
        console.log('file url: ', fileUrl)
        const file_info: FileItem = {
            courseId: courseId,
            ownerId: ownerId,
            title: file.originalname,
            fileUrl: fileUrl,
        }
        const created_file = await db.create_file(file_info)
        // Return created file with a full public URL
        const created_with_url = {
          ...created_file,
          fileUrl: buildFileUrl((created_file as any).fileUrl || fileUrl),
        };
        res.status(200).json(created_with_url)

    }
    catch (err){
        console.error('upload catch error:', err)
        const message = isErrorWithMessage(err) ? err.message : 'Error uploading file'
        res.status(400).json({error: message})
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
