# Plan de pruebas

## Unitarias

- Validación de firma HMAC.
- Validación JWT: firma correcta, firma incorrecta, token vencido y `nbf` futuro.
- Transiciones válidas e inválidas del pedido.
- Autocreación del lead e idempotencia de mensajes.
- Adaptadores Mongo: conflicto de `waMessageId`, carrera al crear un lead y reserva de secuencia de pedidos.

## Integración HTTP

`tests/integration/api.test.ts` usa Supertest con repositorios en memoria. Debe cubrir handshake, rechazo de firmas, flujo webhook → lead, reentrega de webhook, rechazo de rutas protegidas sin JWT y operaciones correctas con JWT válido.

## Persistencia MongoDB

Con MongoDB disponible, validar escrituras concurrentes del mismo `waMessageId`, de mensajes para un mismo teléfono nuevo y de pedidos. Confirmar que cada webhook se responde de forma idempotente, que queda un único lead/mensaje y que los `pedidoId` son únicos y secuenciales a partir de los datos existentes del año.

La suite simulada no sustituye una prueba de concurrencia contra MongoDB real. MongoDB real puede levantarse localmente con Docker Compose.
