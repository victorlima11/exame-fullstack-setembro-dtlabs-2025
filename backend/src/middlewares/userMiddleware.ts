import { Request, Response, NextFunction } from 'express';

export function validateUserRegister(req: Request, res: Response, next: NextFunction) {

    if (!req.body) {
        return res.status(400).json({ error: 'User data is required.' });
    }

    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        return res.status(400).json({ error: 'All fields are required.' });
    }

    next();
};

export function validateUserLogin(req: Request, res: Response, next: NextFunction) {

    if (!req.body) {
        return res.status(400).json({ error: 'User data is required.' });
    }
    
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: 'All fields are required.' });
    }

    next();
};
