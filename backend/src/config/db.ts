import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

if (!process.env.DATABASE_URL) {
  throw new Error('Não foi possível encontrar a variável de ambiente DATABASE_URL.');
}

export const db = new Pool({
  connectionString: process.env.DATABASE_URL,
});

db.connect()
  .then(() => console.log('Conectado ao PostgreSQL com sucesso'))
  .catch((err) => console.error('Erro ao conectar ao PostgreSQL:', err));
