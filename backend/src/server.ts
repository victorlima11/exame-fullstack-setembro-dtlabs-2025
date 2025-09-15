import express from 'express';
import dotenv from 'dotenv';
import morgan from 'morgan';
import userRoutes from './routes/userRoutes';
import deviceRoutes from './routes/deviceRoutes';

dotenv.config();

export const app = express();

app.use(morgan('dev'));

app.use(express.json());

app.use("/api/v1/users", userRoutes)
app.use("/api/v1/devices", deviceRoutes)

app.get('/healthcheck', (req, res) => {
  res.send('Server is alive!;');
});
