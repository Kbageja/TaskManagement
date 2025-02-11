import express from 'express';
import { createGroup, createSubUser, getAllGroups } from '../controllers/clientController.js';
import { isAuthenticated } from '../middleware/authenticated.js';
 const router = express.Router();

 router.get("/getAllGroups",isAuthenticated,getAllGroups)
 router.post("/createGroup",isAuthenticated,createGroup)
 router.post("/createSubUser",createSubUser)

 export default router;