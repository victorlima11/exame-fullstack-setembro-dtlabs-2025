import { Heartbeat } from '../types/heartbeatTypes';
import { NotificationRule } from '../types/notificationTypes';
import { NotificationRepository } from '../repositories/notificationRepository';
import { getIO } from '../utils/socketIO';

export const checkRules = async (heartbeat: Heartbeat): Promise<void> => {
  try {
    const rules = await NotificationRepository.findByDevice(heartbeat.device_sn);
    console.log('[checkRules] Heartbeat recebido:', heartbeat);
    console.log('[checkRules] Regras encontradas:', rules);
    for (const rule of rules) {
      const result = evaluateRule(heartbeat, rule.condition);
      console.log(`[checkRules] Avaliando regra para user ${rule.user_id}:`, rule.condition, 'Resultado:', result);
      if (result) {
        await triggerNotification(heartbeat, rule);
      }
    }
  } catch (error) {
    console.error('Error checking notification rules:', error);
  }
};

const evaluateRule = (heartbeat: Heartbeat, condition: any): boolean => {
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
};

const triggerNotification = async (heartbeat: Heartbeat, rule: NotificationRule): Promise<void> => {
  const currentValue = (heartbeat as any)[rule.condition.metric];
  const message = `Alert: ${rule.condition.metric} ${rule.condition.operator} ${rule.condition.value} on device ${heartbeat.device_sn}. Current value: ${currentValue}`;
  
  const io = getIO();
  console.log(`[triggerNotification] Emitindo para sala: user-${rule.user_id}`);
  console.log(`[triggerNotification] Payload:`, {
    user_id: rule.user_id,
    device_sn: heartbeat.device_sn,
    message,
    timestamp: new Date(),
    metric: rule.condition.metric,
    value: currentValue,
    threshold: rule.condition.value
  });
  io.to(`user-${rule.user_id}`).emit('notification', {
    user_id: rule.user_id,
    device_sn: heartbeat.device_sn,
    message,
    timestamp: new Date(),
    metric: rule.condition.metric,
    value: currentValue,
    threshold: rule.condition.value
  });

  await saveNotification(rule.user_id, heartbeat.device_sn, message, currentValue, rule.condition);
}

const saveNotification = async (
  user_id: string,
  device_sn: string,
  message: string,
  value: any,
  condition: any
): Promise<void> => {
  if (NotificationRepository && typeof NotificationRepository.createNotification === 'function') {
    await NotificationRepository.createNotification({
      user_id,
      device_sn,
      message,
      triggered_value: value,
      rule_condition: condition,
      created_at: new Date()
    });
  } else {
    console.log('Notification :', { user_id, device_sn, message, triggered_value: value, rule_condition: condition });
  }
};