# POC-0000 WhatsApp — WALeads

Backend Node.js + TypeScript que recibe webhooks firmados de WhatsApp Cloud API, crea leads, deduplica mensajes y administra pedidos.

## Inicio rápido

### Requisitos

- Node.js 24.12.0.
- npm.
- Docker o Podman si se utiliza MongoDB.

En Windows con NVM for Windows:

```powershell
nvm install 24.12.0
nvm use 24.12.0
node --version
```

El resultado esperado es `v24.12.0`. Los archivos `.nvmrc` y `.node-version` también fijan esa versión para gestores compatibles.

### Instalación

```bash
npm ci --include=dev
cp .env.example .env
```

Para ejecutar sin una base de datos externa, configure lo siguiente en `.env`:

```dotenv
REPOSITORY_MODE=memory
```

Luego inicie la aplicación:

```bash
npm run dev
```

Para trabajar con MongoDB:

```bash
docker compose up -d
npm run dev
```

En ese caso, use `REPOSITORY_MODE=mongo`. No instale TypeScript ni ESLint globalmente: ambos están declarados en `devDependencies`.

## Configuración

Las variables principales son:

| Variable | Descripción | Valor predeterminado |
|---|---|---|
| `PORT` | Puerto HTTP | `3000` |
| `NODE_ENV` | Entorno de ejecución | `development` |
| `MONGO_URI` | Conexión de MongoDB | `mongodb://localhost:27017/waleads` |
| `REPOSITORY_MODE` | Persistencia: `memory` o `mongo` | `mongo` |
| `WHATSAPP_VERIFY_TOKEN` | Token usado en el handshake de Meta | Obligatorio |
| `WHATSAPP_APP_SECRET` | Secreto usado para verificar firmas HMAC | Obligatorio |
| `LOG_LEVEL` | Nivel de logging | `info` |

No exponga tokens ni secretos en el repositorio.

## Endpoints

| Método | Ruta | Función |
|---|---|---|
| `GET` | `/health` | Comprueba el estado del servicio |
| `GET` | `/api/v1/webhooks/whatsapp` | Completa el handshake de Meta |
| `POST` | `/api/v1/webhooks/whatsapp` | Recibe y procesa mensajes firmados |
| `GET` | `/api/v1/leads` | Lista y busca leads |
| `GET` | `/api/v1/pedidos` | Lista y filtra pedidos |
| `POST` | `/api/v1/pedidos` | Crea un pedido |
| `PATCH` | `/api/v1/pedidos/:id/estado` | Cambia el estado de un pedido |

El contrato completo se encuentra en [`spec/04-openapi.yaml`](spec/04-openapi.yaml).

## Arquitectura

El proyecto aplica una arquitectura por puertos y adaptadores:

```text
HTTP → Aplicación → Dominio
          ↓
       Puertos
          ↓
Infraestructura (memoria o MongoDB)
```

```text
src/
├── app.ts                         rutas, middleware y errores HTTP
├── config.ts                      configuración validada con Zod
├── server.ts                      arranque y ciclo de vida del proceso
├── application/
│   ├── ports.ts                   contratos de persistencia
│   ├── whatsapp-service.ts        ingesta y deduplicación
│   └── order-service.ts           creación y cambios de estado
├── domain/
│   ├── entities.ts                entidades y tipos
│   ├── errors.ts                  errores del dominio
│   └── order-state.ts             transiciones permitidas
├── http/
│   ├── signature.ts               validación HMAC
│   └── whatsapp-payload.ts        normalización del payload de Meta
└── infrastructure/
    ├── memory/repositories.ts     persistencia en memoria
    └── mongo/                     modelos y repositorios Mongoose
```

Los servicios de aplicación dependen de las interfaces de `ports.ts`, no de Mongoose. Esto permite cambiar la persistencia y probar la lógica de negocio de manera aislada.

## Flujos clave

### Webhook de WhatsApp

```text
Meta envía el webhook
  → Express conserva el cuerpo original
  → se verifica la firma HMAC
  → se normalizan los mensajes
  → se deduplica por waMessageId
  → se encuentra o crea el lead
  → se almacena el mensaje
```

La deduplicación es necesaria porque Meta puede reintentar un evento. El índice único de `waMessageId` agrega protección en MongoDB.

### Estados de pedidos

```text
PENDIENTE → EN_PREPARACION → DESPACHADO → ENTREGADO
     └──────────┴──────────────┘
                  ↓
              CANCELADO
```

`ENTREGADO` y `CANCELADO` son estados finales.

## Pruebas y calidad

```bash
npm run typecheck
npm run lint
npm run test:unit
npm run test:integration
npm run test:coverage
npm run build
```

La suite incluye pruebas de:

- Funciones puras y reglas de dominio.
- Servicios con repositorios en memoria.
- Configuración y validación de entradas.
- Firmas y variantes de payloads de WhatsApp.
- Repositorios Mongoose con modelos simulados.
- Integración HTTP con Express y Supertest.

Estado verificado de la suite: **33 pruebas aprobadas**, con **92,94 % de cobertura de líneas**, **88 % de ramas** y **97,56 % de funciones**.

Las pruebas unitarias están en [`tests/unit`](tests/unit) y las pruebas HTTP en [`tests/integration`](tests/integration).

## Aspectos importantes

- La firma del webhook debe calcularse sobre el cuerpo HTTP exacto.
- Un webhook puede repetirse o llegar fuera de orden; su procesamiento debe ser idempotente.
- Las reglas de transición pertenecen al dominio, no a Express ni a MongoDB.
- El repositorio en memoria pierde sus datos al reiniciar.
- `countDocuments() + 1` no genera identificadores seguros bajo concurrencia: dos solicitudes pueden obtener el mismo número.
- Los índices únicos deben complementarse con manejo explícito de errores de clave duplicada.

Para producción, la generación de `pedidoId` debería reemplazarse por un contador atómico con `$inc`, un UUID/ULID o una secuencia transaccional.

## Ruta de aprendizaje sugerida

1. **Express y middleware:** rutas, `req`, `res`, `next`, middleware JSON y manejo de errores.
2. **Zod:** esquemas, coerción, valores predeterminados, `parse`, `safeParse` y `ZodError`.
3. **Puertos y adaptadores:** inversión de dependencias e intercambio de implementaciones.
4. **Vitest:** pruebas unitarias, mocks con `vi.fn`/`vi.mock` e integración HTTP con Supertest.
5. **Mongoose:** esquemas, índices, consultas, sesiones y operaciones atómicas.
6. **Webhooks:** autenticidad, reintentos, idempotencia, orden y observabilidad.
7. **Concurrencia:** condiciones de carrera, contadores atómicos e identificadores seguros.
8. **Integración real con MongoDB:** levantar un contenedor temporal, limpiar colecciones y verificar índices y transacciones.

Un buen primer ejercicio es implementar `GET /api/v1/pedidos/:id`: obliga a recorrer HTTP, validación, puertos, repositorios y pruebas sin introducir un cambio demasiado grande.

## Documentación adicional

La especificación funcional, arquitectura, modelo de datos, contrato OpenAPI, plan de pruebas, trazabilidad y decisiones técnicas se encuentran en [`spec/`](spec/).
