import { DeviceRepository } from '../repositories/deviceRepository';
import { NewDevice, DeviceFilters } from '../types/deviceTypes';
import { DeviceSNInvalid, DeviceSNAlreadyExists } from '../middlewares/errorMiddleware';

export class DeviceService {
  static async createDevice(device: NewDevice) {
    if (!/^\d{12}$/.test(device.sn)) {
      throw new DeviceSNInvalid();
    }

    const existingDevice = await DeviceRepository.findDeviceBySNAndUser(device.sn, device.user_id);
    if (existingDevice) {
      throw new DeviceSNAlreadyExists();
    }

    return await DeviceRepository.createDevice(device);
  }

  static async getDeviceById(id: string) {
    return DeviceRepository.findDeviceById(id);
  }

  static async getDevicesBySN(sn: string) {
    return DeviceRepository.findDevicesBySN(sn);
  }

  static async getUserDevices(userId: string) {
    return DeviceRepository.findDevicesByUser(userId);
  }

  static async  getAllDevices(filters?: DeviceFilters) {
    return DeviceRepository.findAllDevices(filters);
  }

  static async updateDevice(id: string, device: Partial<NewDevice>) {
    if (device.sn && device.user_id) {
      if (!/^\d{12}$/.test(device.sn)) {
        throw new DeviceSNInvalid();
      }

      const existingDevice = await DeviceRepository.findDeviceBySNAndUser(device.sn, device.user_id);
      if (existingDevice && existingDevice.id !== id) {
        throw new DeviceSNAlreadyExists();
      }
    }

    return DeviceRepository.updateDevice(id, device);
  }

  static async deleteDevice(id: string) {
    return DeviceRepository.deleteDevice(id);
  }

  
  static async deleteUserDevices(userId: string) {
    return DeviceRepository.deleteDevicesByUser(userId);
  }

}

