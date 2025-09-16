import { Router } from 'express';
import { createHeartbeat, getDeviceHeartbeats } from '../controllers/heartbeatController';

const router = Router();

router.post('/', createHeartbeat);
router.get('/:device_sn', getDeviceHeartbeats);

export default router;
