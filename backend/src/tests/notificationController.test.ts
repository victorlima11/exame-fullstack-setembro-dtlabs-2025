jest.mock('../config/db', () => ({
  db: {
    connect: jest.fn().mockResolvedValue(true),
    query: jest.fn(),
  },
}));

import { Request, Response } from 'express';
import { NotificationService } from '../services/notificationService';
import {
  updateNotificationRule,
  getUserNotifications,
  createNotificationRule,
  getUserNotificationRules,
  deleteNotificationRule
} from '../controllers/notificationController';

jest.mock('../services/notificationService', () => ({
  NotificationService: {
    updateRule: jest.fn(),
    getUserNotifications: jest.fn(),
    createRule: jest.fn(),
    getUserRules: jest.fn(),
    deleteRule: jest.fn(),
  }
}));

interface AuthRequest extends Request {
  user: { id: string };
}

describe('NotificationController', () => {
  let req: Partial<AuthRequest>;
  let res: Partial<Response>;
  let jsonMock: jest.Mock;
  let statusMock: jest.Mock;
  let sendMock: jest.Mock;

  beforeEach(() => {
    jsonMock = jest.fn();
    sendMock = jest.fn();
    statusMock = jest.fn(() => ({ json: jsonMock, send: sendMock }));

    req = {};
    res = { status: statusMock, json: jsonMock, send: sendMock };
    jest.clearAllMocks();
  });

  describe('updateNotificationRule', () => {
    it('should return updated rule if successful', async () => {
      req.params = { id: 'rule-1' };
      req.body = { name: 'Updated Rule' };
      (NotificationService.updateRule as jest.Mock).mockResolvedValue({ id: 'rule-1', name: 'Updated Rule' });

      await updateNotificationRule(req as AuthRequest, res as Response);

      expect(jsonMock).toHaveBeenCalledWith({ id: 'rule-1', name: 'Updated Rule' });
    });

    it('should return 404 if rule not found', async () => {
      req.params = { id: 'rule-1' };
      req.body = { name: 'Updated Rule' };
      (NotificationService.updateRule as jest.Mock).mockResolvedValue(null);

      await updateNotificationRule(req as AuthRequest, res as Response);

      expect(statusMock).toHaveBeenCalledWith(404);
      expect(jsonMock).toHaveBeenCalledWith({ error: 'Rule not found' });
    });
  });

  describe('getUserNotifications', () => {
    it('should return notifications', async () => {
      req.user = { id: 'user-1' };
      (NotificationService.getUserNotifications as jest.Mock).mockResolvedValue([{ id: 'n1', message: 'Test' }]);

      await getUserNotifications(req as AuthRequest, res as Response);

      expect(jsonMock).toHaveBeenCalledWith([{ id: 'n1', message: 'Test' }]);
    });
  });

  describe('createNotificationRule', () => {
    it('should create a new rule', async () => {
      req.user = { id: 'user-1' };
      req.body = { name: 'New Rule' };
      (NotificationService.createRule as jest.Mock).mockResolvedValue({ id: 'rule-1', name: 'New Rule' });

      await createNotificationRule(req as AuthRequest, res as Response);

      expect(statusMock).toHaveBeenCalledWith(201);
      expect(jsonMock).toHaveBeenCalledWith({ id: 'rule-1', name: 'New Rule' });
    });
  });

  describe('getUserNotificationRules', () => {
    it('should return user rules', async () => {
      req.user = { id: 'user-1' };
      (NotificationService.getUserRules as jest.Mock).mockResolvedValue([{ id: 'rule-1', name: 'Rule 1' }]);

      await getUserNotificationRules(req as AuthRequest, res as Response);

      expect(jsonMock).toHaveBeenCalledWith([{ id: 'rule-1', name: 'Rule 1' }]);
    });
  });

  describe('deleteNotificationRule', () => {
    it('should delete a rule and return 204', async () => {
      req.params = { id: 'rule-1' };
      (NotificationService.deleteRule as jest.Mock).mockResolvedValue(true);

      await deleteNotificationRule(req as AuthRequest, res as Response);

      expect(statusMock).toHaveBeenCalledWith(204);
      expect(sendMock).toHaveBeenCalledWith();
    });
  });
});
