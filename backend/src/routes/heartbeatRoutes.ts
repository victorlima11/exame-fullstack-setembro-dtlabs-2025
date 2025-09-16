import { Router } from 'express';
import { createHeartbeat, getDeviceHeartbeats, getLatestDeviceHeartbeat } from '../controllers/heartbeatController';

const router = Router();

router.post('/', createHeartbeat);
router.get('/:device_sn', getDeviceHeartbeats);
router.get('/:device_sn/latest', getLatestDeviceHeartbeat);

export default router;
