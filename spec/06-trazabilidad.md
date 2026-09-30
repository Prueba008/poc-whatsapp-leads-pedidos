# Matriz de trazabilidad

| Requisito | Implementación | Prueba / verificación |
|---|---|---|
| RF-01 | Handshake en `src/app.ts` | `api.test.ts` handshake |
| RF-02 | `src/http/signature.ts` | `signature.test.ts`, `api.test.ts` |
| RF-03/04/05 | `WhatsAppService`, repositorios y clave única Mongo | `whatsapp-service.test.ts`, `api.test.ts`; concurrencia contra MongoDB según plan |
| RF-06 | `OrderService.create` | `api.test.ts` creación y cálculo |
| RF-07 | `domain/order-state.ts` | `order-state.test.ts`, `api.test.ts` |
| RF-08 | `requireJwt` en `src/http/auth.ts`; configuración `JWT_SECRET` | `api.test.ts` acceso sin token y con JWT válido; unitarias JWT según plan |
| RF-09 | Contador por año en `src/infrastructure/mongo/repositories.ts` | Repositorios simulados y prueba concurrente MongoDB según plan |
