import { Router } from "express";
import { db } from "../database";
import type { Annotation as AnnotationType, CreateAnnotationInput } from "../types";
import { emitAnnotationCreated } from "../socket";

const router = Router();

// GET /api/annotations?fileId=1
router.get("/", async (req, res, next) => {
  try {
    const fileId = Number(req.query.fileId);
    if (!fileId) return res.status(400).json({ error: "fileId required" });

    const annotations = await (db as any).getAnnotationsByFileId(fileId);
    return res.json({ annotations });
  } catch (e) {
    next(e);
  }
});

// POST /api/annotations
router.post("/", async (req, res, next) => {
  try {
    const payload: CreateAnnotationInput = req.body;
    const created = await (db as any).createAnnotation(payload);
    emitAnnotationCreated(created);
    // Emit via Socket.IO later (server will handle)
    return res.status(201).json(created);
  } catch (e) {
    next(e);
  }
});

export default router;
