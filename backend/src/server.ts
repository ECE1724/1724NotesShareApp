import path from "node:path";
import { fileURLToPath } from "node:url";
import express from "express";
import http from "http";
import { errorHandler, requestLogger } from "./middleware";
import routes from "./routes";
import { initSocket } from "./socket";

const app = express();
const PORT = Number(process.env.PORT) || 3000;

// Middleware
app.use(express.json());
app.use(requestLogger);

// Routes
app.use("/api", routes);

// Error handling
app.use(errorHandler);

const server = http.createServer(app);

const isEntry =
  fileURLToPath(import.meta.url) ===
  path.resolve(process.argv[process.argv.length - 1]);

if (isEntry) {
  server.listen(PORT, () => {
    initSocket(server);
    console.log(`Server is running on port ${PORT}`);
  });
}

export default server;
