import { describe, expect, it } from 'vitest';
import { extractMessages } from '../../src/http/whatsapp-payload.js';

describe('extractMessages', () => {
  it('tolera payloads sin entradas', () => {
    expect(extractMessages(undefined)).toEqual([]);
    expect(extractMessages({ entry: [{}] })).toEqual([]);
  });

  it.each([
    ['text', { text: { body: 'Hola' } }, 'TEXTO', 'Hola'],
    ['image', { image: { caption: 'Foto' } }, 'IMAGEN', 'Foto'],
    ['image', { image: { id: 'img-1' } }, 'IMAGEN', 'img-1'],
    ['audio', { audio: { id: 'aud-1' } }, 'AUDIO', 'aud-1'],
    ['document', { document: { filename: 'lista.pdf' } }, 'DOCUMENTO', 'lista.pdf'],
    ['sticker', { sticker: { id: 'st-1' } }, 'DESCONOCIDO', '']
  ])('extrae mensajes %s', (type, content, tipo, contenido) => {
    const payload = { entry: [{ changes: [{ value: {
      contacts: [{ profile: { name: 'Ana' } }],
      messages: [{ id: 'wamid.1', from: '54911', timestamp: '123', type, ...content }]
    } }] }] };
    expect(extractMessages(payload)).toEqual([{
      waMessageId: 'wamid.1', telefono: '54911', nombreWA: 'Ana', timestamp: 123, tipo, contenido
    }]);
  });

  it('omite mensajes incompletos y usa un nombre vacío si no hay contacto', () => {
    const value = { messages: [
      { from: '1', timestamp: '1', type: 'text', text: { body: 'sin id' } },
      { id: 'ok', from: '2', timestamp: '2', type: 'text', text: { body: 'válido' } }
    ] };
    expect(extractMessages({ entry: [{ changes: [{ value }] }] })).toEqual([
      { waMessageId: 'ok', telefono: '2', nombreWA: '', timestamp: 2, tipo: 'TEXTO', contenido: 'válido' }
    ]);
  });
});
