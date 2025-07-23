# Módulo de Productos

## Endpoints API

- `GET /api/productos` — Listar todos los productos
- `GET /api/productos?id=PRODUCT_ID` — Obtener producto por ID
- `GET /api/productos?categoryId=CATEGORY_ID` — Filtrar productos por categoría
- `POST /api/productos` — Crear producto (requiere autenticación)
- `PUT /api/productos` — Actualizar producto (requiere autenticación)
- `DELETE /api/productos?id=PRODUCT_ID` — Eliminar producto (requiere autenticación)

## Validaciones
- `name`: string, requerido
- `price`: number, requerido
- `farmerId`: string, requerido

## Seguridad
- Solo usuarios autenticados pueden crear, editar o eliminar productos (NextAuth.js)

## Estructura
- `repository.ts`: Acceso a datos (Prisma)
- `service.ts`: Lógica de negocio
- `controller.ts`: Orquestación
- `handler.ts`: Endpoints API
- `route.ts`: Integración con Next.js API

---
Puedes probar los endpoints con Postman, Thunder Client o desde el frontend.
