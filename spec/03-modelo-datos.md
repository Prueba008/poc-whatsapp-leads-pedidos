# Modelo de datos

- `leads`: índice único `telefono`.
- `messages`: índice único `waMessageId`; índice en `leadId` y `timestampWA`.
- `orders`: índice único `pedidoId`; índices en `leadId` y `estado`.

Estados: `PENDIENTE → EN_PREPARACION → DESPACHADO → ENTREGADO`. Desde los tres estados no finales se permite `CANCELADO`.
