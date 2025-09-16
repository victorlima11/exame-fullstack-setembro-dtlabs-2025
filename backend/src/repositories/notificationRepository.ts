// ...existing code...
// Removido interface duplicada Notification, usar do types/notificationTypes.ts
import { db } from '../config/db';
import { NotificationRule, CreateNotificationRule, Notification } from '../types/notificationTypes';

export class NotificationRepository {
  static async createNotification(notification: Notification): Promise<Notification> {
    const query = `
      INSERT INTO notifications (
        user_id, device_sn, message, triggered_value, rule_condition, created_at
      ) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *;
    `;
    const values = [
      notification.user_id,
      notification.device_sn,
      notification.message,
      notification.triggered_value,
      JSON.stringify(notification.rule_condition),
      notification.created_at
    ];
    const result = await db.query(query, values);
    return result.rows[0];
  }
  static async createRule(rule: CreateNotificationRule): Promise<NotificationRule> {
    const query = `
      INSERT INTO notification_rules (
        user_id, device_sn, condition
      ) VALUES ($1, $2, $3)
      RETURNING *;
    `;
    
    const values = [rule.user_id, rule.device_sn, rule.condition];
    const result = await db.query<NotificationRule>(query, values);
    return result.rows[0];
  }

  static async findByUser(userId: string): Promise<NotificationRule[]> {
    const query = `
      SELECT * FROM notification_rules 
      WHERE user_id = $1
      ORDER BY created_at DESC
    `;
    
    const result = await db.query<NotificationRule>(query, [userId]);
    return result.rows;
  }

  static async findByDevice(deviceSn: string): Promise<NotificationRule[]> {
    const query = `
      SELECT * FROM notification_rules 
      WHERE device_sn = $1 OR device_sn IS NULL
      ORDER BY created_at DESC
    `;
    
    const result = await db.query<NotificationRule>(query, [deviceSn]);
    return result.rows;
  }

  static async deleteRule(ruleId: string): Promise<void> {
    const query = `DELETE FROM notification_rules WHERE id = $1`;
    await db.query(query, [ruleId]);
  }

  static async findRuleById(ruleId: string): Promise<NotificationRule | null> {
    const query = `SELECT * FROM notification_rules WHERE id = $1`;
    const result = await db.query<NotificationRule>(query, [ruleId]);
    return result.rows[0] || null;
  }
}