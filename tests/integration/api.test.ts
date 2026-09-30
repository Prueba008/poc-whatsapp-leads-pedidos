import { createHmac } from 'node:crypto';
import request from 'supertest';
import { beforeEach, describe, expect, it } from 'vitest';
import { createApp } from '../../src/app.js';
import type { Config } from '../../src/config.js';
import { createMemoryRepositories } from '../../src/infrastructure/memory/repositories.js';
import { whatsappPayload } from '../fixtures/whatsapp.js';

const jwtSecret = 'test-secret-that-is-at-least-32-characters-long';
const config: Config = { PORT: 3000, NODE_ENV: 'test', MONGO_URI: 'mongodb://unused', REPOSITORY_MODE: 'memory', WHATSAPP_VERIFY_TOKEN: 'verify-me', WHATSAPP_APP_SECRET: 'app-secret', JWT_SECRET: jwtSecret, LOG_LEVEL: 'silent' };
const jwtHeader = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
const jwtPayload = Buffer.from(JSON.stringify({ sub: 'test-user', exp: Math.floor(Date.now() / 1000) + 3600 })).toString('base64url');
const jwtSignature = createHmac('sha256', jwtSecret).update(`${jwtHeader}.${jwtPayload}`).digest('base64url');
const authorization = `Bearer ${jwtHeader}.${jwtPayload}.${jwtSignature}`;

describe('API WALeads - integración HTTP', () => {
  let app: ReturnType<typeof createApp>; let repos: ReturnType<typeof createMemoryRepositories>;
  beforeEach(() => { repos = createMemoryRepositories(); app = createApp({ config, repos }); });
  it('completa el handshake de Meta', async () => { await request(app).get('/api/v1/webhooks/whatsapp').query({ 'hub.mode': 'subscribe', 'hub.verify_token': 'verify-me', 'hub.challenge': '12345' }).expect(200, '12345'); });
  it('rechaza un webhook sin firma válida', async () => { await request(app).post('/api/v1/webhooks/whatsapp').send(whatsappPayload).expect(401); });
  it('ingresa el mensaje, deduplica y expone el lead', async () => {
    const body = JSON.stringify(whatsappPayload); const signature = `sha256=${createHmac('sha256', config.WHATSAPP_APP_SECRET).update(body).digest('hex')}`;
    await request(app).post('/api/v1/webhooks/whatsapp').set('Content-Type', 'application/json').set('x-hub-signature-256', signature).send(body).expect(200);
    await request(app).post('/api/v1/webhooks/whatsapp').set('Content-Type', 'application/json').set('x-hub-signature-256', signature).send(body).expect(200);
    const response = await request(app).get('/api/v1/leads?search=549111').set('Authorization', authorization).expect(200);
    expect(response.body.meta.total).toBe(1); expect(response.body.data[0].nombreWA).toBe('Sergio R.');
  });
  it('crea un pedido y controla sus transiciones', async () => {
    const lead = await repos.leads.create({ telefono: '5491112345678', nombreWA: 'Sergio' });
    const created = await request(app).post('/api/v1/pedidos').set('Authorization', authorization).send({ leadId: lead.id, items: [{ productoId: 'P-1', descripcion: 'Producto', cantidad: 2, precioUnitario: 1250.5 }], direccionEntrega: 'Av. Corrientes 1234', moneda: 'ARS' }).expect(201);
    expect(created.body.montoTotal).toBe(2501);
    await request(app).patch(`/api/v1/pedidos/${created.body.id}/estado`).set('Authorization', authorization).send({ estado: 'EN_PREPARACION' }).expect(200);
    await request(app).patch(`/api/v1/pedidos/${created.body.id}/estado`).set('Authorization', authorization).send({ estado: 'ENTREGADO' }).expect(409);
  });
});
