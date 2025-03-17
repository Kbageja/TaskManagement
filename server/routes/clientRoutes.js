import express from 'express';
import { acceptInvite, createGroup, createSubUser, deleteGroup, deleteSubUser, generateInviteLink, getAllGroups, getGroupLevelWise, rejectInvite } from '../controllers/clientController.js';
import { isAuthenticated } from '../middleware/authenticated.js';
 const router = express.Router();

router.get("/getAllGroups",isAuthenticated,getAllGroups);
router.get("/getGroupLevel",isAuthenticated,getGroupLevelWise);
router.get("/checkInvite/:token", isAuthenticated, rejectInvite); // Route to accept an invite  
router.post("/createGroup",isAuthenticated,createGroup);
router.post("/createSubUser",createSubUser);
router.post("/inviteUser", isAuthenticated, generateInviteLink); // Route to generate an invite link  
router.post("/acceptInvite/:token", isAuthenticated, acceptInvite); // Route to accept an invite  
router.delete("/deleteGroup/:groupId", isAuthenticated, deleteGroup);
router.delete("/deleteSubUser/:groupId", isAuthenticated, deleteSubUser);


 export default router;