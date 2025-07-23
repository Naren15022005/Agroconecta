# Módulo de Admin

## Endpoints API

- `GET /api/admin?tipo=usuarios` — Listar usuarios
- `GET /api/admin?tipo=productos` — Listar productos
- `GET /api/admin?tipo=pedidos` — Listar pedidos
- `PUT /api/admin` — Actualizar usuario (requiere autenticación)
- `DELETE /api/admin?id=ID&tipo=usuario|producto|pedido` — Eliminar usuario, producto o pedido (requiere autenticación)

## Validaciones
- `id`: string, requerido para PUT y DELETE
- `tipo`: string, requerido para todas las operaciones

## Seguridad
- Solo usuarios autenticados pueden modificar o eliminar (NextAuth.js)

## Estructura
- `repository.ts`: Acceso a datos (Prisma)
- `service.ts`: Lógica de negocio
- `controller.ts`: Orquestación
- `handler.ts`: Endpoints API
- `route.ts`: Integración con Next.js API

---
Puedes probar los endpoints con Postman, Thunder Client o desde el frontend.
