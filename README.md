# DeviceWatch - Sistema de Monitoramento de Dispositivos

DeviceWatch é uma plataforma completa para monitoramento em tempo real de dispositivos IoT, com dashboard interativo, sistema de notificações e telemetria.

Váriaveis de ambiente estão propositalmente expostas apenas para facilitar testes!

# Índice
#### Instalação
#### Back-end
#### Front-end
#### Telemetria Simulada
#### Testes

# Instalação 
O sistema roda utilizando docker, então na raiz do projeto precisa apenas utilizar o docker-compose:
```bash
docker-compose up --build
```
Também é possível rodar cada container separado a partir de uma imagem ex:
```bash
cd simulator
docker build -t nome_imagem .
docker run -d --name nome_container [argumentos] nome_imagem 
```

Instalação manual back-end:
```bash
cd backend
npm install 
npm run dev
```
Ou versão de produção (Necessário adaptações):
```bash
cd backend
npm install 
npm run build
npm start
```

Instalação manual front-end:
```bash
cd frontend
npm install 
npm run build
npm start
```

Instalação manual simulador de telemetria:
```bash
cd simulator
pip install -r requirements.txt
python app.py
```

# Back-end
[![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge\&logo=node.js\&logoColor=white)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge\&logo=typescript\&logoColor=white)](https://www.typescriptlang.org/)
[![Bullmq](https://img.shields.io/badge/Bullmq-007ACC?style=for-the-badge&logo=bullmq&logoColor=white)]([https://www.typescriptlang.org/](https://bullmq.io/))
[![Express](https://img.shields.io/badge/Express-000000?style=for-the-badge\&logo=express\&logoColor=white)](https://expressjs.com/)
[![JWT](https://img.shields.io/badge/JWT-000000?style=for-the-badge\&logo=jsonwebtokens\&logoColor=white)](https://jwt.io/)
[![Bcrypt](https://img.shields.io/badge/Bcrypt-0F2D3C?style=for-the-badge)](https://www.npmjs.com/package/bcrypt)
[![Swagger](https://img.shields.io/badge/Swagger-85EA2D?style=for-the-badge\&logo=swagger\&logoColor=white)](https://swagger.io/)
[![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)](https://www.docker.com/)
[![Redis](https://img.shields.io/badge/Redis-DC382D?style=for-the-badge&logo=redis&logoColor=white)](https://redis.io/)
[![Jest](https://img.shields.io/badge/Jest-C21325?style=for-the-badge&logo=jest&logoColor=white)](https://jestjs.io/)

Padrão do projeto (MVC)

```
backend/
├─ db/
│  └─ init.sql        # Seeds do banco de dados
├─ src/
│  ├─ config/         # Arquivos de configurações iniciais (db, swagger, bull...)
│  ├─ controllers/    # Controllers da aplicação 
│  ├─ middlewares/    # Middlewares para validação
│  ├─ queues/         # Módulos para implementação das filas
│  ├─ repositories/   # Repositórios da aplicação 
│  ├─ routes/         # Rotas da aplicação
│  ├─ services/       # Serviços da aplicação
│  ├─ tests/          # Testes da aplicação 
│  ├─ types/          # Tipagem de dados da aplicação
│  ├─ utils/          # Utilitários
│  ├─ index.ts        # Arquivo principal de iniciação do servidor
│  └─ server.ts       # Configurações do servidor
├─ Dockerfile
└─ package.json
```


