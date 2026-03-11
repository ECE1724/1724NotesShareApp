import { Router } from "express";
import { db } from "../database";

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
// GET /api/courses/department/:id
// -----------------------
/**
get all courses under a department
 */
router.get(
  "/department/:id",
  async (req, res, next) => {
    try {

      const result = await db.getDepartmentCourses(Number(req.params.id))

      return res.json(result)
    } catch (e) {
      next(e);
    }
  },
);

// -----------------------
// GET /api/courses/:id
// -----------------------
/**
get course by id
 */
router.get(
  "/:id",
  async (req, res, next) => {
    try {

      const result = await db.getCourseById(Number(req.params.id))

      return res.json(result)
    } catch (e) {
      next(e);
    }
  },
);

router.post(
    "/",
    async (req, res, next) => {
        try {
            const course = await db.createCourse(req.body)
            res.status(201).json(course)
        }
        catch (e){
            next(e)
        }
    }
)


export default router;
