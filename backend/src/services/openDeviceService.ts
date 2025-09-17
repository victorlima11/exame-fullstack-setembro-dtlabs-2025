import { DeviceRepository } from '../repositories/deviceRepository';

export async function getAllDeviceSNs(): Promise<string[]> {
  const devices = await DeviceRepository.findAllDevices();
  return devices.map(d => d.sn);
}
