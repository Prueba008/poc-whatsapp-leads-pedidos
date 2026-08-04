# Plan de pruebas

## Unitarias

- Validación de la firma HMAC.
- Transiciones válidas e inválidas del pedido.
- Autocreación del lead e idempotencia de mensajes.

## Integración

`tests/integration/api.test.ts` levanta Express en proceso mediante Supertest e integra rutas, middleware, casos de uso y repositorios en memoria. Cubre handshake, rechazo de firmas, flujo webhook → lead, deduplicación y flujo de pedidos.

MongoDB real se usa en ejecución local con Docker Compose; los adaptadores comparten los contratos ejercitados por los casos de uso.
