import express from 'express';
import authenticate from '../middleware/authenticate.js';
import {
  getAppointments,
  getTodayAppointments,
  getAppointmentStats,
  getAvailableSlots,
  createAppointment,
  updateAppointmentStatus,
  cancelAppointment,
} from '../controllers/appointmentController.js';

const router = express.Router();

// Public routes
router.post('/', createAppointment); // POST /api/appointments (Client booking)
router.get('/available-slots/:businessId/:serviceId/:date', getAvailableSlots); // GET available time slots

// Protected routes
router.get('/', authenticate, getAppointments); // GET /api/appointments
router.get('/business/today', authenticate, getTodayAppointments); // GET /api/appointments/business/today
router.get('/business/stats', authenticate, getAppointmentStats); // GET /api/appointments/business/stats
router.put('/:id', authenticate, updateAppointmentStatus); // PUT /api/appointments/:id
router.delete('/:id', authenticate, cancelAppointment); // DELETE /api/appointments/:id

export default router;
