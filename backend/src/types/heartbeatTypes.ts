export interface Heartbeat {
  device_sn: string;
  cpu_usage: number;
  ram_usage: number;
  disk_free: number;
  temperature: number;
  latency: number;
  connectivity: 0 | 1;
  boot_time: string;
  timestamp?: Date;
}

export interface HeartbeatFilter {
  device_sn: string;
  start?: string;
  end?: string;
  limit?: number;
  metric?: string;
}
