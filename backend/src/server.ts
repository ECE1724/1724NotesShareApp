import path from "node:path";
import { fileURLToPath } from "node:url";
import express from "express";
import { errorHandler, requestLogger } from "./middleware";
import routes from "./routes";

const app = express();
const PORT = Number(process.env.PORT) || 3000;

// Middleware
app.use(express.json());
app.use(requestLogger);

// Routes
app.use("/api", routes);

// Error handling
app.use(errorHandler);

const isEntry =
  fileURLToPath(import.meta.url) ===
  path.resolve(process.argv[process.argv.length - 1]);

if (isEntry) {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

export default app;
