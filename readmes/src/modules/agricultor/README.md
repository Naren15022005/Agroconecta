# Módulo de Agricultor

## Endpoints API

- `GET /api/agricultor?agricultorId=USER_ID` — Listar productos publicados por agricultor
- `GET /api/agricultor?agricultorId=USER_ID&pedidos=true` — Listar pedidos recibidos por agricultor
- `PUT /api/agricultor` — Actualizar perfil de agricultor (requiere autenticación)

## Validaciones
- `agricultorId`: string, requerido

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
