import { createHmac } from 'node:crypto';
import { describe, expect, it } from 'vitest';
import { verifyWhatsAppSignature } from '../../src/http/signature.js';

describe('firma de webhook', () => {
  const body = Buffer.from('{"ok":true}'); const secret = 'app-secret';
  it('valida HMAC SHA-256 correcto', () => { const signature = `sha256=${createHmac('sha256', secret).update(body).digest('hex')}`; expect(verifyWhatsAppSignature(body, signature, secret)).toBe(true); });
  it('rechaza firma incorrecta o ausente', () => { expect(verifyWhatsAppSignature(body, 'sha256=00', secret)).toBe(false); expect(verifyWhatsAppSignature(body, undefined, secret)).toBe(false); });
  it('rechaza formatos incorrectos y secretos vacíos', () => {
    expect(verifyWhatsAppSignature(body, 'md5=00', secret)).toBe(false);
    expect(verifyWhatsAppSignature(body, 'sha256=00', '')).toBe(false);
  });
});
