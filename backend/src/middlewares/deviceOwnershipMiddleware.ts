import { Request, Response, NextFunction } from 'express';
import { DeviceService } from '../services/deviceService';

export async function validateDeviceOwnership(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const userId = (req as any).user.id;

    const device = await DeviceService.getDeviceById(id);

    if (!device) {
      return res.status(404).json({ error: 'Device not found.' });
    }

    console.log('Device user_id:', device.user_id);
    console.log('Request user_id:', userId);

    if (device.user_id !== userId) {
      return res.status(403).json({ error: 'Denied Acess. You are not owner of this device.' });
    }

    (req as any).device = device;
    next();
  } catch (error: any) {
    res.status(500).json({ error: 'Error verifying device properties.' });
  }
}