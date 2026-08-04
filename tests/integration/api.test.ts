import { createHmac } from 'node:crypto';
import request from 'supertest';
import { beforeEach, describe, expect, it } from 'vitest';
import { createApp } from '../../src/app.js';
import type { Config } from '../../src/config.js';
import { createMemoryRepositories } from '../../src/infrastructure/memory/repositories.js';
import { whatsappPayload } from '../fixtures/whatsapp.js';

const config: Config = { PORT: 3000, NODE_ENV: 'test', MONGO_URI: 'mongodb://unused', REPOSITORY_MODE: 'memory', WHATSAPP_VERIFY_TOKEN: 'verify-me', WHATSAPP_APP_SECRET: 'app-secret', LOG_LEVEL: 'silent' };
describe('API WALeads - integración HTTP', () => {
  let app: ReturnType<typeof createApp>; let repos: ReturnType<typeof createMemoryRepositories>;
  beforeEach(() => { repos = createMemoryRepositories(); app = createApp({ config, repos }); });
  it('completa el handshake de Meta', async () => { await request(app).get('/api/v1/webhooks/whatsapp').query({ 'hub.mode': 'subscribe', 'hub.verify_token': 'verify-me', 'hub.challenge': '12345' }).expect(200, '12345'); });
  it('rechaza un webhook sin firma válida', async () => { await request(app).post('/api/v1/webhooks/whatsapp').send(whatsappPayload).expect(401); });
  it('ingresa el mensaje, deduplica y expone el lead', async () => {
    const body = JSON.stringify(whatsappPayload); const signature = `sha256=${createHmac('sha256', config.WHATSAPP_APP_SECRET).update(body).digest('hex')}`;
    await request(app).post('/api/v1/webhooks/whatsapp').set('Content-Type', 'application/json').set('x-hub-signature-256', signature).send(body).expect(200);
    await request(app).post('/api/v1/webhooks/whatsapp').set('Content-Type', 'application/json').set('x-hub-signature-256', signature).send(body).expect(200);
    const response = await request(app).get('/api/v1/leads?search=549111').expect(200);
    expect(response.body.meta.total).toBe(1); expect(response.body.data[0].nombreWA).toBe('Sergio R.');
  });
  it('crea un pedido y controla sus transiciones', async () => {
    const lead = await repos.leads.create({ telefono: '5491112345678', nombreWA: 'Sergio' });
    const created = await request(app).post('/api/v1/pedidos').send({ leadId: lead.id, items: [{ productoId: 'P-1', descripcion: 'Producto', cantidad: 2, precioUnitario: 1250.5 }], direccionEntrega: 'Av. Corrientes 1234', moneda: 'ARS' }).expect(201);
    expect(created.body.montoTotal).toBe(2501);
    await request(app).patch(`/api/v1/pedidos/${created.body.id}/estado`).send({ estado: 'EN_PREPARACION' }).expect(200);
    await request(app).patch(`/api/v1/pedidos/${created.body.id}/estado`).send({ estado: 'ENTREGADO' }).expect(409);
  });
});
