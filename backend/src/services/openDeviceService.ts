import { DeviceRepository } from '../repositories/deviceRepository';

export class OpenDeviceService {
  static async getAllDeviceSNs(): Promise<string[]> {
    const devices = await DeviceRepository.findAllDevices();
    return devices.map(d => d.sn);
  }
}