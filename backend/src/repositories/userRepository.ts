import { db } from '../config/db';
import { NewUser } from '../types/userTypes';
import { User } from '../types/userTypes';

export class UserRepository {
    static async createUser(user: NewUser): Promise<User> {
        const { name, email, password } = user;

        const result = await db.query<User>(`
      INSERT INTO users (name, email, password)
      VALUES ($1, $2, $3)
      RETURNING *;
    `, [name, email, password]);

        return result.rows[0];
    }

    static async findUserByEmail(email: string): Promise<User | null> {
        const result = await db.query<User>(`
      SELECT * FROM users WHERE email = $1;
    `, [email]);

        return result.rows[0] || null;
    }

    static async findUserById(id: string): Promise<User | null> {
        const result = await db.query<User>(`
      SELECT * FROM users WHERE id = $1;
    `, [id]);

        return result.rows[0] || null;
    }

    static async findAllUsers(): Promise<User[] | []> {
        const result = await db.query<User>(`
      SELECT * FROM users;
    `);

        return result.rows;
    }

    static async deleteUser(id: string): Promise<void> {
        await db.query(`
      DELETE FROM users WHERE id = $1;
    `, [id]);
    }

    static async deleteUserByEmail(email: string): Promise<void> {
        await db.query(`
      DELETE FROM users WHERE email = $1;
    `, [email]);
    }

    static async updateUser(id: string, user: Partial<NewUser>): Promise<User | null> {
        const { name, email, password } = user;

        const result = await db.query<User>(`
      UPDATE users
      SET name = COALESCE($1, name),
          email = COALESCE($2, email),
          password = COALESCE($3, password)
      WHERE id = $4
      RETURNING *;
    `, [name, email, password, id]);

        return result.rows[0] || null;
    }
}
