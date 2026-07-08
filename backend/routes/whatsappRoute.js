import express from 'express';
import { setupWhatsAppForBusiness, getWhatsAppStatus, restartSession } from '../controllers/whatsappController.js';
import authenticate from '../middleware/authenticate.js';

const router = express.Router();

//initialize whatsapp client
router.post('/connect', authenticate , setupWhatsAppForBusiness);
router.get('/status', authenticate, getWhatsAppStatus);
// Admin/business can force restart/cleanup their WhatsApp session
router.post('/admin/restart-session', authenticate, restartSession);

export default router;