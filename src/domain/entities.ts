export type Lead = {
  id: string;
  telefono: string;
  nombreWA: string;
  email?: string;
  notas?: string;
  createdAt: Date;
  updatedAt: Date;
};

export type Message = {
  id: string;
  waMessageId: string;
  leadId: string;
  direccion: 'ENTRANTE' | 'SALIENTE';
  tipo: 'TEXTO' | 'IMAGEN' | 'AUDIO' | 'DOCUMENTO' | 'DESCONOCIDO';
  contenido: string;
  timestampWA: Date;
  createdAt: Date;
};

export const ORDER_STATES = ['PENDIENTE', 'EN_PREPARACION', 'DESPACHADO', 'ENTREGADO', 'CANCELADO'] as const;
export type OrderState = (typeof ORDER_STATES)[number];
export type OrderItem = { productoId: string; descripcion: string; cantidad: number; precioUnitario: number; subtotal: number };
export type Order = {
  id: string;
  pedidoId: string;
  leadId: string;
  estado: OrderState;
  items: OrderItem[];
  montoTotal: number;
  moneda: 'ARS' | 'USD';
  direccionEntrega: string;
  createdAt: Date;
  updatedAt: Date;
};
