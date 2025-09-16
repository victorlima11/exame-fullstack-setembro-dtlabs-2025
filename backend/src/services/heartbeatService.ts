import { HeartbeatRepository } from '../repositories/heartbeatRepository';
import { Heartbeat, HeartbeatFilter } from '../types/heartbeatTypes';
import { NotificationService } from './notificationService';

export const processHeartbeat = async (heartbeat: Heartbeat): Promise<void> => {
  heartbeat.timestamp = new Date();
  await HeartbeatRepository.create(heartbeat);
  await NotificationService.checkRules(heartbeat);
};

export const getHeartbeats = async (filter: HeartbeatFilter): Promise<Heartbeat[]> => {
  return HeartbeatRepository.findByDevice(filter);
};