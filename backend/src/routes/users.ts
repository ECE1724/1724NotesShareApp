import { Router } from "express";
import { db } from "../database";
import { requireAuth } from "../middleware";
import { prisma } from "../lib/prisma";
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

router.get(
  "/me",
  requireAuth,
  async (req, res, next) => {
    try {
      const user = await prisma.user.findUnique({
        where: { id: req.userId },
        select: { id: true, email: true, name: true, displayName: true, isAdmin: true },
      });
      if (!user) return res.status(404).json({ error: "User not found" });
      return res.json(user);
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
