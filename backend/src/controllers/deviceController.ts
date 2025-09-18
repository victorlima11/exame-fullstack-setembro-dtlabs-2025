import { Request, Response } from 'express';
import { DeviceService } from '../services/deviceService';
import { DeviceFilters } from '../types/deviceTypes';


export class DeviceController {

  static async createDeviceController(req: Request, res: Response) {
    try {
      const deviceData = req.body;
      deviceData.user_id = (req as any).user.id;
      
      const device = await DeviceService.createDevice(deviceData);
      res.status(201).json(device);
    } catch (error: any) {
        if (error.name === 'DeviceSNAlreadyExists') {
            return res.status(409).json({ error: error.message });
        }
        res.status(400).json({ error: error.message });
    }
  }

  static async getDeviceController(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const device = await DeviceService.getDeviceById(id);
      
      if (!device) {
        return res.status(404).json({ error: 'Device not found' });
      }
      
      if (device.user_id !== (req as any).user.id) {
        return res.status(403).json({ error: 'Access denied' });
      }
      
      res.json(device);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  static async getUserDevicesController(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;
      const devices = await DeviceService.getUserDevices(userId);
      res.json(devices);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  static async getAllDevicesController(req: Request, res: Response) {
    try {
      const filters: DeviceFilters = {
        userId: (req as any).user.id,
        ...req.query
      };
      
      const devices = await DeviceService.getAllDevices(filters);
      res.json(devices);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  static async updateDeviceController(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const updates = req.body;
      updates.user_id = (req as any).user.id;

      const existingDevice = await DeviceService.getDeviceById(id);
      if (!existingDevice) {
        return res.status(404).json({ error: 'Device not found' });
      }
      
      if (existingDevice.user_id !== (req as any).user.id) {
        return res.status(403).json({ error: 'Access denied' });
      }
      
      const updatedDevice = await DeviceService.updateDevice(id, updates);
      res.json(updatedDevice);
    } catch (error: any) {
        if (error.name === 'DeviceSNAlreadyExists') {
            return res.status(409).json({ error: error.message });
        }
        res.status(400).json({ error: error.message });
    }
  }

  static async deleteDeviceController(req: Request, res: Response) {
    try {
      const { id } = req.params;
      
      const existingDevice = await DeviceService.getDeviceById(id);
      if (!existingDevice) {
        return res.status(404).json({ error: 'Device not found' });
      }
      
      if (existingDevice.user_id !== (req as any).user.id) {
        return res.status(403).json({ error: 'Access denied' });
      }
      
      await DeviceService.deleteDevice(id);
      res.status(204).send();
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

}

