jest.mock('../config/db', () => ({
  db: {
    connect: jest.fn().mockResolvedValue(true),
    query: jest.fn(),
  },
}));

import { Request, Response } from 'express';
import * as userService from '../services/userService';
import * as hashUtils from '../utils/hash';
import * as tokenUtils from '../utils/token';
import {
  login,
  register,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
} from '../controllers/userController';

jest.mock('../services/userService');
jest.mock('../utils/hash');
jest.mock('../utils/token');

describe('UserController', () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let jsonMock: jest.Mock;
  let statusMock: jest.Mock;
  let sendMock: jest.Mock;

  beforeEach(() => {
    jsonMock = jest.fn();
    sendMock = jest.fn();
    statusMock = jest.fn(() => res);
    req = {};
    res = { status: statusMock, json: jsonMock, send: sendMock };
    jest.clearAllMocks();
  });

  describe('login', () => {
    it('should return 401 if user is not found', async () => {
      (userService.getUserByEmail as jest.Mock).mockResolvedValue(null);
      req.body = { email: 'test@example.com', password: '1234' };

      await login(req as Request, res as Response);

      expect(statusMock).toHaveBeenCalledWith(401);
      expect(jsonMock).toHaveBeenCalledWith({ error: 'Invalid email or password' });
    });

    it('should return 401 if password is invalid', async () => {
      (userService.getUserByEmail as jest.Mock).mockResolvedValue({
        id: '550e8400-e29b-41d4-a716-446655440000',
        email: 'test@example.com',
        password: 'hashed',
      });
      (hashUtils.comparePassword as jest.Mock).mockResolvedValue(false);
      req.body = { email: 'test@example.com', password: 'wrong' };

      await login(req as Request, res as Response);

      expect(statusMock).toHaveBeenCalledWith(401);
      expect(jsonMock).toHaveBeenCalledWith({ error: 'Invalid email or password' });
    });

    it('should return user data and token if login is successful', async () => {
      (userService.getUserByEmail as jest.Mock).mockResolvedValue({
        id: '550e8400-e29b-41d4-a716-446655440000',
        name: 'John',
        email: 'test@example.com',
        password: 'hashed',
      });
      (hashUtils.comparePassword as jest.Mock).mockResolvedValue(true);
      (tokenUtils.generateToken as jest.Mock).mockReturnValue('mocked-token');
      req.body = { email: 'test@example.com', password: '1234' };

      await login(req as Request, res as Response);

      expect(jsonMock).toHaveBeenCalledWith({
        id: '550e8400-e29b-41d4-a716-446655440000',
        name: 'John',
        token: 'mocked-token',
      });
    });
  });

  describe('register', () => {
    it('should create a new user and return token', async () => {
      (userService.createUser as jest.Mock).mockResolvedValue({
        id: '550e8400-e29b-41d4-a716-446655440000',
        name: 'John',
        email: 'test@example.com',
      });
      (tokenUtils.generateToken as jest.Mock).mockReturnValue('mocked-token');
      req.body = { name: 'John', email: 'test@example.com', password: '1234' };

      await register(req as Request, res as Response);

      expect(statusMock).toHaveBeenCalledWith(201);
      expect(jsonMock).toHaveBeenCalledWith({
        user: { name: 'John', email: 'test@example.com' },
        token: 'mocked-token',
      });
    });

    it('should return 400 if creation fails', async () => {
      (userService.createUser as jest.Mock).mockRejectedValue(new Error('User exists'));
      req.body = { name: 'John', email: 'test@example.com', password: '1234' };

      await register(req as Request, res as Response);

      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith({ error: 'User exists' });
    });
  });

  describe('getAllUsers', () => {
    it('should return all users safely', async () => {
      (userService.getAllUsers as jest.Mock).mockResolvedValue([
        {
          id: '550e8400-e29b-41d4-a716-446655440000',
          name: 'John',
          email: 'john@test.com',
          password: 'hashed',
          created_at: '2025-09-17',
        },
      ]);

      await getAllUsers(req as Request, res as Response);

      expect(jsonMock).toHaveBeenCalledWith([
        {
          id: '550e8400-e29b-41d4-a716-446655440000',
          name: 'John',
          email: 'john@test.com',
          created_at: '2025-09-17',
        },
      ]);
    });
  });

  describe('getUserById', () => {
    it('should return 400 for invalid UUID', async () => {
      req.params = { id: 'invalid' };

      await getUserById(req as Request, res as Response);

      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith({ error: 'ID must be a valid UUID.' });
    });

    it('should return 404 if user not found', async () => {
      req.params = { id: '550e8400-e29b-41d4-a716-446655440000' };
      (userService.getUserById as jest.Mock).mockResolvedValue(null);

      await getUserById(req as Request, res as Response);

      expect(statusMock).toHaveBeenCalledWith(404);
      expect(jsonMock).toHaveBeenCalledWith({ error: 'User not found.' });
    });

    it('should return user data if found', async () => {
      req.params = { id: '550e8400-e29b-41d4-a716-446655440000' };
      (userService.getUserById as jest.Mock).mockResolvedValue({
        id: '550e8400-e29b-41d4-a716-446655440000',
        name: 'John',
        email: 'john@test.com',
        password: 'hashed',
      });

      await getUserById(req as Request, res as Response);

      expect(jsonMock).toHaveBeenCalledWith({
        id: '550e8400-e29b-41d4-a716-446655440000',
        name: 'John',
        email: 'john@test.com',
      });
    });
  });

  describe('updateUser', () => {
    it('should return 404 if user not found', async () => {
      req.params = { id: '550e8400-e29b-41d4-a716-446655440000' };
      req.body = { name: 'New Name' };
      (userService.updateUser as jest.Mock).mockResolvedValue(null);

      await updateUser(req as Request, res as Response);

      expect(statusMock).toHaveBeenCalledWith(404);
      expect(jsonMock).toHaveBeenCalledWith({ error: 'User not found.' });
    });

    it('should return updated user', async () => {
      req.params = { id: '550e8400-e29b-41d4-a716-446655440000' };
      req.body = { name: 'New Name' };
      (userService.updateUser as jest.Mock).mockResolvedValue({
        id: '550e8400-e29b-41d4-a716-446655440000',
        name: 'New Name',
        email: 'john@test.com',
        password: 'hashed',
      });

      await updateUser(req as Request, res as Response);

      expect(jsonMock).toHaveBeenCalledWith({
        id: '550e8400-e29b-41d4-a716-446655440000',
        name: 'New Name',
        email: 'john@test.com',
      });
    });
  });

  describe('deleteUser', () => {
    it('should delete user and return 204', async () => {
      req.params = { id: '550e8400-e29b-41d4-a716-446655440000' };
      (userService.deleteUserById as jest.Mock).mockResolvedValue(true);

      await deleteUser(req as Request, res as Response);

      expect(sendMock).toHaveBeenCalledWith();
      expect(statusMock).toHaveBeenCalledWith(204);
    });

    it('should return 400 if deletion fails', async () => {
      req.params = { id: '550e8400-e29b-41d4-a716-446655440000' };
      (userService.deleteUserById as jest.Mock).mockRejectedValue(new Error('DB error'));

      await deleteUser(req as Request, res as Response);

      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith({ error: 'Error deleting user.' });
    });
  });
});
