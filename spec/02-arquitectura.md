# Arquitectura

Monolito modular con puertos y adaptadores:

- `domain`: entidades, errores y reglas de estados.
- `application`: casos de uso independientes de Express y MongoDB.
- `infrastructure`: adaptadores MongoDB/Mongoose y memoria.
- `http`: autenticación JWT, verificación de firma de Meta, normalización de payloads y rutas Express.

## Seguridad de rutas

El middleware JWT protege las rutas de leads y pedidos. Verifica tokens Bearer firmados con HS256 usando `JWT_SECRET`; exige `exp` y valida `nbf` cuando se incluye. La aplicación no emite tokens. El health check y las rutas de webhook quedan fuera de este middleware; los webhooks conservan su verificación HMAC sobre el cuerpo HTTP original.

## Idempotencia y concurrencia

La clave única `waMessageId` de MongoDB es la garantía final contra duplicados. El adaptador convierte el error de clave duplicada en resultado idempotente para que una reentrega concurrente no falle como error interno. La creación de leads reutiliza el lead existente cuando dos mensajes del mismo teléfono compiten por crearlo. El repositorio en memoria aplica las mismas restricciones.

## Secuencia de pedidos

El adaptador MongoDB reserva el número de pedido mediante un documento contador actualizado atómicamente por año. Al inicializar el contador, toma en cuenta los pedidos existentes de ese año. El índice único de `pedidoId` sigue siendo la protección de integridad. El adaptador en memoria genera la secuencia dentro del proceso.

La selección `REPOSITORY_MODE=mongo|memory` mantiene el núcleo desacoplado y permite pruebas HTTP rápidas sin infraestructura externa.
