// This file contains Express middleware functions.

import type { NextFunction, Request, Response } from "express";

// -----------------------
// Request logger middleware
// -----------------------
export const requestLogger = (
  req: Request,
  _res: Response,
  next: NextFunction,
) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
};

// -----------------------
// Error handler middleware
// -----------------------
export const errorHandler = (
  err: unknown,
  _req: Request,
  res: Response,
  next: NextFunction,
) => {
  console.error(err);

  // If a response has already been sent, let Express handle it
  if (res.headersSent) return next(err);

  return res.status(500).json({
    error: "Internal Server Error",
    message: "An unexpected error occurred",
  });
};