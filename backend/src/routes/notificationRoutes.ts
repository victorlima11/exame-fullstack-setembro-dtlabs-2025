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

/**
 * @swagger
 * /notifications/rules:
 *   post:
 *     summary: Cria uma nova regra de notificação
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/NotificationRuleInput'
 *     responses:
 *       201:
 *         description: Regra criada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/NotificationRule'
 *       401:
 *         description: Não autorizado
 *       500:
 *         description: Erro interno do servidor
 */
router.post('/rules', authMiddleware, createNotificationRule);

/**
 * @swagger
 * /notifications/rules:
 *   get:
 *     summary: Obtém todas as regras de notificação do usuário
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de regras de notificação
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/NotificationRule'
 *       401:
 *         description: Não autorizado
 *       500:
 *         description: Erro interno do servidor
 */
router.get('/rules', authMiddleware, getUserNotificationRules);

/**
 * @swagger
 * /notifications/rules/{id}:
 *   put:
 *     summary: Atualiza uma regra de notificação
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID da regra de notificação
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/NotificationRuleInput'
 *     responses:
 *       200:
 *         description: Regra atualizada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/NotificationRule'
 *       401:
 *         description: Não autorizado
 *       404:
 *         description: Regra não encontrada
 *       500:
 *         description: Erro interno do servidor
 */
router.put('/rules/:id', authMiddleware, updateNotificationRule);

/**
 * @swagger
 * /notifications/rules/{id}:
 *   delete:
 *     summary: Deleta uma regra de notificação
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID da regra de notificação
 *     responses:
 *       204:
 *         description: Regra deletada com sucesso
 *       401:
 *         description: Não autorizado
 *       500:
 *         description: Erro interno do servidor
 */
router.delete('/rules/:id', authMiddleware, deleteNotificationRule);

/**
 * @swagger
 * /notifications:
 *   get:
 *     summary: Obtém todas as notificações do usuário
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de notificações
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Notification'
 *       401:
 *         description: Não autorizado
 *       500:
 *         description: Erro interno do servidor
 */
router.get('/', authMiddleware, getUserNotifications);

export default router;
