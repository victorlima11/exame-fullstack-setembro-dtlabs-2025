import { Request, Response } from 'express';
import { addHeartbeatToQueue } from '../queues/heartbeatQueue';
import { HeartbeatService } from '../services/heartbeatService';
import { HeartbeatFilter } from '../types/heartbeatTypes';

export class HeartbeatController {

  static async getLatestDeviceHeartbeat(req: Request, res: Response): Promise<void> {
    try {
      const { device_sn } = req.params;
      const heartbeat = await HeartbeatService.getLatestHeartbeat(device_sn);
      if (heartbeat) {
        res.json(heartbeat);
      } else {
        res.status(404).json({ error: 'No heartbeat found for this device' });
      }
    } catch (error) {
      console.error('Error getting latest heartbeat:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  };

  static async createHeartbeat(req: Request, res: Response): Promise<void> {
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

  static async getDeviceHeartbeats(req: Request, res: Response): Promise<void> {
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

      const heartbeats = await HeartbeatService.getHeartbeats(filter);
      res.json({ device_sn, heartbeats });
    } catch (error) {
      console.error('Error getting heartbeats:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  };
}
