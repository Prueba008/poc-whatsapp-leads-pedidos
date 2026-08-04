import { describe, expect, it } from 'vitest';
import { assertOrderTransition } from '../../src/domain/order-state.js';

describe('ciclo de vida del pedido', () => {
  it('acepta una transición válida', () => expect(() => assertOrderTransition('PENDIENTE', 'EN_PREPARACION')).not.toThrow());
  it('rechaza saltar directamente a entregado', () => expect(() => assertOrderTransition('PENDIENTE', 'ENTREGADO')).toThrow('Transición inválida'));
  it('no permite modificar un pedido finalizado', () => expect(() => assertOrderTransition('ENTREGADO', 'CANCELADO')).toThrow());
});
