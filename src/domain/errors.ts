export class DomainError extends Error {
  constructor(message: string, public readonly status = 400) { super(message); }
}
export class NotFoundError extends DomainError {
  constructor(entity: string) { super(`${entity} no encontrado`, 404); }
}
