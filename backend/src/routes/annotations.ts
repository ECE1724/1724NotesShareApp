import { Router } from "express";
import { db } from "../database";
import type { Annotation, CreateAnnotationInput } from "../types";
import { emitAnnotationCreated } from "../socket";

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

// -----------------------
// GET /api/annottions/file/:id
// -----------------------
/**
get all annotations of a file
 */
router.get(
  "/file/:id",
  async (req, res, next) => {
    try {

      const result = await db.getFileAnnotations(Number(req.params.id))

      return res.json(result)
    } catch (e) {
      next(e);
    }
  },
);

// -----------------------
// POST /api/annotations
// -----------------------
/**
create an annotation req body: {fileId:... , authorId:... , parentId:... , anchorJson:... , body: ...}
 */
router.post(
  "/",
  async (req, res, next) => {
    try {
      const annotation: CreateAnnotationInput = {
        fileId: Number(req.body.fileId),
        authorId: Number(req.body.authorId),
        parentId: req.body.parentId ? Number(req.body.parentId) : null,
        anchorJson: req.body.anchorJson,
        body: req.body.body
      }

      const create_res = await db.createAnnotation(annotation)
      emitAnnotationCreated(create_res);
      res.status(201).json(create_res)
    } catch (e) {
      next(e);
    }
  },
)

// -----------------------
// DELETE /api/annotations/:id
// -----------------------
/**
delete an annotation by id
 */
router.delete(
  "/:id",
  async (req, res, next) => {
    try{
        const deleted = await db.deleteAnnotation(Number(req.params.id))
        res.status(204).json({})
    }
    catch (err){
        res.status(400).json({error: "Error deleting annotation"})
    }
})

export default router;