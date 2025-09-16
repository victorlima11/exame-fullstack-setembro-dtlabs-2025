export interface NotificationRule {
  id: string;
  user_id: string;
  device_sn?: string;
  condition: {
    metric: string;
    operator: '>' | '<' | '=' | '>=' | '<=';
    value: number;
  };
  created_at: Date;
}
export interface Notification {
  id?: string;
  user_id: string;
  device_sn: string;
  message: string;
  triggered_value: number;
  rule_condition: any;
  created_at: Date;
}
export interface CreateNotificationRule {
  user_id: string;
  device_sn?: string;
  condition: {
    metric: string;
    operator: '>' | '<' | '=' | '>=' | '<=';
    value: number;
  };
}
