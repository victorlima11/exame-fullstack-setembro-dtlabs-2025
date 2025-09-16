import { Heartbeat } from '../types/heartbeatTypes';
import { NotificationRule } from '../types/notificationTypes';
import { NotificationRepository } from '../repositories/notificationRepository';
import { getIO } from '../utils/socketIO';

export class NotificationService {
  static async getUserNotifications(userId: string) {
    return await NotificationRepository.getUserNotifications(userId);
  }

  static async createRule(userId: string, ruleData: any) {
    return await NotificationRepository.createRule({
      ...ruleData,
      user_id: userId
    });
  }

  static async deleteRule(ruleId: string) {
    return await NotificationRepository.deleteRule(ruleId);
  }

  static async checkRules(heartbeat: Heartbeat): Promise<void> {
    const rules = await NotificationRepository.findByDevice(heartbeat.device_sn);

    for (const rule of rules) {
      const result = this.evaluateRule(heartbeat, rule.condition);
      if (result) {
        await this.triggerNotification(heartbeat, rule);
      }
    }
  }

  private static evaluateRule(heartbeat: Heartbeat, condition: any): boolean {
    const { metric, operator, value } = condition;
    const currentValue = (heartbeat as any)[metric];
    if (currentValue === undefined) return false;

    switch (operator) {
      case '>': return currentValue > value;
      case '<': return currentValue < value;
      case '=': return currentValue === value;
      case '>=': return currentValue >= value;
      case '<=': return currentValue <= value;
      default: return false;
    }
  }

  private static async triggerNotification(heartbeat: Heartbeat, rule: NotificationRule) {
    const currentValue = (heartbeat as any)[rule.condition.metric];
    const message = `Alert: ${rule.condition.metric} ${rule.condition.operator} ${rule.condition.value} on device ${heartbeat.device_sn}. Current value: ${currentValue}`;

    const io = getIO();
    io.to(`user-${rule.user_id}`).emit('notification', {
      user_id: rule.user_id,
      device_sn: heartbeat.device_sn,
      message,
      timestamp: new Date(),
      metric: rule.condition.metric,
      value: currentValue,
      threshold: rule.condition.value
    });

    await NotificationRepository.createNotification({
      user_id: rule.user_id,
      device_sn: heartbeat.device_sn,
      message,
      triggered_value: currentValue,
      rule_condition: rule.condition,
      created_at: new Date()
    });
  }
}
