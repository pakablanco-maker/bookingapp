import express from 'express';
import { register, login, getProfile, updateProfile, getPublicBusinessData, updateWorkingHours } from '../controllers/authController.js';
import authenticate from '../middleware/authenticate.js';

const router = express.Router();

// Public routes
router.post('/register', register); // POST /api/auth/register
router.post('/login', login); // POST /api/auth/login
router.get('/public/:slug', getPublicBusinessData); // GET /api/auth/public/:slug

// Protected routes
router.get('/me', authenticate, getProfile); // GET /api/auth/me
router.put('/update-profile', authenticate, updateProfile); // PUT /api/auth/update-profile
router.put('/working-hours', authenticate, updateWorkingHours); // PUT /api/auth/working-hours

export default router;
