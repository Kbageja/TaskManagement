import { Router } from "express";
const router = Router();
import authRouter from "../routes/authRoutes.js";
import userRouter from "../routes/clientRoutes.js";

router.use("/auth",authRouter)
router.use("/user",userRouter)


export default router;