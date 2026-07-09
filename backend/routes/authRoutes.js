import express from 'express';
import rateLimit from 'express-rate-limit';
import { register, login, getProfile, updateProfile, getPublicBusinessData, updateWorkingHours } from '../controllers/authController.js';
import authenticate from '../middleware/authenticate.js';

const router = express.Router();

// Auth rate limiter: max 5 attempts per 15 minutes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: 'Trop de tentatives de connexion. Réessayez dans 15 minutes.',
  skipSuccessfulRequests: true,
  standardHeaders: true,
  legacyHeaders: false,
});

// Public routes
router.post('/register', authLimiter, register); // POST /api/auth/register
router.post('/login', authLimiter, login); // POST /api/auth/login
router.get('/public/:slug', getPublicBusinessData); // GET /api/auth/public/:slug

// Protected routes
router.get('/me', authenticate, getProfile); // GET /api/auth/me
router.put('/update-profile', authenticate, updateProfile); // PUT /api/auth/update-profile
router.put('/working-hours', authenticate, updateWorkingHours); // PUT /api/auth/working-hours

export default router;
