import { Router } from "express";
import { db } from "../database";
import { requireAuth } from "../middleware";

const router = Router();

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

// -----------------------
// GET /api/courses/code/:code
// -----------------------
/**
get course by code
 */
// router.get(
//   "/code/:code",
//   async (req, res, next) => {
//     try {
//       const code = String(req.params.code);
//       const result = await db.getCourseByCode(code);
//       if (!result) return res.status(404).json({ error: 'Course not found' });
//       return res.json(result);
//     } catch (e) {
//       next(e);
//     }
//   },
// );

router.post(
    "/",
    requireAuth,
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
