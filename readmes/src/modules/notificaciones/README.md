# Módulo de Notificaciones

## Endpoints API

- `GET /api/notificaciones?userId=USER_ID` — Listar notificaciones por usuario
- `POST /api/notificaciones` — Crear notificación (requiere autenticación)
- `PATCH /api/notificaciones` — Marcar notificación como leída (requiere autenticación)
- `DELETE /api/notificaciones?id=ID` — Eliminar notificación (requiere autenticación)

## Validaciones
- `userId`: string, requerido
- `message`: string, requerido para crear
- `id`: string, requerido para marcar como leída y eliminar

## Seguridad
- Solo usuarios autenticados pueden modificar notificaciones (NextAuth.js)

## Estructura
- `repository.ts`: Acceso a datos (Prisma)
- `service.ts`: Lógica de negocio
- `controller.ts`: Orquestación
- `handler.ts`: Endpoints API
- `route.ts`: Integración con Next.js API

---
Puedes probar los endpoints con Postman, Thunder Client o desde el frontend.
