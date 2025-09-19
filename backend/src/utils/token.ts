import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config({ path: ".env.TEMPLATE" });

const SECRET = process.env.JWT_SECRET || 'key_for_test';
if (!SECRET) {
    throw new Error('JWT_SECRET não definido no arquivo .env');
}

export function generateToken(payload: object): string {
    return jwt.sign(payload, SECRET, { expiresIn: '1d' });
}

export function validateToken(token: string): any {
    try {
        return jwt.verify(token, SECRET);
    } catch {
        return null;
    }
}