import { Request, Response, NextFunction } from 'express';
import { validateToken } from '../utils/token';

export function authMiddleware(req: Request, res: Response, next: NextFunction) {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ erro: 'Token não fornecido' });

    const token = authHeader.split(' ')[1];
    const payload = validateToken(token);

    if (!payload) return res.status(401).json({ erro: 'Token inválido' });

    (req as any).user = payload;
    next();
}