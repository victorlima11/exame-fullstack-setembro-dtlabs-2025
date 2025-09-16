import { 
  getUserByEmail, 
  createUser, 
  getAllUsers as getAllUsersService, 
  getUserById as getUserByIdService, 
  updateUser as updateUserService, 
  deleteUserById as deleteUserByIdService 
} from '../services/userService';
import { comparePassword } from '../utils/hash';
import { generateToken } from '../utils/token';
import { Request, Response } from 'express';

export async function login(req: Request, res: Response) {
  try {
    const { email, password } = req.body;
    const user = await getUserByEmail(email);

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

export async function register(req: Request, res: Response) {
    const newUser = req.body;
    try {
        const createdUser = await createUser(newUser);
        const token = generateToken({ id: createdUser.id, email: createdUser.email });
        return res.status(201).json({ user: { name: createdUser.name, email: createdUser.email }, token });
    } catch (error: any) {
        return res.status(400).json({ error: error?.message });
    }
}

export async function getAllUsers(req: Request, res: Response) {
    try {
        const users = await getAllUsersService();
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

export async function getUserById(req: Request, res: Response) {
    try {
        const { id } = req.params;
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
        if (!uuidRegex.test(id)) {
            return res.status(400).json({ error: 'ID must be a valid UUID.' });
        }
        const user = await getUserByIdService(id);
        if (!user) return res.status(404).json({ error: 'User not found.' });
        const { password, ...safeUser } = user;
        return res.json(safeUser);
    } catch (error: any) {
        return res.status(500).json({ error: 'Error fetching user.' });
    }
}

export async function updateUser(req: Request, res: Response) {
    try {
        const { id } = req.params;
        const updateData = req.body;
        if (updateData.id) delete updateData.id;
        const updatedUser = await updateUserService(id, updateData);
        if (!updatedUser) return res.status(404).json({ error: 'User not found.' });
        const { password, ...safeUser } = updatedUser;
        return res.json(safeUser);
    } catch (error: any) {
        return res.status(400).json({ error: 'Error updating user.' });
    }
}

export async function deleteUser(req: Request, res: Response) {
    try {
        const { id } = req.params;
        await deleteUserByIdService(id);
        return res.status(204).send();
    } catch (error: any) {
        return res.status(400).json({ error: 'Error deleting user.' });
    }
}

export async function getMe(req: Request, res: Response) {
    try {
    const userId = (req as any).user.id; // Corrige tipagem
        const user = await getUserByIdService(userId);
        if (!user) return res.status(404).json({ error: 'User not found.' });
        const { password, ...safeUser } = user;
        return res.json(safeUser);
    } catch (error: any) {
        return res.status(500).json({ error: 'Internal server error' });
    }
}