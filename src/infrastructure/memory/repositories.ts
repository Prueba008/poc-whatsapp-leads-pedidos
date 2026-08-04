import { randomUUID } from 'node:crypto';
import type { Lead, Message, Order, OrderState } from '../../domain/entities.js';
import type { Repositories } from '../../application/ports.js';

export function createMemoryRepositories(): Repositories {
  const leads: Lead[] = []; const messages: Message[] = []; const orders: Order[] = [];
  return {
    leads: {
      async findByPhone(phone) { return leads.find(l => l.telefono === phone) ?? null; },
      async findById(id) { return leads.find(l => l.id === id) ?? null; },
      async create(input) { const now = new Date(); const lead = { id: randomUUID(), ...input, createdAt: now, updatedAt: now }; leads.push(lead); return lead; },
      async list({ page, limit, search }) { const q = search?.toLowerCase(); const filtered = q ? leads.filter(l => l.telefono.includes(q) || l.nombreWA.toLowerCase().includes(q)) : leads; return { data: filtered.slice((page - 1) * limit, page * limit), total: filtered.length }; }
    },
    messages: {
      async existsByWaId(id) { return messages.some(m => m.waMessageId === id); },
      async create(input) { const message = { id: randomUUID(), ...input, createdAt: new Date() }; messages.push(message); return message; }
    },
    orders: {
      async create(input) { const now = new Date(); const order: Order = { id: randomUUID(), pedidoId: `PED-${now.getUTCFullYear()}-${String(orders.length + 1).padStart(4, '0')}`, ...input, createdAt: now, updatedAt: now }; orders.push(order); return order; },
      async findById(id) { return orders.find(o => o.id === id) ?? null; },
      async updateState(id, state: OrderState) { const order = orders.find(o => o.id === id)!; order.estado = state; order.updatedAt = new Date(); return order; },
      async list({ page, limit, estado, leadId }) { const filtered = orders.filter(o => (!estado || o.estado === estado) && (!leadId || o.leadId === leadId)); return { data: filtered.slice((page - 1) * limit, page * limit), total: filtered.length }; }
    }
  };
}
