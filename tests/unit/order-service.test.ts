import { describe, expect, it } from 'vitest';
import { OrderService } from '../../src/application/order-service.js';
import { createMemoryRepositories } from '../../src/infrastructure/memory/repositories.js';

describe('OrderService', () => {
  it('rechaza pedidos para un lead inexistente', async () => {
    const service = new OrderService(createMemoryRepositories());
    await expect(service.create({
      leadId: 'missing',
      items: [{ productoId: 'P-1', descripcion: 'Producto', cantidad: 1, precioUnitario: 10 }],
      direccionEntrega: 'Calle 1',
      moneda: 'ARS'
    })).rejects.toMatchObject({ message: 'Lead no encontrado', status: 404 });
  });

  it('calcula subtotales y total redondeados a dos decimales', async () => {
    const repos = createMemoryRepositories();
    const lead = await repos.leads.create({ telefono: '111', nombreWA: 'Ana' });
    const order = await new OrderService(repos).create({
      leadId: lead.id,
      items: [
        { productoId: 'P-1', descripcion: 'Uno', cantidad: 3, precioUnitario: 0.335 },
        { productoId: 'P-2', descripcion: 'Dos', cantidad: 2, precioUnitario: 1.115 }
      ],
      direccionEntrega: 'Calle 1',
      moneda: 'USD'
    });
    expect(order.items.map(item => item.subtotal)).toEqual([1.01, 2.23]);
    expect(order.montoTotal).toBe(3.24);
    expect(order.estado).toBe('PENDIENTE');
  });

  it('rechaza cambiar el estado de un pedido inexistente', async () => {
    const service = new OrderService(createMemoryRepositories());
    await expect(service.changeState('missing', 'CANCELADO'))
      .rejects.toMatchObject({ message: 'Pedido no encontrado', status: 404 });
  });
});
