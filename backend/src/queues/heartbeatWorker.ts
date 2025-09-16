import { createWorker } from '../config/bullmq';
import { processHeartbeat } from '../services/heartbeatService';
import { Job } from 'bullmq';

createWorker('heartbeats', async (job: Job) => {
  try {
    await processHeartbeat(job.data);
    console.log('[HeartbeatWorker] Processado heartbeat:', job.data);
  } catch (error) {
    console.error('[HeartbeatWorker] Erro ao processar heartbeat:', error);
  }
});

console.log('Heartbeat worker initialized');
