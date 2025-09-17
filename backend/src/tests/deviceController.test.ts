jest.mock('../config/db', () => ({
  db: {
    connect: jest.fn().mockResolvedValue(true),
    query: jest.fn(),
  },
}));

import { Request, Response } from 'express';
import {
  createDeviceController,
  getDeviceController,
  getUserDevicesController,
  getAllDevicesController,
  updateDeviceController,
  deleteDeviceController
} from '../controllers/deviceController';

import * as deviceService from '../services/deviceService';

jest.mock('../services/deviceService');

describe('DeviceController', () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let jsonMock: jest.Mock;
  let statusMock: jest.Mock;
  let sendMock: jest.Mock;

  beforeEach(() => {
    jsonMock = jest.fn();
    sendMock = jest.fn();
    statusMock = jest.fn(() => res as any);
    req = { body: {}, params: {}, query: {} } as any;
    (req as any).user = { id: 'user-1' };
    res = { status: statusMock, json: jsonMock, send: sendMock };
    jest.clearAllMocks();
  });

  describe('createDeviceController', () => {
    it('should create a device', async () => {
      const deviceData = { name: 'Device 1' };
      req.body = deviceData;
      (deviceService.createDevice as jest.Mock).mockResolvedValue({ id: 'dev-1', ...deviceData, user_id: 'user-1' });

      await createDeviceController(req as Request, res as Response);

      expect(statusMock).toHaveBeenCalledWith(201);
      expect(jsonMock).toHaveBeenCalledWith({ id: 'dev-1', ...deviceData, user_id: 'user-1' });
    });

    it('should return 400 on error', async () => {
      (deviceService.createDevice as jest.Mock).mockRejectedValue(new Error('DB error'));

      await createDeviceController(req as Request, res as Response);

      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith({ error: 'DB error' });
    });
  });

  describe('getDeviceController', () => {
    it('should return 404 if device not found', async () => {
      req.params = { id: 'dev-1' };
      (deviceService.getDeviceById as jest.Mock).mockResolvedValue(null);

      await getDeviceController(req as Request, res as Response);

      expect(statusMock).toHaveBeenCalledWith(404);
      expect(jsonMock).toHaveBeenCalledWith({ error: 'Device not found' });
    });

    it('should return 403 if device does not belong to user', async () => {
      req.params = { id: 'dev-1' };
      (deviceService.getDeviceById as jest.Mock).mockResolvedValue({ id: 'dev-1', user_id: 'other-user' });

      await getDeviceController(req as Request, res as Response);

      expect(statusMock).toHaveBeenCalledWith(403);
      expect(jsonMock).toHaveBeenCalledWith({ error: 'Access denied' });
    });

    it('should return device if user owns it', async () => {
      req.params = { id: 'dev-1' };
      const device = { id: 'dev-1', user_id: 'user-1', name: 'Device 1' };
      (deviceService.getDeviceById as jest.Mock).mockResolvedValue(device);

      await getDeviceController(req as Request, res as Response);

      expect(jsonMock).toHaveBeenCalledWith(device);
    });
  });

  describe('getUserDevicesController', () => {
    it('should return all user devices', async () => {
      const devices = [{ id: 'dev-1', user_id: 'user-1', name: 'Device 1' }];
      (deviceService.getUserDevices as jest.Mock).mockResolvedValue(devices);

      await getUserDevicesController(req as Request, res as Response);

      expect(jsonMock).toHaveBeenCalledWith(devices);
    });
  });

  describe('getAllDevicesController', () => {
    it('should return devices with filters', async () => {
      const devices = [{ id: 'dev-1', user_id: 'user-1', name: 'Device 1' }];
      (deviceService.getAllDevices as jest.Mock).mockResolvedValue(devices);

      await getAllDevicesController(req as Request, res as Response);

      expect(jsonMock).toHaveBeenCalledWith(devices);
    });
  });

  describe('updateDeviceController', () => {
    it('should return 404 if device not found', async () => {
      req.params = { id: 'dev-1' };
      (deviceService.getDeviceById as jest.Mock).mockResolvedValue(null);

      await updateDeviceController(req as Request, res as Response);

      expect(statusMock).toHaveBeenCalledWith(404);
      expect(jsonMock).toHaveBeenCalledWith({ error: 'Device not found' });
    });

    it('should return 403 if device does not belong to user', async () => {
      req.params = { id: 'dev-1' };
      (deviceService.getDeviceById as jest.Mock).mockResolvedValue({ id: 'dev-1', user_id: 'other-user' });

      await updateDeviceController(req as Request, res as Response);

      expect(statusMock).toHaveBeenCalledWith(403);
      expect(jsonMock).toHaveBeenCalledWith({ error: 'Access denied' });
    });

    it('should update and return device', async () => {
      req.params = { id: 'dev-1' };
      req.body = { name: 'Updated Device' };
      const device = { id: 'dev-1', user_id: 'user-1', name: 'Device 1' };
      const updatedDevice = { ...device, name: 'Updated Device' };

      (deviceService.getDeviceById as jest.Mock).mockResolvedValue(device);
      (deviceService.updateDevice as jest.Mock).mockResolvedValue(updatedDevice);

      await updateDeviceController(req as Request, res as Response);

      expect(jsonMock).toHaveBeenCalledWith(updatedDevice);
    });

    it('should return 400 on error', async () => {
      (deviceService.getDeviceById as jest.Mock).mockResolvedValue({ id: 'dev-1', user_id: 'user-1' });
      (deviceService.updateDevice as jest.Mock).mockRejectedValue(new Error('DB error'));

      await updateDeviceController(req as Request, res as Response);

      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith({ error: 'DB error' });
    });
  });

  describe('deleteDeviceController', () => {
    it('should return 404 if device not found', async () => {
      req.params = { id: 'dev-1' };
      (deviceService.getDeviceById as jest.Mock).mockResolvedValue(null);

      await deleteDeviceController(req as Request, res as Response);

      expect(statusMock).toHaveBeenCalledWith(404);
      expect(jsonMock).toHaveBeenCalledWith({ error: 'Device not found' });
    });

    it('should return 403 if device does not belong to user', async () => {
      req.params = { id: 'dev-1' };
      (deviceService.getDeviceById as jest.Mock).mockResolvedValue({ id: 'dev-1', user_id: 'other-user' });

      await deleteDeviceController(req as Request, res as Response);

      expect(statusMock).toHaveBeenCalledWith(403);
      expect(jsonMock).toHaveBeenCalledWith({ error: 'Access denied' });
    });

    it('should delete device and return 204', async () => {
      req.params = { id: 'dev-1' };
      (deviceService.getDeviceById as jest.Mock).mockResolvedValue({ id: 'dev-1', user_id: 'user-1' });
      (deviceService.deleteDevice as jest.Mock).mockResolvedValue(true);

      await deleteDeviceController(req as Request, res as Response);

      expect(statusMock).toHaveBeenCalledWith(204);
      expect(sendMock).toHaveBeenCalledWith();
    });
  });
});
