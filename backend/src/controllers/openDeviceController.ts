import { Request, Response } from 'express';
import { getAllDeviceSNs } from '../services/openDeviceService';

export async function getAllDeviceSNsController(req: Request, res: Response) {
  try {
    const sns = await getAllDeviceSNs();
    res.json(sns);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}
