import { Request, Response } from 'express';
import {
  createDevice,
  getDeviceById,
  getUserDevices,
  getAllDevices,
  updateDevice,
  deleteDevice
} from '../services/deviceService';
import { DeviceFilters } from '../types/deviceTypes';

export async function createDeviceController(req: Request, res: Response) {
  try {
    const deviceData = req.body;
    deviceData.user_id = (req as any).user.id;
    
    const device = await createDevice(deviceData);
    res.status(201).json(device);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
}

export async function getDeviceController(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const device = await getDeviceById(id);
    
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

export async function getUserDevicesController(req: Request, res: Response) {
  try {
    const userId = (req as any).user.id;
    const devices = await getUserDevices(userId);
    res.json(devices);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}

export async function getAllDevicesController(req: Request, res: Response) {
  try {
    const filters: DeviceFilters = {
      userId: (req as any).user.id,
      ...req.query
    };
    
    const devices = await getAllDevices(filters);
    res.json(devices);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}

export async function updateDeviceController(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const updates = req.body;

    const existingDevice = await getDeviceById(id);
    if (!existingDevice) {
      return res.status(404).json({ error: 'Device not found' });
    }
    
    if (existingDevice.user_id !== (req as any).user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    const updatedDevice = await updateDevice(id, updates);
    res.json(updatedDevice);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
}

export async function deleteDeviceController(req: Request, res: Response) {
  try {
    const { id } = req.params;
    
    const existingDevice = await getDeviceById(id);
    if (!existingDevice) {
      return res.status(404).json({ error: 'Device not found' });
    }
    
    if (existingDevice.user_id !== (req as any).user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    await deleteDevice(id);
    res.status(204).send();
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}
