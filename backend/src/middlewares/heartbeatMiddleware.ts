import { Request, Response, NextFunction } from 'express';

export function heartBeatValidator(req: Request, res: Response, next: NextFunction) {

    if (!req.body) {
        return res.status(400).json({ error: 'Heartbeat data is required.' });
    }

    const { device_sn, cpu_usage, ram_usage, disk_free, temperature, latency, connectivity, boot_time } = req.body;

    if (!device_sn || cpu_usage === undefined || ram_usage === undefined || disk_free === undefined || temperature === undefined || latency === undefined || connectivity === undefined || !boot_time) {
        return res.status(400).json({ error: 'All fields are required.' });
    }

    if (cpu_usage < 0 || cpu_usage > 100) {
        return res.status(400).json({ error: 'CPU usage must be between 0 and 100.' });
    }
    if (ram_usage < 0 || ram_usage > 100) {
        return res.status(400).json({ error: 'RAM usage must be between 0 and 100.' });
    }
    if (disk_free < 0 || disk_free > 100) {
        return res.status(400).json({ error: 'Disk free must be between 0 and 100.' });
    }
    if (temperature < -40 || temperature > 150) {
        return res.status(400).json({ error: 'Temperature must be between -40 and 150 Celsius.' });
    }
    if (latency < 0) {
        return res.status(400).json({ error: 'Latency must be a positive number.' });
    }
    if (connectivity < 0 || connectivity > 1) {
        return res.status(400).json({ error: 'Connectivity must be between 0 and 1.' });
    }

    next();
};
