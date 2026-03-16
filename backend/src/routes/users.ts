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
// POST /api/users
// -----------------------
/**
create user / user register, req body takes {email:... , display_name:... , password:...}
 */
router.post(
  "/",
  async (req, res, next) => {
    try {
      const registerUser = {
        email: req.body.email,
        displayName: req.body.display_name,
        password: req.body.password
      }

      const result = await db.createUser(registerUser)

      return res.status(201).json(result);
    } catch (e) {
      next(e);
    }
  }
);

  // -----------------------
  // POST /api/users/login
  // -----------------------
  /**
  User Login req body takes {email:... , password:...}
  */
 router.post(
  "/login",
  async (req, res, next) => {
    try {
      const loginInput = {
        email: req.body.email,
        password: req.body.password
      };

      const result = await db.loginUser(loginInput);

      return res.json(result);
    } catch (e) {
      next(e);
    }
  },
);


export default router;
