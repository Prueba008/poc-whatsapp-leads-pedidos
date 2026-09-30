import { createHmac, timingSafeEqual } from 'node:crypto';
import type { RequestHandler } from 'express';

type JwtPayload = { exp?: unknown; nbf?: unknown };

export function verifyJwt(token: string, secret: string, now = Math.floor(Date.now() / 1000)): boolean {
  const parts = token.split('.');
  if (parts.length !== 3 || !secret) return false;

  try {
    const [encodedHeader, encodedPayload, encodedSignature] = parts;
    const header = JSON.parse(Buffer.from(encodedHeader!, 'base64url').toString('utf8')) as { alg?: unknown };
    const payload = JSON.parse(Buffer.from(encodedPayload!, 'base64url').toString('utf8')) as JwtPayload;
    if (header.alg !== 'HS256' || typeof payload.exp !== 'number' || payload.exp <= now) return false;
    if (payload.nbf !== undefined && (typeof payload.nbf !== 'number' || payload.nbf > now)) return false;

    const received = Buffer.from(encodedSignature!, 'base64url');
    const expected = createHmac('sha256', secret).update(`${encodedHeader}.${encodedPayload}`).digest();
    return received.length === expected.length && timingSafeEqual(received, expected);
  } catch {
    return false;
  }
}

export function requireJwt(secret: string): RequestHandler {
  return (req, res, next) => {
    const authorization = req.header('authorization');
    const match = authorization?.match(/^Bearer ([^ ]+)$/i);
    if (!match || !verifyJwt(match[1]!, secret)) {
      res.setHeader('WWW-Authenticate', 'Bearer');
      return res.status(401).json({ error: 'Token de acceso inválido o ausente' });
    }
    return next();
  };
}
