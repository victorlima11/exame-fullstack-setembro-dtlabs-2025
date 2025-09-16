import { Router } from 'express';
import { authMiddleware } from '../middlewares/authMiddleware';
import {
  createNotificationRule,
  getUserNotificationRules,
  deleteNotificationRule,
  getUserNotifications,
  updateNotificationRule
} from '../controllers/notificationController';

const router = Router();



router.post('/rules', authMiddleware, createNotificationRule);
router.get('/rules', authMiddleware, getUserNotificationRules);
router.put('/rules/:id', authMiddleware, updateNotificationRule);
router.delete('/rules/:id', authMiddleware, deleteNotificationRule);

router.get('/', authMiddleware, getUserNotifications);

export default router;