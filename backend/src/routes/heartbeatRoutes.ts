import { Router } from 'express';
import { HeartbeatController } from '../controllers/heartbeatController';

const router = Router();

/**
 * @swagger
 * /heartbeats:
 *   post:
 *     summary: Registra um novo heartbeat de um dispositivo
 *     tags: [Heartbeats]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - device_sn
 *               - cpu_usage
 *               - ram_usage
 *               - disk_free
 *               - temperature
 *               - latency
 *               - connectivity
 *               - boot_time
 *             properties:
 *               device_sn:
 *                 type: string
 *                 description: Número de série do dispositivo.
 *               cpu_usage:
 *                 type: number
 *                 format: float
 *                 description: Percentual de uso da CPU.
 *               ram_usage:
 *                 type: number
 *                 format: float
 *                 description: Percentual de uso da RAM.
 *               disk_free:
 *                 type: number
 *                 format: float
 *                 description: Espaço livre em disco (em GB ou %).
 *               temperature:
 *                 type: number
 *                 format: float
 *                 description: Temperatura da CPU/sistema.
 *               latency:
 *                 type: number
 *                 format: float
 *                 description: Latência de rede (em ms).
 *               connectivity:
 *                 type: number
 *                 description: Status da conectividade de rede (1 Online, 0 Offline).
 *               boot_time:
 *                 type: string
 *                 format: date-time
 *                 description: Data e hora do último boot.
 *     responses:
 *       202:
 *         description: Heartbeat recebido e enfileirado para processamento.
 *       500:
 *         description: Erro interno do servidor.
 */
router.post('/', HeartbeatController.createHeartbeat);

/**
 * @swagger
 * /heartbeats/{device_sn}:
 *   get:
 *     summary: Obtém o histórico de heartbeats de um dispositivo
 *     tags: [Heartbeats]
 *     parameters:
 *       - in: path
 *         name: device_sn
 *         required: true
 *         schema:
 *           type: string
 *         description: Número de série do dispositivo.
 *       - in: query
 *         name: start
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Filtro de data/hora inicial (ISO 8601).
 *       - in: query
 *         name: end
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Filtro de data/hora final (ISO 8601).
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 1000
 *         description: Número máximo de registros a serem retornados.
 *     responses:
 *       200:
 *         description: Lista de heartbeats para o dispositivo.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 device_sn:
 *                   type: string
 *                 heartbeats:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Heartbeat'
 *       500:
 *         description: Erro interno do servidor.
 */
router.get('/:device_sn', HeartbeatController.getDeviceHeartbeats);

/**
 * @swagger
 * /heartbeats/{device_sn}/latest:
 *   get:
 *     summary: Obtém o último heartbeat de um dispositivo
 *     tags: [Heartbeats]
 *     parameters:
 *       - in: path
 *         name: device_sn
 *         required: true
 *         schema:
 *           type: string
 *         description: Número de série do dispositivo.
 *     responses:
 *       200:
 *         description: Último heartbeat registrado para o dispositivo.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Heartbeat'
 *       404:
 *         description: Nenhum heartbeat encontrado para este dispositivo.
 *       500:
 *         description: Erro interno do servidor.
 */
router.get('/:device_sn/latest', HeartbeatController.getLatestDeviceHeartbeat);

export default router;
