# AgroConecta — Backend (Render + Supabase)

Este directorio contiene un backend mínimo preparado para desplegar en Render y conectar contra una base de datos Supabase.

Quickstart

1. En tu proyecto de Supabase crea tablas necesarias (por ejemplo `products`) o usa Prisma con Supabase Postgres.
2. Crea un servicio en Render (Web Service) apuntando a este repositorio y selecciona la carpeta `backend/` como root (o configura el build command abajo).

Variables de entorno (Render)
- `SUPABASE_URL` — URL del proyecto Supabase (por ejemplo `https://xxx.supabase.co`)
- `SUPABASE_SERVICE_ROLE_KEY` — Service Role Key (server-side)
- (Opcional) `DATABASE_URL` — Cadena PostgreSQL si usas Prisma

Build & Start (Render)
- Build Command: `npm install`
- Start Command: `npm start`
- Port: Render provee `PORT` env var, `index.js` usa `process.env.PORT`.

Docker
- Si prefieres usar Docker en Render, este repo incluye `Dockerfile` en `backend/`.

Endpoints ejemplo
- `GET /health` — estado del servicio
- `GET /products` — lista de productos (usa tabla `products` en Supabase)
- `GET /users` — list users (requiere `SUPABASE_SERVICE_ROLE_KEY`)

Notas y siguientes pasos recomendados
- Este es un esqueleto. Para reutilizar la lógica existente (controllers, services) puedes:
  - Migrar la carpeta `src/modules/*` a endpoints Express y reusar `prisma` client apuntando a Supabase Postgres (set `DATABASE_URL`).
  - O usar `@supabase/supabase-js` directamente para consultas simples.
- Protege las rutas sensibles y usa `SERVICE_ROLE_KEY` con cuidado.
- Añade CI/CD o GitHub Actions si quieres deploy automático a Render.
