import { describe, expect, it } from 'vitest';
import { createMemoryRepositories } from '../../src/infrastructure/memory/repositories.js';

describe('repositorios en memoria', () => {
  it('busca leads sin distinguir mayúsculas y pagina resultados', async () => {
    const repos = createMemoryRepositories();
    const ana = await repos.leads.create({ telefono: '111', nombreWA: 'Ana Pérez' });
    await repos.leads.create({ telefono: '222', nombreWA: 'Beto' });
    expect(await repos.leads.findByPhone('111')).toEqual(ana);
    expect(await repos.leads.findById(ana.id)).toEqual(ana);
    expect((await repos.leads.list({ page: 1, limit: 1 })).data).toHaveLength(1);
    expect((await repos.leads.list({ page: 1, limit: 20, search: 'PÉREZ' })).data).toEqual([ana]);
  });

  it('filtra y pagina pedidos por estado y lead', async () => {
    const repos = createMemoryRepositories();
    const base = { items: [], montoTotal: 0, moneda: 'ARS' as const, direccionEntrega: 'Calle 1' };
    const first = await repos.orders.create({ ...base, leadId: 'lead-1', estado: 'PENDIENTE' });
    await repos.orders.create({ ...base, leadId: 'lead-2', estado: 'CANCELADO' });
    await repos.orders.updateState(first.id, 'EN_PREPARACION');
    expect(await repos.orders.findById(first.id)).toMatchObject({ estado: 'EN_PREPARACION' });
    expect(await repos.orders.findById('missing')).toBeNull();
    expect((await repos.orders.list({ page: 1, limit: 10, estado: 'EN_PREPARACION', leadId: 'lead-1' })).data)
      .toEqual([first]);
    expect((await repos.orders.list({ page: 2, limit: 1 })).data).toHaveLength(1);
  });
});
