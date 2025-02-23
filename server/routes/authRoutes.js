import express from 'express';
import { isLoggedIn, login, signup, verifyEmail } from '../controllers/AuthControllers.js';

 const router = express.Router();

router.post('/signup', signup);
router.post('/verifyEmail',verifyEmail)
router.post('/login', login);
router.get('/isLoggedIn',isLoggedIn);
export default router;

