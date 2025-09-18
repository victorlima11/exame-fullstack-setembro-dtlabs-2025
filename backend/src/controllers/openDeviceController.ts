import { Request, Response } from 'express';
import { OpenDeviceService } from '../services/openDeviceService';

export class OpenDeviceController {
  static async getAllDevicesSNs(req: Request, res: Response) {
    try {
      const sns = await OpenDeviceService.getAllDeviceSNs();
      res.json(sns);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
}

