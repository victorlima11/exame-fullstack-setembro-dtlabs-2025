import { HeartbeatRepository } from '../repositories/heartbeatRepository';
import { Heartbeat, HeartbeatFilter } from '../types/heartbeatTypes';
import { NotificationService } from './notificationService';

export class HeartbeatService {
  static async processHeartbeat(heartbeat: Heartbeat): Promise<void> {
    heartbeat.timestamp = new Date();
    await HeartbeatRepository.create(heartbeat);
    await NotificationService.checkRules(heartbeat);
  };

  static async getHeartbeats(filter: HeartbeatFilter): Promise<Heartbeat[]> {
    return HeartbeatRepository.findByDevice(filter);
  };

  static async getLatestHeartbeat(device_sn: string): Promise<Heartbeat | null> {
    return HeartbeatRepository.findLatestByDevice(device_sn);
  };
};

