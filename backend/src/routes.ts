import { Router } from "express";

import userRoutes from "./routes/users";
import fileRoutes from "./routes/files";

const router = Router();


router.use("/users", userRoutes);

router.use("/files", fileRoutes);

export default router;
