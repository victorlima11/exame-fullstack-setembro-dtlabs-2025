import { Request, Response, NextFunction } from 'express';

export function validateUserRegister(req: Request, res: Response, next: NextFunction) {

    if (!req.body) {
        return res.status(400).json({ error: 'Dados do usuário são obrigatórios.' });
    }

    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        return res.status(400).json({ error: 'Todos os campos são obrigatórios.' });
    }

    next();
};

export function validateUserLogin(req: Request, res: Response, next: NextFunction) {

    if (!req.body) {
        return res.status(400).json({ error: 'Dados do usuário são obrigatórios.' });
    }
    
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: 'Todos os campos são obrigatórios.' });
    }

    next();
};
