import express from 'express';
import authenticate from '../middleware/authenticate.js';
import {
  getServices,
  getBusinessServices,
  createService,
  updateService,
  deleteService,
} from '../controllers/serviceController.js';

const router = express.Router();

// Protected routes (MUST be before /:businessId)
router.get('/myservices', authenticate, getBusinessServices); // GET /api/services/myservices
router.post('/', authenticate, createService); // POST /api/services
router.put('/:id', authenticate, updateService); // PUT /api/services/:id
router.delete('/:id', authenticate, deleteService); // DELETE /api/services/:id

// Public routes (AFTER specific routes)
router.get('/:businessId', getServices); // GET /api/services/:businessId

export default router;
