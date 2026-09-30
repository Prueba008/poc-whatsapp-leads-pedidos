# Modelo de datos

- `leads`: índice único `telefono`; un conflicto concurrente de creación recupera el lead ya persistido.
- `messages`: índice único `waMessageId`; índices en `leadId` y `timestampWA`. El conflicto de clave única se interpreta como mensaje ya procesado.
- `orders`: índice único `pedidoId`; índices en `leadId` y `estado`.
- `counters`: documento por año para asignar atómicamente la secuencia de pedidos. La primera reserva considera los pedidos existentes con prefijo de ese año.

Los identificadores públicos de pedido conservan el formato `PED-<año>-<secuencia>`. El contador evita colisiones en escrituras concurrentes y el índice único de `pedidoId` mantiene la integridad.

Estados: `PENDIENTE → EN_PREPARACION → DESPACHADO → ENTREGADO`. Desde los tres estados no finales se permite `CANCELADO`.
