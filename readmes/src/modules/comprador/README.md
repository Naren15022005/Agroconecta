# Módulo de Comprador

## Endpoints API

- `GET /api/comprador?compradorId=USER_ID` — Listar pedidos realizados por comprador
- `GET /api/comprador?compradorId=USER_ID&carrito=true` — Listar ítems del carrito del comprador
- `PUT /api/comprador` — Actualizar perfil de comprador (requiere autenticación)

## Validaciones
- `compradorId`: string, requerido

## Seguridad
- Solo usuarios autenticados pueden actualizar perfil (NextAuth.js)

## Estructura
- `repository.ts`: Acceso a datos (Prisma)
- `service.ts`: Lógica de negocio
- `controller.ts`: Orquestación
- `handler.ts`: Endpoints API
- `route.ts`: Integración con Next.js API

---
Puedes probar los endpoints con Postman, Thunder Client o desde el frontend.
