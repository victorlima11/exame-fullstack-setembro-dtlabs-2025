import { Router } from 'express';
import { getAllDeviceSNsController } from '../controllers/openDeviceController';

const router = Router();

router.get('/sns', getAllDeviceSNsController);

export default router;
