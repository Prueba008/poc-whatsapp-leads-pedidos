# Requisitos y criterios de aceptación

| ID | Requisito | Criterio verificable |
|---|---|---|
| RF-01 | Handshake | Token correcto retorna el `hub.challenge`; incorrecto retorna 403. |
| RF-02 | Firma | Todo POST valida `x-hub-signature-256` con HMAC SHA-256. |
| RF-03 | Ingesta | Un mensaje válido crea un mensaje entrante. |
| RF-04 | Lead | Un teléfono nuevo crea exactamente un lead. |
| RF-05 | Idempotencia | Repetir `waMessageId` no duplica lead ni mensaje. |
| RF-06 | Pedidos | Se calcula subtotal y monto total del lado servidor. |
| RF-07 | Estados | Solo se permiten las transiciones documentadas. |

## Fuera de alcance

GUI, envío de respuestas hacia WhatsApp, JWT de operadores, colas y procesamiento multimedia.
