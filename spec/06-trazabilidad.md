# Matriz de trazabilidad

| Requisito | Implementación | Prueba |
|---|---|---|
| RF-01 | `src/app.ts` | `api.test.ts` handshake |
| RF-02 | `src/http/signature.ts` | `signature.test.ts`, `api.test.ts` |
| RF-03/04/05 | `WhatsAppService` | `whatsapp-service.test.ts`, `api.test.ts` |
| RF-06 | `OrderService.create` | `api.test.ts` pedido |
| RF-07 | `domain/order-state.ts` | `order-state.test.ts`, `api.test.ts` |
