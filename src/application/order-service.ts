import type { OrderItem, OrderState } from '../domain/entities.js';
import { NotFoundError } from '../domain/errors.js';
import { assertOrderTransition } from '../domain/order-state.js';
import type { Repositories } from './ports.js';

export class OrderService {
  constructor(private readonly repos: Repositories) {}
  async create(input: { leadId: string; items: Omit<OrderItem, 'subtotal'>[]; direccionEntrega: string; moneda: 'ARS' | 'USD' }) {
    if (!await this.repos.leads.findById(input.leadId)) throw new NotFoundError('Lead');
    const items = input.items.map(i => ({ ...i, subtotal: Number((i.cantidad * i.precioUnitario).toFixed(2)) }));
    const montoTotal = Number(items.reduce((sum, i) => sum + i.subtotal, 0).toFixed(2));
    return this.repos.orders.create({ ...input, items, montoTotal, estado: 'PENDIENTE' });
  }
  async changeState(id: string, state: OrderState) {
    const order = await this.repos.orders.findById(id);
    if (!order) throw new NotFoundError('Pedido');
    assertOrderTransition(order.estado, state);
    return this.repos.orders.updateState(id, state);
  }
}
