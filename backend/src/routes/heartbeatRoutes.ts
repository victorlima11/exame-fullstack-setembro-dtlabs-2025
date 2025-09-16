import { Router } from 'express';
import { createHeartbeat, getDeviceHeartbeats } from '../controllers/heartbeatController';

const router = Router();

// POST /api/v1/heartbeats
router.post('/', createHeartbeat);

// GET /api/v1/heartbeats/:device_sn
router.get('/:device_sn', getDeviceHeartbeats);

export default router;
