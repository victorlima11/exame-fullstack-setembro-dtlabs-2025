jest.mock('../config/db', () => ({
  db: {
    connect: jest.fn().mockResolvedValue(true),
    query: jest.fn(),
  },
}));

jest.mock('../services/deviceService', () => ({
  DeviceService: {
    createDevice: jest.fn(),
    getDeviceById: jest.fn(),
    getUserDevices: jest.fn(),
    getAllDevices: jest.fn(),
    updateDevice: jest.fn(),
    deleteDevice: jest.fn(),
  },
}));

import { Request, Response } from 'express';
import { DeviceController } from '../controllers/deviceController';
import { DeviceService } from '../services/deviceService';

describe('DeviceController', () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let statusMock: jest.Mock;
  let sendMock: jest.Mock;
  let jsonMock: jest.Mock;

  beforeEach(() => {
    sendMock = jest.fn();
    jsonMock = jest.fn();
    statusMock = jest.fn(() => ({ send: sendMock, json: jsonMock }));

    req = {};
    res = { status: statusMock, send: sendMock, json: jsonMock };
    jest.clearAllMocks();
  });

  describe('deleteDeviceController', () => {
    it('should return 404 if device not found', async () => {
      (DeviceService.getDeviceById as jest.Mock).mockResolvedValue(null);

      req.params = { id: 'non-existent-device' };
      (req as any).user = { id: 'user-1' };

      await DeviceController.deleteDeviceController(req as Request, res as Response);

      expect(statusMock).toHaveBeenCalledWith(404);
      expect(jsonMock).toHaveBeenCalledWith({ error: 'Device not found' });
    });

    it('should delete device if found', async () => {
      (DeviceService.getDeviceById as jest.Mock).mockResolvedValue({ id: 'device-1', user_id: 'user-1' });
      (DeviceService.deleteDevice as jest.Mock).mockResolvedValue(true);

      req.params = { id: 'device-1' };
      (req as any).user = { id: 'user-1' };

      await DeviceController.deleteDeviceController(req as Request, res as Response);

      expect(statusMock).toHaveBeenCalledWith(204);
      expect(sendMock).toHaveBeenCalledWith();
    });
  });

  describe('getUserDevicesController', () => {
    it('should return user devices', async () => {
      const fakeDevices = [{ id: '1', name: 'Device 1' }];
      (DeviceService.getUserDevices as jest.Mock).mockResolvedValue(fakeDevices);

      (req as any).user = { id: 'user-1' };

      await DeviceController.getUserDevicesController(req as Request, res as Response);

      expect(jsonMock).toHaveBeenCalledWith(fakeDevices);
    });
  });

  describe('createDeviceController', () => {
    it('should create a new device', async () => {
      const newDevice = { id: '123', name: 'New Device', location: 'Lab' };
      (DeviceService.createDevice as jest.Mock).mockResolvedValue(newDevice);

      req.body = { name: 'New Device', location: 'Lab' };
      (req as any).user = { id: 'user-1' };

      await DeviceController.createDeviceController(req as Request, res as Response);

      expect(statusMock).toHaveBeenCalledWith(201);
      expect(jsonMock).toHaveBeenCalledWith(newDevice);
    });

    it('should return 409 if SN already exists', async () => {
      const error = new Error('Device SN already exists');
      (error as any).name = 'DeviceSNAlreadyExists';
      (DeviceService.createDevice as jest.Mock).mockRejectedValue(error);

      req.body = { name: 'Device SN', sn: '123456' };
      (req as any).user = { id: 'user-1' };

      await DeviceController.createDeviceController(req as Request, res as Response);

      expect(statusMock).toHaveBeenCalledWith(409);
      expect(jsonMock).toHaveBeenCalledWith({ error: 'Device SN already exists' });
    });
  });

  describe('getDeviceController', () => {
    it('should return 404 if device not found', async () => {
      (DeviceService.getDeviceById as jest.Mock).mockResolvedValue(null);

      req.params = { id: 'device-1' };
      (req as any).user = { id: 'user-1' };

      await DeviceController.getDeviceController(req as Request, res as Response);

      expect(statusMock).toHaveBeenCalledWith(404);
      expect(jsonMock).toHaveBeenCalledWith({ error: 'Device not found' });
    });

    it('should return 403 if device belongs to another user', async () => {
      (DeviceService.getDeviceById as jest.Mock).mockResolvedValue({ id: 'device-1', user_id: 'user-2' });

      req.params = { id: 'device-1' };
      (req as any).user = { id: 'user-1' };

      await DeviceController.getDeviceController(req as Request, res as Response);

      expect(statusMock).toHaveBeenCalledWith(403);
      expect(jsonMock).toHaveBeenCalledWith({ error: 'Access denied' });
    });

    it('should return device if found', async () => {
      const device = { id: 'device-1', user_id: 'user-1', name: 'My Device' };
      (DeviceService.getDeviceById as jest.Mock).mockResolvedValue(device);

      req.params = { id: 'device-1' };
      (req as any).user = { id: 'user-1' };

      await DeviceController.getDeviceController(req as Request, res as Response);

      expect(jsonMock).toHaveBeenCalledWith(device);
    });
  });
});
