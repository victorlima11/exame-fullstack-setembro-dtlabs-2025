import { Router } from 'express';
import {
  createDeviceController,
  getDeviceController,
  getUserDevicesController,
  getAllDevicesController,
  updateDeviceController,
  deleteDeviceController
} from '../controllers/deviceController';
import { authMiddleware } from '../middlewares/authMiddleware';
import {
  validateDeviceCreate,
  validateDeviceUpdate,
  validateDeviceId,
  validateDeviceFilters
} from '../middlewares/deviceMiddleware';
import { validateDeviceOwnership } from '../middlewares/deviceOwnershipMiddleware';

const router = Router();

router.use(authMiddleware);

router.post('/', validateDeviceCreate, createDeviceController);
router.get('/user', getUserDevicesController);
router.get('/', validateDeviceFilters, getAllDevicesController);
router.get('/:id', validateDeviceId, validateDeviceOwnership, getDeviceController);
router.put('/:id', validateDeviceId, validateDeviceUpdate, validateDeviceOwnership, updateDeviceController);
router.delete('/:id', validateDeviceId, validateDeviceOwnership, deleteDeviceController);

export default router;