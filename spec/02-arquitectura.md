# Arquitectura

Monolito modular con puertos y adaptadores:

- `domain`: entidades, errores y reglas de estados.
- `application`: casos de uso independientes de Express y MongoDB.
- `infrastructure`: adaptadores MongoDB/Mongoose y memoria.
- `http`: firma, normalización del payload y rutas Express.

La selección `REPOSITORY_MODE=mongo|memory` mantiene el núcleo desacoplado y permite pruebas de integración HTTP rápidas.
