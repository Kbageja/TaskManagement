import express from 'express';
import { isLoggedIn, login, logout, signup, verifyEmail } from '../controllers/AuthControllers.js';

 const router = express.Router();

router.post('/signup', signup);
router.post('/verifyEmail',verifyEmail)
router.post('/logout',logout)
router.post('/login', login);
router.get('/isLoggedIn',isLoggedIn);
export default router;

