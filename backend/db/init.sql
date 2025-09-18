CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

CREATE TABLE IF NOT EXISTS devices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  location VARCHAR(255) NOT NULL,
  sn VARCHAR(12) NOT NULL CHECK (LENGTH(sn) = 12),
  description TEXT,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now(),
  UNIQUE (user_id, sn)
);

CREATE TABLE heartbeats (
    id SERIAL PRIMARY KEY,
    device_sn VARCHAR(12) NOT NULL,
    cpu_usage DECIMAL(5,2) CHECK (cpu_usage >= 0 AND cpu_usage <= 100),
    ram_usage DECIMAL(5,2) CHECK (ram_usage >= 0 AND ram_usage <= 100),
    disk_free DECIMAL(5,2) CHECK (disk_free >= 0 AND disk_free <= 100),
    temperature DECIMAL(5,2),
    latency INTEGER,
    connectivity INTEGER CHECK (connectivity IN (0, 1)),
    boot_time TIMESTAMP,
    created_at TIMESTAMP DEFAULT now()
);

CREATE TABLE notification_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    device_sn VARCHAR(12),
    condition JSONB NOT NULL,
    created_at TIMESTAMP DEFAULT now()
);

CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    device_sn VARCHAR(12) NOT NULL,
    message TEXT NOT NULL,
    triggered_value DECIMAL(10,2) NOT NULL,
    rule_condition JSONB NOT NULL,
    created_at TIMESTAMP DEFAULT now()
);

CREATE INDEX idx_devices_user_id ON devices(user_id);
CREATE INDEX idx_devices_sn ON devices(sn);
CREATE INDEX idx_heartbeats_device_sn ON heartbeats(device_sn);
CREATE INDEX idx_heartbeats_created_at ON heartbeats(created_at);
CREATE INDEX idx_notification_rules_user ON notification_rules(user_id);
CREATE INDEX idx_notification_rules_device_sn ON notification_rules(device_sn);
CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_device_sn ON notifications(device_sn);
