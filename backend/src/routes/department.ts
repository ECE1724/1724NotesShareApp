import { Router } from "express";
import { db } from "../database";
import { requireAuth } from "../middleware";

const router = Router();

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
    requireAuth,
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
