import { beforeEach, describe, expect, it, vi } from 'vitest';

const models = vi.hoisted(() => ({
  LeadModel: { findOne: vi.fn(), findById: vi.fn(), create: vi.fn(), find: vi.fn(), countDocuments: vi.fn() },
  MessageModel: { exists: vi.fn(), create: vi.fn() },
  OrderModel: { countDocuments: vi.fn(), create: vi.fn(), findById: vi.fn(), findByIdAndUpdate: vi.fn(), find: vi.fn() },
  mapDoc: vi.fn((doc: Record<string, unknown>) => doc)
}));

vi.mock('../../src/infrastructure/mongo/models.js', () => models);

import { createMongoRepositories } from '../../src/infrastructure/mongo/repositories.js';

function queryResult(docs: unknown[]) {
  const query = { sort: vi.fn(), skip: vi.fn(), limit: vi.fn() };
  query.sort.mockReturnValue(query); query.skip.mockReturnValue(query); query.limit.mockResolvedValue(docs);
  return query;
}

describe('repositorios Mongo', () => {
  beforeEach(() => vi.clearAllMocks());

  it('busca, crea y lista leads', async () => {
    const doc = { id: 'lead-1' }; const query = queryResult([doc]);
    models.LeadModel.findOne.mockResolvedValue(doc);
    models.LeadModel.findById.mockResolvedValue(null);
    models.LeadModel.create.mockResolvedValue(doc);
    models.LeadModel.find.mockReturnValue(query);
    models.LeadModel.countDocuments.mockResolvedValue(1);
    const repos = createMongoRepositories();

    await expect(repos.leads.findByPhone('54911')).resolves.toBe(doc);
    await expect(repos.leads.findById('missing')).resolves.toBeNull();
    await expect(repos.leads.create({ telefono: '54911', nombreWA: 'Ana' })).resolves.toBe(doc);
    await expect(repos.leads.list({ page: 2, limit: 10, search: 'ana' })).resolves.toEqual({ data: [doc], total: 1 });
    expect(models.LeadModel.find).toHaveBeenCalledWith({ $or: [
      { telefono: { $regex: 'ana', $options: 'i' } }, { nombreWA: { $regex: 'ana', $options: 'i' } }
    ] });
    expect(query.skip).toHaveBeenCalledWith(10);
  });

  it('deduplica y crea mensajes', async () => {
    const doc = { id: 'message-1' };
    models.MessageModel.exists.mockResolvedValue({ _id: 'message-1' });
    models.MessageModel.create.mockResolvedValue(doc);
    const repos = createMongoRepositories();
    await expect(repos.messages.existsByWaId('wamid.1')).resolves.toBe(true);
    await expect(repos.messages.create({
      waMessageId: 'wamid.1', leadId: 'lead-1', direccion: 'ENTRANTE', tipo: 'TEXTO',
      contenido: 'Hola', timestampWA: new Date(0)
    })).resolves.toBe(doc);
  });

  it('crea, encuentra, actualiza y filtra pedidos', async () => {
    const doc = { id: 'order-1' }; const query = queryResult([doc]);
    models.OrderModel.countDocuments.mockResolvedValueOnce(0).mockResolvedValueOnce(1);
    models.OrderModel.create.mockResolvedValue(doc);
    models.OrderModel.findById.mockResolvedValue(doc);
    models.OrderModel.find.mockReturnValue(query);
    const update = { orFail: vi.fn().mockResolvedValue(doc) };
    models.OrderModel.findByIdAndUpdate.mockReturnValue(update);
    const repos = createMongoRepositories();
    const input = { leadId: 'lead-1', estado: 'PENDIENTE' as const, items: [], montoTotal: 0, moneda: 'ARS' as const, direccionEntrega: 'Calle 1' };

    await expect(repos.orders.create(input)).resolves.toBe(doc);
    expect(models.OrderModel.create).toHaveBeenCalledWith(expect.objectContaining({ pedidoId: expect.stringMatching(/^PED-\d{4}-0001$/) }));
    await expect(repos.orders.findById('order-1')).resolves.toBe(doc);
    await expect(repos.orders.updateState('order-1', 'CANCELADO')).resolves.toBe(doc);
    expect(models.OrderModel.findByIdAndUpdate).toHaveBeenCalledWith('order-1', { estado: 'CANCELADO' }, { new: true, runValidators: true });
    await expect(repos.orders.list({ page: 1, limit: 20, estado: 'PENDIENTE', leadId: 'lead-1' }))
      .resolves.toEqual({ data: [doc], total: 1 });
    expect(models.OrderModel.find).toHaveBeenCalledWith({ estado: 'PENDIENTE', leadId: 'lead-1' });
  });
});
