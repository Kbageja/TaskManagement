import express from 'express';
import { isLoggedIn, login, signup } from '../controllers/AuthControllers.js';

 const router = express.Router();

router.post('/signup', signup);
router.post('/login', login);
router.get('/isLoggedIn',isLoggedIn);
export default router;

