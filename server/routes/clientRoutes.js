import express from 'express';
import { createGroup, createSubUser, deleteGroup, deleteSubUser, getAllGroups } from '../controllers/clientController.js';
import { isAuthenticated } from '../middleware/authenticated.js';
 const router = express.Router();

router.get("/getAllGroups",isAuthenticated,getAllGroups);
router.post("/createGroup",isAuthenticated,createGroup);
router.post("/createSubUser",createSubUser);
router.delete("/deleteGroup/:groupId", isAuthenticated, deleteGroup);
router.delete("/deleteSubUser/:groupId", isAuthenticated, deleteSubUser);


 export default router;