import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { Express } from 'express';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Telemetry-API',
      version: '1.0.0',
      description: 'API para gerenciamento de dispositivos IoT',
    },
    servers: [
      {
        url: 'http://localhost:3000/api/v1',
        description: 'Servidor de Desenvolvimento'
      }
    ],
    components: {
      securitySchemes: {
        BearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Token JWT obtido no login'
        }
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid', description: 'ID do usuário' },
            name: { type: 'string', description: 'Nome do usuário' },
            email: { type: 'string', format: 'email', description: 'Email do usuário' },
            created_at: { type: 'string', format: 'date-time', description: 'Data de criação do usuário' }
          }
        },
        Device: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid', description: 'ID do dispositivo' },
            name: { type: 'string', description: 'Nome do dispositivo' },
            location: { type: 'string', description: 'Localização do dispositivo' },
            sn: { type: 'string', description: 'Número de série do dispositivo' },
            description: { type: 'string', description: 'Descrição do dispositivo' },
            user_id: { type: 'string', format: 'uuid', description: 'ID do usuário proprietário do dispositivo' },
            created_at: { type: 'string', format: 'date-time', description: 'Data de criação do dispositivo' },
            updated_at: { type: 'string', format: 'date-time', description: 'Data da última atualização do dispositivo' }
          }
        },
        Heartbeat: {
          type: 'object',
          properties: {
            device_sn: { type: 'string', description: 'Número de série do dispositivo' },
            cpu_usage: { type: 'number', format: 'float', description: 'Uso da CPU em porcentagem' },
            ram_usage: { type: 'number', format: 'float', description: 'Uso da RAM em porcentagem' },
            disk_free: { type: 'number', format: 'float', description: 'Espaço livre em disco (GB)' },
            temperature: { type: 'number', format: 'float', description: 'Temperatura do dispositivo em Celsius' },
            latency: { type: 'number', format: 'float', description: 'Latência da rede em ms' },
            connectivity: { type: 'integer', enum: [0, 1], description: 'Status da conectividade (0 = offline, 1 = online)' },
            boot_time: { type: 'string', format: 'date-time', description: 'Data do último boot do dispositivo' },
            timestamp: { type: 'string', format: 'date-time', description: 'Data de recebimento do heartbeat' }
          }
        },
        Notification: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid', description: 'ID da notificação' },
            user_id: { type: 'string', format: 'uuid', description: 'ID do usuário que recebeu a notificação' },
            device_sn: { type: 'string', description: 'Número de série do dispositivo que gerou a notificação' },
            message: { type: 'string', description: 'Mensagem da notificação' },
            triggered_value: { type: 'number', description: 'Valor que disparou a notificação' },
            rule_condition: { type: 'object', description: 'Condição da regra que gerou a notificação' },
            created_at: { type: 'string', format: 'date-time', description: 'Data de criação da notificação' }
          }
        },
        NotificationRule: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid', description: 'ID da regra de notificação' },
            user_id: { type: 'string', format: 'uuid', description: 'ID do usuário proprietário da regra' },
            device_sn: { type: 'string', description: 'Número de série do dispositivo ao qual a regra se aplica (opcional)' },
            condition: {
              type: 'object',
              description: 'Condição para disparar a notificação',
              properties: {
                metric: { type: 'string', description: 'Métrica a ser avaliada (ex: \'temperature\')' },
                operator: { type: 'string', enum: ['>', '<', '=', '>=', '<='], description: 'Operador de comparação' },
                value: { type: 'number', description: 'Valor de referência para a comparação' }
              }
            },
            created_at: { type: 'string', format: 'date-time', description: 'Data de criação da regra' }
          }
        },
        NotificationRuleInput: {
            type: 'object',
            description: 'Dados para criar ou atualizar uma regra de notificação',
            properties: {
                device_sn: { type: 'string', description: 'Número de série do dispositivo ao qual a regra se aplica (opcional, se não fornecido, aplica-se a todos os dispositivos do usuário)' },
                condition: {
                    type: 'object',
                    required: ['metric', 'operator', 'value'],
                    properties: {
                        metric: { type: 'string', description: 'Métrica a ser avaliada (ex: \'temperature\', \'cpu_usage\')' },
                        operator: { type: 'string', enum: ['>', '<', '=', '>=', '<='], description: 'Operador de comparação' },
                        value: { type: 'number', description: 'Valor de referência para a comparação' }
                    }
                }
            }
        }
      }
    },
    security: [
      {
        BearerAuth: []
      }
    ]
  },
  apis: ['./src/routes/*.ts', './src/controllers/*.ts'],
};

const specs = swaggerJsdoc(options);

export const setupSwagger = (app: Express): void => {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));
};