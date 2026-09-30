# Decisiones técnicas

## ADR-001 — TypeScript y Node 24

Se elige ESM, TypeScript estricto y Express 5 para un backend sencillo y tipado.

## ADR-002 — Puertos y adaptadores

Los casos de uso dependen de interfaces. Mongoose es reemplazable y las pruebas no necesitan infraestructura externa.

## ADR-003 — Confirmación síncrona en la POC

El webhook procesa antes de responder para verificar el flujo extremo a extremo. Para producción se recomienda persistir el evento y responder 200 inmediatamente, delegando el procesamiento a una cola.

## ADR-004 — Runtime Node.js 24

- **Estado:** aceptada.
- **Decisión:** usar Node.js 24.12.0 como versión de desarrollo y despliegue.
- **Compatibilidad:** el paquete acepta actualizaciones correctivas y menores de Node 24 (`>=24.12.0 <25`), mientras `.nvmrc` y `.node-version` fijan 24.12.0 para instalaciones reproducibles.
- **Consecuencia:** Node 20 deja de estar soportado por este POC. Las dependencias de desarrollo deben instalarse con `npm ci --include=dev` antes de ejecutar TypeScript, ESLint o las pruebas.

## ADR-005 — JWT HS256 para rutas operativas

- **Estado:** aceptada.
- **Decisión:** proteger las rutas de leads y pedidos con Bearer JWT firmado con HS256. Se exige el claim `exp` y se valida `nbf` cuando se incluye. El secreto `JWT_SECRET` es obligatorio y debe tener al menos 32 caracteres.
- **Alcance:** health y webhooks quedan fuera del middleware JWT; el webhook continúa verificando la firma HMAC de Meta.
- **Límite:** esta API no emite ni renueva tokens; un componente de confianza externo debe emitirlos. La autenticación de usuarios, roles, emisor y audiencia no forma parte de esta POC.

## ADR-006 — Idempotencia ante reintentos concurrentes

- **Estado:** aceptada.
- **Decisión:** conservar el índice único de `waMessageId` como garantía final y tratar el conflicto de clave duplicada como una entrega ya procesada. La creación concurrente por teléfono recupera el lead existente.
- **Consecuencia:** un reintento no debe convertirse en error interno ni crear registros duplicados.

## ADR-007 — Secuencia atómica de pedidos

- **Estado:** aceptada.
- **Decisión:** asignar `PED-<año>-<secuencia>` mediante un contador MongoDB atómico por año, inicializado considerando pedidos existentes.
- **Consecuencia:** las solicitudes concurrentes reciben identificadores distintos; los índices únicos siguen aplicándose como última defensa.
