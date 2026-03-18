import { Router } from "express";
import { prisma } from "../lib/prisma";
import { auth } from "../lib/auth";
import bcrypt from "bcrypt";

const router = Router();

// Sign up endpoint
router.post("/sign-up", async (req, res, next) => {
  try {
    const { email, password, name } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res
        .status(400)
        .json({ error: "User already exists with this email" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        name,
        displayName: name,
        passwordHash: hashedPassword,
        emailVerified: true,
      },
    });

    return res.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
      message: "User created successfully",
    });
  } catch (e) {
    console.error("Sign up error:", e);
    next(e);
  }
});

// Sign in endpoint
router.post("/sign-in", async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Missing email or password" });
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    // Check password
    const passwordMatched = await bcrypt.compare(password, user.passwordHash || "");

    if (!passwordMatched) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    return res.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
      message: "Signed in successfully",
    });
  } catch (e) {
    console.error("Sign in error:", e);
    next(e);
  }
});

// Get session
router.get("/session", async (req, res, next) => {
  try {
    // For now, just return a dummy session
    return res.json({
      session: null,
      message: "No session",
    });
  } catch (e) {
    next(e);
  }
});

export default router;
