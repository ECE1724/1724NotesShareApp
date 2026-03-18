import path from "node:path";
import { fileURLToPath } from "node:url";
import http from "node:http";
import express from "express";
import { errorHandler, requestLogger } from "./middleware";
import routes from "./routes";
import { initSocket } from "./socket";
import { auth } from "./lib/auth";
import { toNodeHandler } from "better-auth/node";

const app = express();
const PORT = Number(process.env.PORT) || 3000;

// Middleware
app.use(express.json());
app.use(requestLogger);

// Simple CORS for local development
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', process.env.CORS_ORIGIN || 'http://localhost:5173');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  if (req.method === 'OPTIONS') return res.sendStatus(204);
  next();
});

// Routes
app.all("/api/auth", toNodeHandler(auth));
app.all("/api/auth/*path", toNodeHandler(auth));
app.use("/api", routes);

// Error handling
app.use(errorHandler);

const server = http.createServer(app);
initSocket(server);

const isEntry =
  fileURLToPath(import.meta.url) ===
  path.resolve(process.argv[process.argv.length - 1]);

if (isEntry) {
  server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

export default app;
