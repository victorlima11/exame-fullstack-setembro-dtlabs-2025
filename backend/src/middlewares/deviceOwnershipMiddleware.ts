import { Request, Response, NextFunction } from 'express';
import { getDeviceById } from '../services/deviceService';

export async function validateDeviceOwnership(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const userId = (req as any).usuario.id;

    const device = await getDeviceById(id);
    
    if (!device) {
      return res.status(404).json({ error: 'Dispositivo não encontrado.' });
    }

    if (device.user_id !== userId) {
      return res.status(403).json({ error: 'Acesso negado. Dispositivo não pertence ao usuário.' });
    }

    (req as any).device = device;
    next();
  } catch (error: any) {
    res.status(500).json({ error: 'Erro ao verificar propriedade do dispositivo.' });
  }
}