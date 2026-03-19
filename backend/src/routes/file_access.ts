import { Router } from "express";
import { db } from "../database";
import { requireAuth } from "../middleware";
import { prisma } from "../lib/prisma";

const router = Router();

// GET /api/fileAccess/file/:id — get all access records for a file (only OWNER or Admin)
router.get("/file/:id", requireAuth, async (req, res, next) => {
  try {
    const fileId = Number(req.params.id);
    const access = await db.getFileAccessForUser(fileId, req.userId!);
    if (!req.userIsAdmin && (!access || access.accessLevel !== "OWNER")) {
      return res.status(403).json({ error: "Only file owner can view access list" });
    }
    const records = await db.getFileAccessByFile(fileId);
    res.status(200).json(records);
  } catch (err) {
    res.status(400).json({ error: "Error getting file access" });
  }
});

// POST /api/fileAccess — grant or update access (only OWNER or Admin)
router.post("/", requireAuth, async (req, res, next) => {
  try {
    const { fileId, userId, accessLevel } = req.body;
    const myAccess = await db.getFileAccessForUser(Number(fileId), req.userId!);
    if (!req.userIsAdmin && (!myAccess || myAccess.accessLevel !== "OWNER")) {
      return res.status(403).json({ error: "Only file owner can grant access" });
    }
    const file_access = await db.create_or_update_file_access({
      fileId: Number(fileId),
      userId: String(userId),
      accessLevel,
    });
    res.status(201).json(file_access);
  } catch (err) {
    res.status(400).json({ error: "Error creating or updating file access" });
  }
});

// DELETE /api/fileAccess — revoke access (only OWNER or Admin)
router.delete("/", requireAuth, async (req, res, next) => {
  try {
    const { fileId, userId } = req.body;
    const myAccess = await db.getFileAccessForUser(Number(fileId), req.userId!);
    if (!req.userIsAdmin && (!myAccess || myAccess.accessLevel !== "OWNER")) {
      return res.status(403).json({ error: "Only file owner can revoke access" });
    }
    await db.deleteFileAccess(Number(fileId), String(userId));
    res.status(204).json({});
  } catch (err) {
    res.status(400).json({ error: "Error revoking file access" });
  }
});

export default router;
