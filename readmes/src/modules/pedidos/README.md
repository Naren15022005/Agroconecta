# Módulo de Pedidos

## Endpoints API

- `GET /api/pedidos` — Listar todos los pedidos
- `GET /api/pedidos?id=PEDIDO_ID` — Obtener pedido por ID
- `GET /api/pedidos?buyerId=USER_ID` — Listar pedidos por usuario
- `POST /api/pedidos` — Crear pedido (requiere autenticación)
- `PUT /api/pedidos` — Actualizar pedido (requiere autenticación)
- `DELETE /api/pedidos?id=PEDIDO_ID` — Eliminar pedido (requiere autenticación)

## Validaciones
- `buyerId`: string, requerido
- `items`: array, requerido
- `total`: number, requerido
- `address`: string, requerido

## Seguridad
- Solo usuarios autenticados pueden crear, editar o eliminar pedidos (NextAuth.js)

## Estructura
- `repository.ts`: Acceso a datos (Prisma)
- `service.ts`: Lógica de negocio
- `controller.ts`: Orquestación
- `handler.ts`: Endpoints API
- `route.ts`: Integración con Next.js API

---
Puedes probar los endpoints con Postman, Thunder Client o desde el frontend.
