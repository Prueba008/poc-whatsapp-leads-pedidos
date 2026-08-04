import { Schema, model } from 'mongoose';

const timestamps = { timestamps: true, versionKey: false } as const;
export const LeadModel = model('Lead', new Schema({ telefono: { type: String, required: true, unique: true, index: true }, nombreWA: { type: String, required: true }, email: String, notas: String }, timestamps));
export const MessageModel = model('Message', new Schema({ waMessageId: { type: String, required: true, unique: true, index: true }, leadId: { type: Schema.Types.ObjectId, required: true, index: true }, direccion: { type: String, required: true }, tipo: { type: String, required: true }, contenido: { type: String, required: true }, timestampWA: { type: Date, required: true, index: true } }, timestamps));
export const OrderModel = model('Order', new Schema({ pedidoId: { type: String, required: true, unique: true }, leadId: { type: Schema.Types.ObjectId, required: true, index: true }, estado: { type: String, required: true, index: true }, items: [{ productoId: String, descripcion: String, cantidad: Number, precioUnitario: Number, subtotal: Number }], montoTotal: Number, moneda: String, direccionEntrega: String }, timestamps));

export function mapDoc<T>(doc: any): T { const value = doc.toObject ? doc.toObject() : doc; return { ...value, id: String(value._id), _id: undefined } as T; }
