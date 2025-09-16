import { DeviceRepository } from '../repositories/deviceRepository';
import { NewDevice, DeviceFilters } from '../types/deviceTypes';
import { DeviceSNInvalid, DeviceSNAlreadyExists } from '../middlewares/errorMiddleware';

export async function createDevice(device: NewDevice) {
  if (!/^\d{12}$/.test(device.sn)) {
    throw new DeviceSNInvalid();
  }

  const existingDevice = await DeviceRepository.findDeviceBySN(device.sn);
  if (existingDevice) {
    throw new DeviceSNAlreadyExists();
  }

  return await DeviceRepository.createDevice(device);
}

export async function getDeviceById(id: string) {
  return DeviceRepository.findDeviceById(id);
}

export async function getDeviceBySN(sn: string) {
  return DeviceRepository.findDeviceBySN(sn);
}

export async function getUserDevices(userId: string) {
  return DeviceRepository.findDevicesByUser(userId);
}

export async function getAllDevices(filters?: DeviceFilters) {
  return DeviceRepository.findAllDevices(filters);
}

export async function updateDevice(id: string, device: Partial<NewDevice>) {
  if (device.sn) {
    if (!/^\d{12}$/.test(device.sn)) {
      throw new DeviceSNInvalid();
    }

    const existingDevice = await DeviceRepository.findDeviceBySN(device.sn);
    if (existingDevice && existingDevice.id !== id) {
      throw new DeviceSNAlreadyExists();
    }
  }

  return DeviceRepository.updateDevice(id, device);
}

export async function deleteDevice(id: string) {
  return DeviceRepository.deleteDevice(id);
}

export async function deleteUserDevices(userId: string) {
  return DeviceRepository.deleteDevicesByUser(userId);
}
