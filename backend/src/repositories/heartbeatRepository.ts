import { db } from '../config/db';
import { Heartbeat, HeartbeatFilter } from '../types/heartbeatTypes';

export class HeartbeatRepository {
  static async create(heartbeat: Heartbeat): Promise<void> {
    const query = `
      INSERT INTO heartbeats (
        device_sn, cpu_usage, ram_usage, disk_free, 
        temperature, latency, connectivity, boot_time
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    `;
    
    const values = [
      heartbeat.device_sn,
      heartbeat.cpu_usage,
      heartbeat.ram_usage,
      heartbeat.disk_free,
      heartbeat.temperature,
      heartbeat.latency,
      heartbeat.connectivity,
      heartbeat.boot_time
    ];

    await db.query(query, values);
  }

  static async findByDevice(filter: HeartbeatFilter): Promise<Heartbeat[]> {
    let query = `
      SELECT * FROM heartbeats 
      WHERE device_sn = $1
    `;
    
    const values: any[] = [filter.device_sn];
    let paramCount = 2;

    if (filter.start) {
      query += ` AND created_at >= $${paramCount}`;
      values.push(filter.start);
      paramCount++;
    }

    if (filter.end) {
      query += ` AND created_at <= $${paramCount}`;
      values.push(filter.end);
      paramCount++;
    }

    query += ` ORDER BY created_at DESC LIMIT $${paramCount}`;
    values.push(filter.limit || 1000);

    const result = await db.query(query, values);
    return result.rows;
  }
}