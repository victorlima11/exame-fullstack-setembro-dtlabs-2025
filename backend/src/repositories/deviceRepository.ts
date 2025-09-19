import { db } from '../config/db';
import { NewDevice, Device, DeviceFilters } from '../types/deviceTypes';

export class DeviceRepository {
    static async createDevice(device: NewDevice): Promise<Device> {
        const { name, location, sn, description, user_id } = device;

        const result = await db.query<Device>(`
      INSERT INTO devices (name, location, sn, description, user_id)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *;
    `, [name, location, sn, description, user_id]);

        return result.rows[0];
    }

    static async findDeviceById(id: string): Promise<Device | null> {
        const result = await db.query<Device>(`
      SELECT * FROM devices WHERE id = $1;
    `, [id]);

        return result.rows[0] || null;
    }

    static async findDevicesBySN(sn: string): Promise<Device[]> {
        const result = await db.query<Device>(`
      SELECT * FROM devices WHERE sn = $1;
    `, [sn]);

        return result.rows;
    }

    static async findDeviceBySNAndUser(sn: string, userId: string): Promise<Device | null> {
        const result = await db.query<Device>(`
      SELECT * FROM devices WHERE sn = $1 AND user_id = $2;
    `, [sn, userId]);

        return result.rows[0] || null;
    }

    static async findDevicesByUser(userId: string): Promise<Device[]> {
        const result = await db.query<Device>(`
      SELECT * FROM devices WHERE user_id = $1 ORDER BY created_at DESC;
    `, [userId]);

        return result.rows;
    }

    static async findAllDevices(filters?: DeviceFilters): Promise<Device[]> {
        let query = 'SELECT * FROM devices WHERE 1=1';
        const values: any[] = [];
        let paramCount = 0;

        if (filters?.userId) {
            paramCount++;
            query += ` AND user_id = ${paramCount}`;
            values.push(filters.userId);
        }

        if (filters?.name) {
            paramCount++;
            query += ` AND name ILIKE ${paramCount}`;
            values.push(`%${filters.name}%`);
        }

        if (filters?.location) {
            paramCount++;
            query += ` AND location ILIKE ${paramCount}`;
            values.push(`%${filters.location}%`);
        }

        if (filters?.sn) {
            paramCount++;
            query += ` AND sn = ${paramCount}`;
            values.push(filters.sn);
        }

        query += ' ORDER BY created_at DESC';

        const result = await db.query<Device>(query, values);
        return result.rows;
    }

    static async findAllDeviceSNs(): Promise<{sn: string}[]> {
        const result = await db.query<{sn: string}>(`
            SELECT DISTINCT sn FROM devices ORDER BY sn;
        `);
        return result.rows;
    }

    static async updateDevice(id: string, device: Partial<NewDevice>): Promise<Device | null> {
        const { name, location, sn, description } = device;

        const result = await db.query<Device>(`
      UPDATE devices
      SET name = COALESCE($1, name),
          location = COALESCE($2, location),
          sn = COALESCE($3, sn),
          description = COALESCE($4, description),
          updated_at = NOW()
      WHERE id = $5
      RETURNING *;
    `, [name, location, sn, description, id]);

        return result.rows[0] || null;
    }

    static async deleteDevice(id: string): Promise<void> {
        await db.query(`
      DELETE FROM devices WHERE id = $1;
    `, [id]);
    }

    static async deleteDevicesByUser(userId: string): Promise<void> {
        await db.query(`
      DELETE FROM devices WHERE user_id = $1;
    `, [userId]);
    }
}