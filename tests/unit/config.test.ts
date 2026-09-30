import { describe, expect, it } from 'vitest';
import { loadConfig } from '../../src/config.js';

const jwtSecret = 'test-secret-that-is-at-least-32-characters-long';

describe('loadConfig', () => {
  it('aplica los valores por defecto', () => {
    expect(loadConfig({ WHATSAPP_VERIFY_TOKEN: 'token', WHATSAPP_APP_SECRET: 'secret', JWT_SECRET: jwtSecret })).toEqual({
      PORT: 3000,
      NODE_ENV: 'development',
      MONGO_URI: 'mongodb://localhost:27017/waleads',
      REPOSITORY_MODE: 'mongo',
      WHATSAPP_VERIFY_TOKEN: 'token',
      WHATSAPP_APP_SECRET: 'secret',
      JWT_SECRET: jwtSecret,
      LOG_LEVEL: 'info'
    });
  });

  it('convierte el puerto y acepta configuración explícita', () => {
    expect(loadConfig({
      PORT: '8080', NODE_ENV: 'test', MONGO_URI: 'mongodb://db/test', REPOSITORY_MODE: 'memory',
      WHATSAPP_VERIFY_TOKEN: 'token', WHATSAPP_APP_SECRET: 'secret', JWT_SECRET: jwtSecret, LOG_LEVEL: 'silent'
    })).toMatchObject({ PORT: 8080, NODE_ENV: 'test', REPOSITORY_MODE: 'memory', LOG_LEVEL: 'silent' });
  });

  it('rechaza secretos ausentes o cortos y valores inválidos', () => {
    expect(() => loadConfig({})).toThrow();
    expect(() => loadConfig({ PORT: '0', WHATSAPP_VERIFY_TOKEN: 'token', WHATSAPP_APP_SECRET: 'secret', JWT_SECRET: jwtSecret })).toThrow();
    expect(() => loadConfig({ WHATSAPP_VERIFY_TOKEN: 'token', WHATSAPP_APP_SECRET: 'secret', JWT_SECRET: 'short' })).toThrow();
  });
});
