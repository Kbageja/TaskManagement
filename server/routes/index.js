import { Router } from "express";
const router = Router();
import authRouter from "../routes/authRoutes.js";
import userRouter from "../routes/clientRoutes.js";
import taskRouter from "../routes/taskRoutes.js";

router.use("/auth",authRouter)
router.use("/user",userRouter)
router.use("/tasks",taskRouter)


export default router;