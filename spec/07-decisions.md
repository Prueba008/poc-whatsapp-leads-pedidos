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
- **Compatibilidad:** el paquete acepta actualizaciones correctivas y menores de
  Node 24 (`>=24.12.0 <25`), mientras `.nvmrc` y `.node-version` fijan 24.12.0
  para instalaciones reproducibles.
- **Consecuencia:** Node 20 deja de estar soportado por este POC. Las dependencias
  de desarrollo deben instalarse con `npm ci --include=dev` antes de ejecutar
  TypeScript, ESLint o las pruebas.
