import { Router } from "express";
const router = Router();
import authRouter from "../routes/authRoutes.js";


router.use("/auth",authRouter)


export default router;