import express from 'express';
import { isAuthenticated } from '../middleware/authenticated.js';
import { createTask, deleteTask, getUserTasks, updateTask } from '../controllers/TaskController.js';
const router = express.Router();
router.get("/getUserTasks/:groupId",isAuthenticated,getUserTasks);
router.post("/createTasks",isAuthenticated,createTask);
router.put("/updateTask/:taskId",isAuthenticated,updateTask)
router.delete("/deleteTask/:taskId",isAuthenticated,deleteTask)

export default router;