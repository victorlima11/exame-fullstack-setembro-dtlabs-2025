
import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import http from 'http';
import morgan from 'morgan';
import userRoutes from './routes/userRoutes';
import deviceRoutes from './routes/deviceRoutes';
import notificationsRoutes from './routes/notificationRoutes';
import openDeivceRoutes from './routes/openDeviceRoutes';
import heartbeatRoutes from './routes/heartbeatRoutes';
import { setupSwagger } from './config/swagger';
import { initializeSocketIO } from './utils/socketIO';
import './queues/heartbeatQueue';
import './queues/heartbeatWorker';


const app = express();
const server = http.createServer(app);

setupSwagger(app);

app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

app.use("/api/v1/users", userRoutes);
app.use("/api/v1/devices", deviceRoutes);
app.use("/api/v1/opendevices", openDeivceRoutes); // Route public only for telemetry automation sender - Rota pública apenas para automatização de telemetria
app.use("/api/v1/notifications", notificationsRoutes);
app.use("/api/v1/heartbeats", heartbeatRoutes);


app.get('/healthcheck', (req, res) => {
  res.send('Server is alive!');
});


initializeSocketIO(server);

export { app, server };
