import { createQueue } from '../config/bullmq';
import { Heartbeat } from '../types/heartbeatTypes';

export const heartbeatQueue = createQueue('heartbeats');

export const addHeartbeatToQueue = async (heartbeat: Heartbeat): Promise<void> => {
  await heartbeatQueue.add('process-heartbeat', heartbeat, {
    attempts: 3,
    backoff: { type: 'exponential', delay: 1000 },
    removeOnComplete: true,
    removeOnFail: false
  });
};