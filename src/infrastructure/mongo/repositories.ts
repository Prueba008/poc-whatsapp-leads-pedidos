import type { Repositories } from '../../application/ports.js';
import type { Lead, Message, Order } from '../../domain/entities.js';
import { CounterModel, LeadModel, MessageModel, OrderModel, mapDoc } from './models.js';

function isDuplicateKey(error: unknown): boolean {
  return typeof error === 'object' && error !== null && 'code' in error && error.code === 11000;
}

export function createMongoRepositories(): Repositories {
  return {
    leads: {
      async findByPhone(telefono) { const d = await LeadModel.findOne({ telefono }); return d ? mapDoc<Lead>(d) : null; },
      async findById(id) { const d = await LeadModel.findById(id); return d ? mapDoc<Lead>(d) : null; },
      async create(input) {
        try { return mapDoc<Lead>(await LeadModel.create(input)); }
        catch (error) {
          if (!isDuplicateKey(error)) throw error;
          const existing = await LeadModel.findOne({ telefono: input.telefono });
          if (existing) return mapDoc<Lead>(existing);
          throw error;
        }
      },
      async list({ page, limit, search }) { const filter = search ? { $or: [{ telefono: { $regex: search, $options: 'i' } }, { nombreWA: { $regex: search, $options: 'i' } }] } : {}; const [docs, total] = await Promise.all([LeadModel.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit), LeadModel.countDocuments(filter)]); return { data: docs.map(d => mapDoc<Lead>(d)), total }; }
    },
    messages: {
      async existsByWaId(waMessageId) { return Boolean(await MessageModel.exists({ waMessageId })); },
      async create(input) {
        try { return mapDoc<Message>(await MessageModel.create(input)); }
        catch (error) { if (isDuplicateKey(error)) return null; throw error; }
      }
    },
    orders: {
      async create(input) {
        const year = new Date().getUTCFullYear();
        const sequenceId = `order-${year}`;
        const existingCount = await OrderModel.countDocuments({ pedidoId: { $regex: `^PED-${year}-` } });
        const update = [{ $set: { seq: { $add: [{ $ifNull: ['$seq', existingCount] }, 1] } } }];
        let counter;
        try {
          counter = await CounterModel.findOneAndUpdate({ _id: sequenceId }, update, { new: true, upsert: true });
        } catch (error) {
          if (!isDuplicateKey(error)) throw error;
          counter = await CounterModel.findOneAndUpdate({ _id: sequenceId }, update, { new: true });
        }
        if (!counter) throw new Error('No se pudo asignar el número de pedido');
        const pedidoId = `PED-${year}-${String(counter.seq).padStart(4, '0')}`;
        return mapDoc<Order>(await OrderModel.create({ ...input, pedidoId }));
      },
      async findById(id) { const d = await OrderModel.findById(id); return d ? mapDoc<Order>(d) : null; },
      async updateState(id, estado) { return mapDoc<Order>(await OrderModel.findByIdAndUpdate(id, { estado }, { new: true, runValidators: true }).orFail()); },
      async list({ page, limit, estado, leadId }) { const filter = { ...(estado ? { estado } : {}), ...(leadId ? { leadId } : {}) }; const [docs, total] = await Promise.all([OrderModel.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit), OrderModel.countDocuments(filter)]); return { data: docs.map(d => mapDoc<Order>(d)), total }; }
    }
  };
}
