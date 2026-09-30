# Requisitos y criterios de aceptación

| ID | Requisito | Criterio verificable |
|---|---|---|
| RF-01 | Handshake | Token correcto retorna el `hub.challenge`; incorrecto retorna 403. |
| RF-02 | Firma | Todo POST de WhatsApp valida `x-hub-signature-256` con HMAC SHA-256 sobre el cuerpo original. |
| RF-03 | Ingesta | Un mensaje válido crea un mensaje entrante asociado a un lead. |
| RF-04 | Lead | Un teléfono nuevo crea exactamente un lead, incluso si llegan mensajes concurrentes para el mismo teléfono. |
| RF-05 | Idempotencia | Repetir o recibir concurrentemente el mismo `waMessageId` no duplica el mensaje; el webhook repetido se confirma con HTTP 200. |
| RF-06 | Pedidos | Se calcula subtotal y monto total del lado servidor. |
| RF-07 | Estados | Solo se permiten las transiciones documentadas. |
| RF-08 | Autenticación de API | `/api/v1/leads` y `/api/v1/pedidos` requieren `Authorization: Bearer <JWT>`. Solo se aceptan tokens HS256 con firma válida y `exp` futuro; `nbf`, si está presente, debe ser válido. Sin token válido se responde 401. |
| RF-09 | Identificador de pedido | Los identificadores `PED-<año>-<secuencia>` son únicos bajo solicitudes concurrentes y continúan después de los pedidos ya existentes de ese año. |

## Fuera de alcance

GUI, emisión/inicio de sesión de JWT, envío de respuestas hacia WhatsApp, colas y procesamiento multimedia. Los webhooks usan la firma HMAC de Meta y no requieren JWT. El endpoint `/health` tampoco requiere autenticación.
