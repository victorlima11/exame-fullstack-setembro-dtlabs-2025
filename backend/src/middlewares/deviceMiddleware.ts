import { Request, Response, NextFunction } from 'express';

export function validateDeviceCreate(req: Request, res: Response, next: NextFunction) {
  if (!req.body) {
    return res.status(400).json({ error: 'Device data is required.' });
  }

  const { name, location, sn, description } = req.body;

  if (!name || !location || !sn) {
    return res.status(400).json({ error: 'Name, location, and SN are required.' });
  }

  if (!/^\d{12}$/.test(sn)) {
    return res.status(400).json({ error: 'Serial Number must have exactly 12 numeric digits.' });
  }

  if (name.length > 255) {
    return res.status(400).json({ error: 'Name cannot exceed 255 characters.' });
  }

  if (location.length > 255) {
    return res.status(400).json({ error: 'Location cannot exceed 255 characters.' });
  }

  if (description && description.length > 1000) {
    return res.status(400).json({ error: 'Description cannot exceed 1000 characters.' });
  }

  next();
}

export function validateDeviceUpdate(req: Request, res: Response, next: NextFunction) {
  if (!req.body) {
    return res.status(400).json({ error: 'Update data is required.' });
  }

  const { name, location, sn, description } = req.body;

  if (sn && !/^\d{12}$/.test(sn)) {
    return res.status(400).json({ error: 'Serial Number must have exactly 12 numeric digits.' });
  }

  if (name && name.length > 255) {
    return res.status(400).json({ error: 'Name cannot exceed 255 characters.' });
  }

  if (location && location.length > 255) {
    return res.status(400).json({ error: 'Location cannot exceed 255 characters.' });
  }

  if (description && description.length > 1000) {
    return res.status(400).json({ error: 'Description cannot exceed 1000 characters.' });
  }

  next();
}

export function validateDeviceId(req: Request, res: Response, next: NextFunction) {
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({ error: 'Device ID is required.' });
  }

  next();
}

export function validateDeviceFilters(req: Request, res: Response, next: NextFunction) {
  const { name, location, sn } = req.query;

  if (sn && typeof sn === 'string' && !/^\d{0,12}$/.test(sn)) {
    return res.status(400).json({ error: 'SN must contain only digits and up to 12 characters.' });
  }

  if (name && typeof name === 'string' && name.length > 100) {
    return res.status(400).json({ error: 'Name filter is too long.' });
  }

  if (location && typeof location === 'string' && location.length > 100) {
    return res.status(400).json({ error: 'Location filter is too long.' });
  }

  next();
}
