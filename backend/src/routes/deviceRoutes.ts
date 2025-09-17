import { Router } from 'express';
import {
  createDeviceController,
  getDeviceController,
  getUserDevicesController,
  getAllDevicesController,
  updateDeviceController,
  deleteDeviceController
} from '../controllers/deviceController';
import { authMiddleware } from '../middlewares/authMiddleware';
import {
  validateDeviceCreate,
  validateDeviceUpdate,
  validateDeviceId,
  validateDeviceFilters
} from '../middlewares/deviceMiddleware';
import { validateDeviceOwnership } from '../middlewares/deviceOwnershipMiddleware';

const router = Router();

router.use(authMiddleware);

/**
 * @swagger
 * /devices:
 *   post:
 *     summary: Cria um novo dispositivo
 *     tags: [Devices]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - location
 *               - sn
 *             properties:
 *               name:
 *                 type: string
 *                 description: Nome do dispositivo
 *               location:
 *                 type: string
 *                 description: Localização do dispositivo
 *               sn:
 *                 type: string
 *                 description: Número de série do dispositivo (12 dígitos numéricos)
 *               description:
 *                 type: string
 *                 description: Descrição do dispositivo
 *     responses:
 *       201:
 *         description: Dispositivo criado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Device'
 *       400:
 *         description: Dados inválidos ou número de série já existente
 *       401:
 *         description: Não autorizado
 */
router.post('/', validateDeviceCreate, createDeviceController);

/**
 * @swagger
 * /devices/user:
 *   get:
 *     summary: Obtém todos os dispositivos do usuário autenticado
 *     tags: [Devices]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de dispositivos do usuário
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Device'
 *       401:
 *         description: Não autorizado
 *       500:
 *         description: Erro interno do servidor
 */
router.get('/user', getUserDevicesController);

/**
 * @swagger
 * /devices:
 *   get:
 *     summary: Obtém todos os dispositivos do usuário com filtros opcionais
 *     tags: [Devices]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: name
 *         schema:
 *           type: string
 *         description: Filtrar por nome do dispositivo
 *       - in: query
 *         name: location
 *         schema:
 *           type: string
 *         description: Filtrar por localização do dispositivo
 *       - in: query
 *         name: sn
 *         schema:
 *           type: string
 *         description: Filtrar por número de série do dispositivo
 *     responses:
 *       200:
 *         description: Lista de dispositivos filtrada
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Device'
 *       400:
 *         description: Filtro inválido
 *       401:
 *         description: Não autorizado
 *       500:
 *         description: Erro interno do servidor
 */
router.get('/', validateDeviceFilters, getAllDevicesController);

/**
 * @swagger
 * /devices/{id}:
 *   get:
 *     summary: Obtém um dispositivo específico pelo ID
 *     tags: [Devices]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID do dispositivo
 *     responses:
 *       200:
 *         description: Detalhes do dispositivo
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Device'
 *       401:
 *         description: Não autorizado
 *       403:
 *         description: Acesso negado
 *       404:
 *         description: Dispositivo não encontrado
 *       500:
 *         description: Erro interno do servidor
 */
router.get('/:id', validateDeviceId, validateDeviceOwnership, getDeviceController);

/**
 * @swagger
 * /devices/{id}:
 *   put:
 *     summary: Atualiza um dispositivo específico
 *     tags: [Devices]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID do dispositivo
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: Novo nome do dispositivo
 *               location:
 *                 type: string
 *                 description: Nova localização do dispositivo
 *               sn:
 *                 type: string
 *                 description: Novo número de série do dispositivo (12 dígitos numéricos)
 *               description:
 *                 type: string
 *                 description: Nova descrição do dispositivo
 *     responses:
 *       200:
 *         description: Dispositivo atualizado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Device'
 *       400:
 *         description: Dados inválidos
 *       401:
 *         description: Não autorizado
 *       403:
 *         description: Acesso negado
 *       404:
 *         description: Dispositivo não encontrado
 */
router.put('/:id', validateDeviceId, validateDeviceUpdate, validateDeviceOwnership, updateDeviceController);

/**
 * @swagger
 * /devices/{id}:
 *   delete:
 *     summary: Deleta um dispositivo específico
 *     tags: [Devices]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID do dispositivo
 *     responses:
 *       204:
 *         description: Dispositivo deletado com sucesso
 *       401:
 *         description: Não autorizado
 *       403:
 *         description: Acesso negado
 *       404:
 *         description: Dispositivo não encontrado
 *       500:
 *         description: Erro interno do servidor
 */
router.delete('/:id', validateDeviceId, validateDeviceOwnership, deleteDeviceController);

export default router;