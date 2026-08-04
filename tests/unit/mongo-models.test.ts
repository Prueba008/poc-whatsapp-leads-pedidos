import { describe, expect, it } from 'vitest';
import { mapDoc } from '../../src/infrastructure/mongo/models.js';

describe('mapDoc', () => {
  it('convierte un documento de Mongoose a una entidad con id string', () => {
    const doc = {
      toObject: () => ({ _id: { toString: () => 'mongo-id' }, nombreWA: 'Ana' })
    };
    expect(mapDoc<{ id: string; nombreWA: string }>(doc)).toEqual({
      id: 'mongo-id', nombreWA: 'Ana', _id: undefined
    });
  });

  it('también acepta objetos planos', () => {
    expect(mapDoc<{ id: string; telefono: string }>({ _id: 123, telefono: '54911' })).toEqual({
      id: '123', telefono: '54911', _id: undefined
    });
  });
});
