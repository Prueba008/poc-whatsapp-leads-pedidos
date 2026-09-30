import express, { type NextFunction, type Request, type Response } from 'express';
import { pinoHttp } from 'pino-http';
import { z } from 'zod';
import type { Config } from './config.js';
import type { Repositories } from './application/ports.js';
import { WhatsAppService } from './application/whatsapp-service.js';
import { OrderService } from './application/order-service.js';
import { DomainError } from './domain/errors.js';
import { ORDER_STATES } from './domain/entities.js';
import { verifyWhatsAppSignature } from './http/signature.js';
import { extractMessages } from './http/whatsapp-payload.js';
import { requireJwt } from './http/auth.js';

const paging = z.object({ page: z.coerce.number().int().positive().default(1), limit: z.coerce.number().int().min(1).max(100).default(20) });
const orderInput = z.object({ leadId: z.string().min(1), items: z.array(z.object({ productoId: z.string().min(1), descripcion: z.string().min(1), cantidad: z.number().int().positive(), precioUnitario: z.number().nonnegative() })).min(1), direccionEntrega: z.string().min(1), moneda: z.enum(['ARS', 'USD']).default('ARS') });

export function createApp({ config, repos }: { config: Config; repos: Repositories }) {
  const app = express(); const whatsapp = new WhatsAppService(repos); const orders = new OrderService(repos);
  app.use(pinoHttp({ level: config.LOG_LEVEL, enabled: config.NODE_ENV !== 'test' }));
  app.use(express.json({ verify: (req, _res, buf) => { (req as Request & { rawBody: Buffer }).rawBody = Buffer.from(buf); } }));
  app.get('/health', (_req, res) => res.json({ status: 'UP' }));
  app.get('/api/v1/webhooks/whatsapp', (req, res) => {
    if (req.query['hub.mode'] === 'subscribe' && req.query['hub.verify_token'] === config.WHATSAPP_VERIFY_TOKEN) return res.status(200).send(String(req.query['hub.challenge'] ?? ''));
    return res.sendStatus(403);
  });
  app.post('/api/v1/webhooks/whatsapp', async (req, res, next) => {
    try {
      const raw = (req as Request & { rawBody: Buffer }).rawBody;
      if (!verifyWhatsAppSignature(raw, req.header('x-hub-signature-256'), config.WHATSAPP_APP_SECRET)) return res.status(401).json({ error: 'Firma inválida' });
      const messages = extractMessages(req.body);
      await Promise.all(messages.map(m => whatsapp.process(m)));
      return res.status(200).json({ status: 'EVENT_RECEIVED', messages: messages.length });
    } catch (error) { return next(error); }
  });
  app.use('/api/v1/leads', requireJwt(config.JWT_SECRET));
  app.use('/api/v1/pedidos', requireJwt(config.JWT_SECRET));
  app.get('/api/v1/leads', async (req, res, next) => { try { const q = paging.extend({ search: z.string().optional() }).parse(req.query); const result = await repos.leads.list(q); res.json({ data: result.data, meta: { total: result.total, page: q.page, limit: q.limit } }); } catch (e) { next(e); } });
  app.get('/api/v1/pedidos', async (req, res, next) => { try { const q = paging.extend({ estado: z.enum(ORDER_STATES).optional(), leadId: z.string().optional() }).parse(req.query); const result = await repos.orders.list(q); res.json({ data: result.data, meta: { total: result.total, page: q.page, limit: q.limit } }); } catch (e) { next(e); } });
  app.post('/api/v1/pedidos', async (req, res, next) => { try { res.status(201).json(await orders.create(orderInput.parse(req.body))); } catch (e) { next(e); } });
  app.patch('/api/v1/pedidos/:id/estado', async (req, res, next) => { try { const { estado } = z.object({ estado: z.enum(ORDER_STATES) }).parse(req.body); res.json(await orders.changeState(req.params.id!, estado)); } catch (e) { next(e); } });
  app.use((error: unknown, _req: Request, res: Response, next: NextFunction) => { void next; if (error instanceof z.ZodError) return res.status(400).json({ error: 'Datos inválidos', details: error.issues }); if (error instanceof DomainError) return res.status(error.status).json({ error: error.message }); return res.status(500).json({ error: 'Error interno' }); });
  return app;
}
