import type { IncomingWhatsAppMessage } from '../application/whatsapp-service.js';

export function extractMessages(payload: any): IncomingWhatsAppMessage[] {
  const result: IncomingWhatsAppMessage[] = [];
  for (const entry of payload?.entry ?? []) for (const change of entry?.changes ?? []) {
    const value = change?.value; const name = value?.contacts?.[0]?.profile?.name ?? '';
    for (const m of value?.messages ?? []) {
      const tipo = ({ text: 'TEXTO', image: 'IMAGEN', audio: 'AUDIO', document: 'DOCUMENTO' } as const)[m.type as 'text'] ?? 'DESCONOCIDO';
      const contenido = m.text?.body ?? m.image?.caption ?? m.document?.filename ?? m.audio?.id ?? m.image?.id ?? '';
      if (m.id && m.from && m.timestamp) result.push({ waMessageId: m.id, telefono: m.from, nombreWA: name, timestamp: Number(m.timestamp), tipo, contenido });
    }
  }
  return result;
}
