import type { NextFunction, Request, Response } from "express";
import { auth } from "./lib/auth";
import { fromNodeHeaders } from "better-auth/node";
import { prisma } from "./lib/prisma";
import type { AccessLevel } from "./types";

declare global {
  namespace Express {
    interface Request {
      userId?: string;
      userIsAdmin?: boolean;
    }
  }
}

export const requestLogger = (
  req: Request,
  _res: Response,
  next: NextFunction,
) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
};

export const errorHandler = (
  err: unknown,
  _req: Request,
  res: Response,
  next: NextFunction,
) => {
  console.error(err);
  if (res.headersSent) return next(err);
  return res.status(500).json({
    error: "Internal Server Error",
    message: "An unexpected error occurred",
  });
};

export const requireAuth = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const session = await auth.api.getSession({
      headers: fromNodeHeaders(req.headers),
    });
    if (!session?.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    req.userId = session.user.id;
    const dbUser = await prisma.user.findUnique({ where: { id: session.user.id } });
    req.userIsAdmin = dbUser?.isAdmin ?? false;
    next();
  } catch {
    return res.status(401).json({ error: "Unauthorized" });
  }
};

export const requireAdmin = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  if (!req.userIsAdmin) {
    return res.status(403).json({ error: "Admin access required" });
  }
  next();
};

const LEVEL_RANK: Record<string, number> = { VIEWER: 1, COLLABORATOR: 2, OWNER: 3 };

export function requireFileAccess(minLevel: AccessLevel) {
  return async (req: Request, res: Response, next: NextFunction) => {
    if (req.userIsAdmin) return next();

    const fileId = Number(req.params.id || req.body?.fileId);
    if (!fileId) {
      return res.status(400).json({ error: "Missing file ID" });
    }

    // Not logged in → treated as VIEWER
    if (!req.userId) {
      if (LEVEL_RANK[minLevel] <= LEVEL_RANK["VIEWER"]) return next();
      return res.status(401).json({ error: "Login required" });
    }

    // Check explicit access in FileAccess table (e.g. OWNER)
    const access = await prisma.fileAccess.findUnique({
      where: { fileId_userId: { fileId, userId: req.userId } },
    });

    // Logged-in users are implicitly COLLABORATOR;
    // OWNER only if explicitly granted in FileAccess table
    const effectiveLevel = access
      ? LEVEL_RANK[access.accessLevel]
      : LEVEL_RANK["COLLABORATOR"];

    if (effectiveLevel < LEVEL_RANK[minLevel]) {
      return res.status(403).json({ error: "Insufficient file permissions" });
    }

    next();
  };
}