import { Router } from 'express';
import * as locationController from '../controllers/locationController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';
import { checkRole, STAFF_ROLES } from '../utils/roleUtils.js';
import { validate } from '../middleware/validateResource.js';
import { createLocationSchema, updateLocationSchema } from '../schemas/locationSchemas.js';

const router = Router();

// Public routes
router.get('/', locationController.getLocations);

// Admin routes
router.post('/', authenticateToken, checkRole(STAFF_ROLES), validate(createLocationSchema), locationController.createLocation);
router.put('/:id', authenticateToken, checkRole(STAFF_ROLES), validate(updateLocationSchema), locationController.updateLocation);
router.delete('/:id', authenticateToken, checkRole(STAFF_ROLES), locationController.deleteLocation);

export default router;
