import type { Repositories } from './ports.js';

export type IncomingWhatsAppMessage = {
  waMessageId: string; telefono: string; nombreWA: string; timestamp: number;
  tipo: 'TEXTO' | 'IMAGEN' | 'AUDIO' | 'DOCUMENTO' | 'DESCONOCIDO'; contenido: string;
};

export class WhatsAppService {
  constructor(private readonly repos: Repositories) {}
  async process(message: IncomingWhatsAppMessage): Promise<'CREATED' | 'DUPLICATE'> {
    if (await this.repos.messages.existsByWaId(message.waMessageId)) return 'DUPLICATE';
    const lead = await this.repos.leads.findByPhone(message.telefono)
      ?? await this.repos.leads.create({ telefono: message.telefono, nombreWA: message.nombreWA });
    const created = await this.repos.messages.create({
      waMessageId: message.waMessageId, leadId: lead.id, direccion: 'ENTRANTE', tipo: message.tipo,
      contenido: message.contenido, timestampWA: new Date(message.timestamp * 1000)
    });
    return created ? 'CREATED' : 'DUPLICATE';
  }
}
