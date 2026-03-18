import { Router } from "express";
import { db } from "../database";
import * as middleware from "../middleware";
import type { User, RegisterUserInput } from "../types";

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
// GET /api/users
// -----------------------
/**
get all users
 */
router.get(
  "/",
  async (req, res, next) => {
    try {

      const result = await db.getAllUsers()

      return res.json(result)
    } catch (e) {
      next(e);
    }
  }
);

// -----------------------
// POST /api/users (Handled by better-auth /api/auth/sign-up)
// -----------------------

// -----------------------
// POST /api/users/login (Handled by better-auth /api/auth/sign-in)
// -----------------------


export default router;
