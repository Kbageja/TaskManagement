import express from 'express';
import { isAuthenticated } from '../middleware/authenticated.js';
import { createTask, deleteTask, getPeakHours, getProductivityTrends, getTaskAnalytics, getUserTasks, updateTask } from '../controllers/TaskController.js';
const router = express.Router();
router.get("/getUserTasks/:groupId",isAuthenticated,getUserTasks);
router.get("/getUserAnalysis/:userId",isAuthenticated,getTaskAnalytics);
router.get("/getTrends/:userId",isAuthenticated,getProductivityTrends);
router.get("/getPeakHrs/:userId",isAuthenticated,getPeakHours);
router.post("/createTasks",isAuthenticated,createTask);
router.put("/updateTask",isAuthenticated,updateTask)
router.delete("/deleteTask/:taskId",isAuthenticated,deleteTask)

export default router;