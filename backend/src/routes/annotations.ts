import { Router } from "express";
import { db } from "../database";
import type { Annotation, CreateAnnotationInput, AccessLevel } from "../types";
import { emitAnnotationCreated } from "../socket";
import { requireAuth, requireFileAccess } from "../middleware";
import { prisma } from "../lib/prisma";
import sendTestEmail from "../../mailer"

const router = Router();
// Helper function
function emailContentFormater(original_content: String, reply_content: String, replay_user: String|null) {
  const mail = `${replay_user} replies "${reply_content}" to your annotation :\n"${original_content}"`
  return mail;
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
  requireAuth,
  requireFileAccess("COLLABORATOR" as AccessLevel),
  async (req, res, next) => {
    try {
      const annotation: CreateAnnotationInput = {
        fileId: Number(req.body.fileId),
        authorId: req.userId!,
        parentId: req.body.parentId ? Number(req.body.parentId) : null,
        anchorJson: req.body.anchorJson,
        body: req.body.body
      }
      if (annotation.parentId != null) {
        const parent_annot = await db.getAnnotationById(Number(annotation.parentId));
        const current_user = await db.getUserById(annotation.authorId);
        if (parent_annot!=null){
          const user_name = current_user ? current_user.name : "Someone"
          const email_content = emailContentFormater(parent_annot.body, annotation.body, user_name);
          const email_subject = `${user_name} reply to your annotation`;
          try {
            await sendTestEmail(
              parent_annot.author.email,
              email_subject,
              email_content
            );
          } catch (emailError) {
            console.error("Failed to send reply email:", emailError);
          }
        }
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
  requireAuth,
  async (req, res, next) => {
    try {
      const annotation = await prisma.annotation.findUnique({ where: { id: Number(req.params.id) } });
      if (!annotation) return res.status(404).json({ error: "Annotation not found" });

      if (annotation.authorId !== req.userId && !req.userIsAdmin) {
        return res.status(403).json({ error: "Can only delete your own annotations" });
      }

      await db.deleteAnnotation(annotation.id);
      res.status(204).json({});
    } catch (err) {
      res.status(400).json({ error: "Error deleting annotation" });
    }
  },
)

export default router;