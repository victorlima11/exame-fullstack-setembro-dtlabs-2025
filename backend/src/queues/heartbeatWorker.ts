import { createWorker } from '../config/bullmq';
import { processHeartbeat } from '../services/heartbeatService';
import { Job } from 'bullmq';

createWorker('heartbeats', async (job: Job) => {
  try {
    await processHeartbeat(job.data);
    console.log('[HeartbeatWorker] Processing heartbeat:', job.data);
  } catch (error) {
    console.error('[HeartbeatWorker] Error at process', error);
  }
});

console.log('Heartbeat worker initialized');
