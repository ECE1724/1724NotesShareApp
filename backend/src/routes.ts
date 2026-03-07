import { Router } from "express";

import userRoutes from "./routes/users";
import fileRoutes from "./routes/files";
import courseRoutes from "./routes/course";
import departmentRoutes from "./routes/department";

const router = Router();


router.use("/users", userRoutes);
router.use("/files", fileRoutes);
router.use("/courses", courseRoutes);
router.use("/departments", departmentRoutes);

export default router;
