import { app } from './server';

const PORT = process.env.PORT

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});