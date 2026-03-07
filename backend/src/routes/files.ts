import { Router } from "express";
import { db } from "../database";
import * as middleware from "../middleware";
import type { FileItem } from "../types";

const router = Router();

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
  return `${process.env.DIGITALOCEAN_BASE}${key}`;
}

// -----------------------
// GET /api/files
// -----------------------
/**
get all files
 */
router.get(
  "/",
  async (req, res, next) => {
    try {

      const result = await db.getAllFiles()

      return res.json(result)
    } catch (e) {
      next(e);
    }
  },
);

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

export default router;
