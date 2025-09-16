import { Request, Response, NextFunction } from 'express';
import { getDeviceById } from '../services/deviceService';

export async function validateDeviceOwnership(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const userId = (req as any).user.id;

    console.log('Validando propriedade - Device ID:', id);
    console.log('Validando propriedade - User ID:', userId);

    const device = await getDeviceById(id);
    console.log('Device encontrado:', device);

    if (!device) {
      console.log('Device não encontrado');
      return res.status(404).json({ error: 'Dispositivo não encontrado.' });
    }

    console.log('Device user_id:', device.user_id);
    console.log('Request user_id:', userId);

    if (device.user_id !== userId) {
      console.log('Acesso negado - Device não pertence ao usuário');
      return res.status(403).json({ error: 'Acesso negado. Dispositivo não pertence ao usuário.' });
    }

    (req as any).device = device;
    next();
  } catch (error: any) {
    console.error('Erro detalhado na validação:', error);
    res.status(500).json({ error: 'Erro ao verificar propriedade do dispositivo.' });
  }
}