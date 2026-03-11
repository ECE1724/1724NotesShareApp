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
// GET /api/departments/
// -----------------------
/**
get all departments
 */
router.get(
  "/",
  async (req, res, next) => {
    try {

      const result = await db.getAllDepartments()

      return res.json(result)
    } catch (e) {
      next(e);
    }
  },
);

// -----------------------
// GET /api/departments/:id
// -----------------------
/**
get department by id
 */
router.get(
  "/:id",
  async (req, res, next) => {
    try {

      const result = await db.getDepartmentById(Number(req.params.id))

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
            const department = await db.createDepartment(req.body)
            res.status(201).json(department)
        }
        catch (e){
            next(e)
        }
    }
)


export default router;
