import { Router } from 'express';
import { OpenDeviceController } from '../controllers/openDeviceController';

const router = Router();

router.get('/sns', OpenDeviceController.getAllDevicesSNs);

export default router;
