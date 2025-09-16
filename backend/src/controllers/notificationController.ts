import { db } from '../config/db';
export const getUserNotifications = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const result = await db.query('SELECT * FROM notifications WHERE user_id = $1 ORDER BY created_at DESC', [userId]);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};
import { Request, Response } from 'express';
import { NotificationRepository } from '../repositories/notificationRepository';
import { CreateNotificationRule } from '../types/notificationTypes';

export const createNotificationRule = async (req: Request, res: Response): Promise<void> => {
  try {
    const ruleData: CreateNotificationRule = {
      ...req.body,
      user_id: (req as any).user.id
    };

    const rule = await NotificationRepository.createRule(ruleData);
    res.status(201).json(rule);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getUserNotificationRules = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user.id;
    const rules = await NotificationRepository.findByUser(userId);
    res.json(rules);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const deleteNotificationRule = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    await NotificationRepository.deleteRule(id);
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};