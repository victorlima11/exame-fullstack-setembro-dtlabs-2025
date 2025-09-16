export const updateNotificationRule = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const updatedRule = await NotificationService.updateRule(id, updates);
    if (updatedRule) {
      res.json(updatedRule);
    } else {
      res.status(404).json({ error: 'Rule not found' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};
import { Request, Response } from 'express';
import { NotificationService } from '../services/notificationService';

export const getUserNotifications = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const notifications = await NotificationService.getUserNotifications(userId);
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const createNotificationRule = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const rule = await NotificationService.createRule(userId, req.body);
    res.status(201).json(rule);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getUserNotificationRules = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const rules = await NotificationService.getUserRules(userId);
    res.json(rules);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const deleteNotificationRule = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await NotificationService.deleteRule(id);
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};
