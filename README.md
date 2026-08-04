# POC-0000 WhatsApp — WALeads

Backend Node.js + TypeScript que recibe webhooks firmados de WhatsApp Cloud API, crea leads, deduplica mensajes y administra pedidos.

## Inicio rápido

Requisitos: Node.js 24.12.0 y, para modo real, Docker/Podman con MongoDB.

En Windows con NVM for Windows:

```powershell
nvm install 24.12.0
nvm use 24.12.0
node --version
```

El resultado esperado es `v24.12.0`. El archivo `.nvmrc` también fija esta versión
para gestores compatibles. Antes de instalar, compruebe que haya al menos 3 GB
libres en la unidad del proyecto.

```bash
npm ci --include=dev
cp .env.example .env
docker compose up -d
npm run dev
```

Si una instalación anterior quedó incompleta, elimine únicamente `node_modules`
y vuelva a ejecutar `npm ci --include=dev`. No instale TypeScript ni ESLint de
forma global: ambos están declarados en `devDependencies`.

Para probar sin MongoDB, configure `REPOSITORY_MODE=memory` en `.env`.

## Validación

```bash
npm run typecheck
npm run lint
npm run test:unit
npm run test:integration
npm run build
```

La especificación funcional, arquitectura, contrato OpenAPI, plan de pruebas y trazabilidad están en [`spec/`](spec/).

## Configuración de Meta

Registre `https://<host>/api/v1/webhooks/whatsapp`, use el mismo `WHATSAPP_VERIFY_TOKEN` en Meta y en `.env`, y configure `WHATSAPP_APP_SECRET` con el secreto de la aplicación. Nunca exponga estos valores en el repositorio.

## Estructura

```text
src/domain                 reglas puras
src/application            casos de uso y puertos
src/infrastructure         MongoDB y memoria
src/http                   firma y payload WhatsApp
spec                       especificaciones SDD
tests/unit                 pruebas unitarias
tests/integration          pruebas HTTP integradas
```
''' text 
PORT=3000
NODE_ENV=development
MONGO_URI=mongodb://localhost:27017/waleads
REPOSITORY_MODE=memory

WHATSAPP_VERIFY_TOKEN=poc-0000-token-seguro
WHATSAPP_APP_SECRET=SECRETO_REAL_DE_LA_APP_META

LOG_LEVEL=info
'''