import type { OrderState } from './entities.js';
import { DomainError } from './errors.js';

const transitions: Record<OrderState, readonly OrderState[]> = {
  PENDIENTE: ['EN_PREPARACION', 'CANCELADO'],
  EN_PREPARACION: ['DESPACHADO', 'CANCELADO'],
  DESPACHADO: ['ENTREGADO', 'CANCELADO'],
  ENTREGADO: [], CANCELADO: []
};

export function assertOrderTransition(from: OrderState, to: OrderState): void {
  if (!transitions[from].includes(to)) throw new DomainError(`Transición inválida: ${from} -> ${to}`, 409);
}
