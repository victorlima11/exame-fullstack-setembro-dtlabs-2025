import { Queue, Worker } from 'bullmq';
import { redis } from './redis';

export const createQueue = (name: string) => {
  return new Queue(name, { connection: redis });
};

export const createWorker = (name: string, processor: any) => {
  return new Worker(name, processor, { connection: redis });
};