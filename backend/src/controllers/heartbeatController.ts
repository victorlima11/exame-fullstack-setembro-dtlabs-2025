import { Request, Response } from 'express';
import { addHeartbeatToQueue } from '../queues/heartbeatQueue';
import { getHeartbeats } from '../services/heartbeatService';
import { HeartbeatFilter } from '../types/heartbeatTypes';

export const createHeartbeat = async (req: Request, res: Response): Promise<void> => {
  try {
    const heartbeat = req.body;
    
    await addHeartbeatToQueue(heartbeat);
    
    res.status(202).json({ 
      message: 'Heartbeat received and queued for processing',
      queue: 'heartbeats'
    });
  } catch (error) {
    console.error('Error queuing heartbeat:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getDeviceHeartbeats = async (req: Request, res: Response): Promise<void> => {
  try {
    const { device_sn } = req.params;
    const { start, end, limit, metric } = req.query;
    
    const filter: HeartbeatFilter = {
      device_sn,
      start: start as string,
      end: end as string,
      limit: limit ? parseInt(limit as string) : 1000,
      metric: metric as string
    };

    const heartbeats = await getHeartbeats(filter);
    res.json({ device_sn, heartbeats });
  } catch (error) {
    console.error('Error getting heartbeats:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};