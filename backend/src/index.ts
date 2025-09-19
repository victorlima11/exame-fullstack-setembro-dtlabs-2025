import { server } from './server';
import dotenv from 'dotenv';

dotenv.config({ path: ".env.TEMPLATE" });


const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log('Heartbeat worker initialized');
});