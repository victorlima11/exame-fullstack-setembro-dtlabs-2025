import { Request, Response, NextFunction } from 'express';

export function validateDeviceCreate(req: Request, res: Response, next: NextFunction) {
  if (!req.body) {
    return res.status(400).json({ error: 'Dados do dispositivo são obrigatórios.' });
  }

  const { name, location, sn, description } = req.body;

  if (!name || !location || !sn) {
    return res.status(400).json({ error: 'Nome, localização e SN são obrigatórios.' });
  }

  if (!/^\d{12}$/.test(sn)) {
    return res.status(400).json({ error: 'Serial Number deve ter exatamente 12 dígitos numéricos.' });
  }

  if (name.length > 255) {
    return res.status(400).json({ error: 'Nome não pode ter mais de 255 caracteres.' });
  }

  if (location.length > 255) {
    return res.status(400).json({ error: 'Localização não pode ter mais de 255 caracteres.' });
  }

  if (description && description.length > 1000) {
    return res.status(400).json({ error: 'Descrição não pode ter mais de 1000 caracteres.' });
  }

  next();
}

export function validateDeviceUpdate(req: Request, res: Response, next: NextFunction) {
  if (!req.body) {
    return res.status(400).json({ error: 'Dados de atualização são obrigatórios.' });
  }

  const { name, location, sn, description } = req.body;

  if (sn && !/^\d{12}$/.test(sn)) {
    return res.status(400).json({ error: 'Serial Number deve ter exatamente 12 dígitos numéricos.' });
  }

  if (name && name.length > 255) {
    return res.status(400).json({ error: 'Nome não pode ter mais de 255 caracteres.' });
  }

  if (location && location.length > 255) {
    return res.status(400).json({ error: 'Localização não pode ter mais de 255 caracteres.' });
  }

  if (description && description.length > 1000) {
    return res.status(400).json({ error: 'Descrição não pode ter mais de 1000 caracteres.' });
  }

  next();
}

export function validateDeviceId(req: Request, res: Response, next: NextFunction) {
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({ error: 'ID do dispositivo é obrigatório.' });
  }

  next();
}

export function validateDeviceFilters(req: Request, res: Response, next: NextFunction) {
  const { name, location, sn } = req.query;

  if (sn && typeof sn === 'string' && !/^\d{0,12}$/.test(sn)) {
    return res.status(400).json({ error: 'SN deve conter apenas dígitos e até 12 caracteres.' });
  }

  if (name && typeof name === 'string' && name.length > 100) {
    return res.status(400).json({ error: 'Filtro de nome muito longo.' });
  }

  if (location && typeof location === 'string' && location.length > 100) {
    return res.status(400).json({ error: 'Filtro de localização muito longo.' });
  }

  next();
}