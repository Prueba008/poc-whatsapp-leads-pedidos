import { describe, expect, it } from 'vitest';
import { WhatsAppService } from '../../src/application/whatsapp-service.js';
import { createMemoryRepositories } from '../../src/infrastructure/memory/repositories.js';

describe('WhatsAppService', () => {
  const incoming = { waMessageId: 'wamid.1', telefono: '5491112345678', nombreWA: 'Sergio', timestamp: 1785801600, tipo: 'TEXTO' as const, contenido: 'Hola' };
  it('crea lead y mensaje al recibir un número nuevo', async () => { const repos = createMemoryRepositories(); expect(await new WhatsAppService(repos).process(incoming)).toBe('CREATED'); expect((await repos.leads.list({ page: 1, limit: 20 })).total).toBe(1); });
  it('deduplica por waMessageId', async () => { const repos = createMemoryRepositories(); const service = new WhatsAppService(repos); await service.process(incoming); expect(await service.process(incoming)).toBe('DUPLICATE'); expect((await repos.leads.list({ page: 1, limit: 20 })).total).toBe(1); });
});
