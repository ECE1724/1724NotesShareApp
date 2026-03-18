import { Router, Response, NextFunction } from "express";
import type { Request } from "express";
import { auth } from "../lib/auth";

const router = Router();

// This is the correct way to use Better Auth with Express
// Better Auth's handler expects a Fetch API Request and Response
router.use(async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Construct the URL
    const url = new URL(
      `/api/auth${req.path}${req.url.slice(req.path.length)}`,
      `http://localhost:3000`
    );

    console.log(`[Auth] ${req.method} ${url.pathname}${url.search}`);

    // Create a Fetch API compatible request
    let body: BodyInit | undefined;
    
    if (req.method !== "GET" && req.method !== "HEAD") {
      // Convert the body to a JSON string
      body = JSON.stringify(req.body || {});
    }

    const fetchRequest = new Request(url, {
      method: req.method,
      headers: req.headers as HeadersInit,
      body: body,
    });

    // Call the auth handler
    const response = await auth.handler(fetchRequest);

    // Set response status
    res.status(response.status);

    // Set headers
    response.headers.forEach((value, key) => {
      res.setHeader(key, value);
    });

    // Send body
    const responseBody = await response.text();
    if (responseBody) {
      res.send(responseBody);
    } else {
      res.end();
    }
  } catch (error) {
    console.error("[Auth Error]", error);
    res.status(500).json({
      error: "Internal server error",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

export default router;
