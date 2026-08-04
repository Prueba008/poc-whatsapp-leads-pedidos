import type { Repositories } from '../../application/ports.js';
import type { Lead, Message, Order } from '../../domain/entities.js';
import { LeadModel, MessageModel, OrderModel, mapDoc } from './models.js';

export function createMongoRepositories(): Repositories {
  return {
    leads: {
      async findByPhone(telefono) { const d = await LeadModel.findOne({ telefono }); return d ? mapDoc<Lead>(d) : null; },
      async findById(id) { const d = await LeadModel.findById(id); return d ? mapDoc<Lead>(d) : null; },
      async create(input) { return mapDoc<Lead>(await LeadModel.create(input)); },
      async list({ page, limit, search }) { const filter = search ? { $or: [{ telefono: { $regex: search, $options: 'i' } }, { nombreWA: { $regex: search, $options: 'i' } }] } : {}; const [docs, total] = await Promise.all([LeadModel.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit), LeadModel.countDocuments(filter)]); return { data: docs.map(d => mapDoc<Lead>(d)), total }; }
    },
    messages: {
      async existsByWaId(waMessageId) { return Boolean(await MessageModel.exists({ waMessageId })); },
      async create(input) { return mapDoc<Message>(await MessageModel.create(input)); }
    },
    orders: {
      async create(input) { const seq = await OrderModel.countDocuments() + 1; const pedidoId = `PED-${new Date().getUTCFullYear()}-${String(seq).padStart(4, '0')}`; return mapDoc<Order>(await OrderModel.create({ ...input, pedidoId })); },
      async findById(id) { const d = await OrderModel.findById(id); return d ? mapDoc<Order>(d) : null; },
      async updateState(id, estado) { return mapDoc<Order>(await OrderModel.findByIdAndUpdate(id, { estado }, { new: true, runValidators: true }).orFail()); },
      async list({ page, limit, estado, leadId }) { const filter = { ...(estado ? { estado } : {}), ...(leadId ? { leadId } : {}) }; const [docs, total] = await Promise.all([OrderModel.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit), OrderModel.countDocuments(filter)]); return { data: docs.map(d => mapDoc<Order>(d)), total }; }
    }
  };
}
