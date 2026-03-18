import { Router } from "express";

import userRoutes from "./routes/users";
import fileRoutes from "./routes/files";
import fileAccessRoutes from "./routes/file_access"
import courseRoutes from "./routes/course";
import departmentRoutes from "./routes/department";
import annotationRoutes from "./routes/annotations";

const router = Router();


router.use("/users", userRoutes);
router.use("/files", fileRoutes);
router.use("/fileAccess", fileAccessRoutes);
router.use("/courses", courseRoutes);
router.use("/departments", departmentRoutes);
router.use("/annotations", annotationRoutes);

export default router;
