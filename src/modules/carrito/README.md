# Módulo de Carrito

## Endpoints API

- `GET /api/carrito?userId=USER_ID` — Listar ítems del carrito por usuario
- `POST /api/carrito` — Agregar ítem al carrito (requiere autenticación)
- `PUT /api/carrito` — Actualizar ítem del carrito (requiere autenticación)
- `DELETE /api/carrito?id=ITEM_ID` — Eliminar ítem del carrito (requiere autenticación)
- `PATCH /api/carrito` — Limpiar carrito del usuario (requiere autenticación)

## Validaciones
- `userId`: string, requerido
- `productId`: string, requerido
- `quantity`: number, requerido

## Seguridad
- Solo usuarios autenticados pueden modificar el carrito (NextAuth.js)

## Estructura
- `repository.ts`: Acceso a datos (Prisma)
- `service.ts`: Lógica de negocio
- `controller.ts`: Orquestación
- `handler.ts`: Endpoints API
- `route.ts`: Integración con Next.js API

---
Puedes probar los endpoints con Postman, Thunder Client o desde el frontend.
