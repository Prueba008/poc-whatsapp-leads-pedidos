import type { Lead, Message, Order, OrderState } from '../domain/entities.js';

export interface LeadRepository {
  findByPhone(phone: string): Promise<Lead | null>;
  findById(id: string): Promise<Lead | null>;
  create(input: Pick<Lead, 'telefono' | 'nombreWA'>): Promise<Lead>;
  list(query: { page: number; limit: number; search?: string | undefined }): Promise<{ data: Lead[]; total: number }>;
}
export interface MessageRepository {
  existsByWaId(waMessageId: string): Promise<boolean>;
  /** Returns null when another request already stored this WhatsApp message. */
  create(input: Omit<Message, 'id' | 'createdAt'>): Promise<Message | null>;
}
export interface OrderRepository {
  create(input: Omit<Order, 'id' | 'pedidoId' | 'createdAt' | 'updatedAt'>): Promise<Order>;
  findById(id: string): Promise<Order | null>;
  updateState(id: string, state: OrderState): Promise<Order>;
  list(query: { page: number; limit: number; estado?: OrderState | undefined; leadId?: string | undefined }): Promise<{ data: Order[]; total: number }>;
}
export type Repositories = { leads: LeadRepository; messages: MessageRepository; orders: OrderRepository };
