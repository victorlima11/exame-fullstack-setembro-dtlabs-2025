import { UserService } from '../services/userService';
import { comparePassword } from '../utils/hash';
import { generateToken } from '../utils/token';
import { Request, Response } from 'express';

export class UserController {

    static async login(req: Request, res: Response) {
        try {
            const { email, password } = req.body;
            const user = await UserService.getUserByEmail(email);

            if (!user) {
                return res.status(401).json({ error: 'Invalid email or password' });
            }

            const validPassword = await comparePassword(password, user.password);
            if (!validPassword) {
                return res.status(401).json({ error: 'Invalid email or password' });
            }

            const token = generateToken({ id: user.id, email: user.email });
            return res.json({
                id: user.id,
                name: user.name,
                token,
            });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ error: 'Internal server error' });
        }
    }

    static async register(req: Request, res: Response) {
        const newUser = req.body;
        try {
            const createdUser = await UserService.createUser(newUser);
            const token = generateToken({ id: createdUser.id, email: createdUser.email });
            return res.status(201).json({ user: { name: createdUser.name, email: createdUser.email }, token });
        } catch (error: any) {
            return res.status(400).json({ error: error?.message });
        }
    }

    static async getAllUsers(req: Request, res: Response) {
        try {
            const users = await UserService.getAllUsers();
            const safeUsers = users.map((u: any) => ({
                id: u.id,
                name: u.name,
                email: u.email,
                created_at: u.created_at
            }));
            return res.json(safeUsers);
        } catch (error: any) {
            return res.status(500).json({ error: 'Error fetching users.' });
        }
    }

    static async getUserById(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
            if (!uuidRegex.test(id)) {
                return res.status(400).json({ error: 'ID must be a valid UUID.' });
            }
            const user = await UserService.getUserById(id);
            if (!user) return res.status(404).json({ error: 'User not found.' });
            const { password, ...safeUser } = user;
            return res.json(safeUser);
        } catch (error: any) {
            return res.status(500).json({ error: 'Error fetching user.' });
        }
    }

    static async updateUser(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const updateData = req.body;
            if (updateData.id) delete updateData.id;
            const updatedUser = await UserService.updateUser(id, updateData);
            if (!updatedUser) return res.status(404).json({ error: 'User not found.' });
            const { password, ...safeUser } = updatedUser;
            return res.json(safeUser);
        } catch (error: any) {
            return res.status(400).json({ error: 'Error updating user.' });
        }
    }

    static async deleteUser(req: Request, res: Response) {
        try {
            const { id } = req.params;
            await UserService.deleteUserById(id);
            return res.status(204).send();
        } catch (error: any) {
            return res.status(400).json({ error: 'Error deleting user.' });
        }
    }

    static async getMe(req: Request, res: Response) {
        try {
            const userId = (req as any).user.id;
            const user = await UserService.getUserById(userId);
            if (!user) return res.status(404).json({ error: 'User not found.' });
            const { password, ...safeUser } = user;
            return res.json(safeUser);
        } catch (error: any) {
            return res.status(500).json({ error: 'Internal server error' });
        }
    }
}
