# Flujo — Estado actual del proyecto

## Resumen ejecutivo

AgroConecta es un marketplace multi-vendedor para conectar campesinos con compradores y empresas. El repositorio contiene una aplicación Next.js (App Router) con TypeScript, Prisma como ORM, múltiples scripts de mantenimiento/seed, y un frontend con componentes, stores y páginas por rol. En términos generales el producto está avanzado: la mayor parte de la funcionalidad core está implementada, quedan tareas de endurecimiento, pruebas, integración y despliegue para un lanzamiento seguro.

## Estructura principal (visión rápida)

- **Código de la aplicación**: `src/` — App Router, componentes, stores, estilos.
- **Configuración y dependencias**: [package.json](package.json)
- **Base de datos / esquema**: [prisma/schema.prisma](prisma/schema.prisma)
- **Documentación y lógica**: `README_LOGICA.md`, `ESTRUCTURA_SISTEMA.md`, `README.md`
- **Scripts y utilidades**: `scripts/`, `prisma/` (seeds, migraciones), `backups/`.
- **Página de referencia activa**: [src/app/agricultor/mercado/page.tsx](src/app/agricultor/mercado/page.tsx)

## Qué hay implementado hoy (funcionalidad observable en el código)

- **Modelo de datos completo**: usuarios, roles, productos, categorías, carrito, orders, pagos, wallets, transacciones, etc. (ver `prisma/schema.prisma`).
- **Interfaz de cliente y agricultor**: páginas y componentes para catálogo, filtros, banner, store del carrito (Zustand), vistas por rol.
- **Autenticación**: NextAuth integrada (adaptador Prisma), cuentas, sessions.
- **Carrito multi-vendedor y lógica de checkout**: modelos y guías de flujo para dividir pedidos por agricultor (lógica presente en docs y modelos DB).
- **Scripts de mantenimiento**: seeds, backups, restore, utilidades para crear admin, validar roles y pagos.
- **Integración con pasarela**: dependencia `mercadopago` presente y scripts de validación de pagos (`scripts/validate-payments.ts`), además de utilidades para correo (`nodemailer`).

## Flujos de usuario que funcionan o están claramente definidos

- Registro / Login con roles.
- Publicar/editar productos por parte del campesino (`agricultor`).
- Navegación y búsqueda de productos (filtros por categoría/ciudad, orden, vista grid/list).
- Añadir al carrito, agrupar por agricultor y generar pedidos (modelo y UI parcial).
- Generación de órdenes y registro de transacciones (DB y scripts).
- Backups y semillas para poblar datos en desarrollo.

## Estado del proyecto: fase actual

- Estado general: Pre-lanzamiento (beta interna / candidato a piloto local).
- Progreso estimado: **75%**.

### Razonamiento de la estimación

- +40%: Modelo de datos, API y lógica server (Prisma + migraciones + scripts) — ya implementado y con múltiples migraciones.
- +25%: Frontend y experiencia de usuario — muchas páginas y componentes listos (catálogo, filtros, dashboards), pero faltan pulidos y pruebas UX.
- +10%: Integraciones (pagos, correo) — dependencias y scripts existen, falta puesta en producción y testing de webhooks.
- 0%–10% pendiente por infra/ops, pruebas y legal: CI/CD, despliegue, SSL, monitoreo, cumplimiento (políticas, términos, privacidad).

## Qué falta para terminar y lanzar (priorizado)

1. **Pruebas** (prioridad alta)
   - Unitarios y de integración para lógica crítica: cart, checkout, reducción de stock, pagos. (bloqueante real para confiar en producción)
   - E2E/Playwright o Cypress para flujos: registro, compra, notificaciones, webhooks.

2. **Pagos en producción** (prioridad alta)
   - Configurar credenciales reales de `MercadoPago` (u otra pasarela), webhooks y validar idempotencia.
   - Pruebas de reconciliación y manejo de pagos fallidos.

3. **CI/CD y despliegue** (prioridad alta)
   - Pipelines (build, test, migrate DB, deploy). Documentar pasos de rollback.
   - Hosts: Vercel/Render/Cloud, runner para migraciones y tareas cron.

4. **Calidad y seguridad** (prioridad media)
   - Revisión de seguridad para endpoints, validación de inputs y permisos por rol.
   - Escaneo de dependencias y política de secretos (no subir .env, revisar `.gitignore`).

5. **Operaciones y observabilidad** (prioridad media)
   - Logs estructurados, Sentry/LogRocket, métricas básicas y alertas.
   - Backup automático y pruebas de restore (existen scripts manuales; automatizar).

6. **Documentación y UX** (prioridad media)
   - Documentación para despliegue, variables de entorno, y runbook.
   - Polishing UI/UX, accesibilidad y tests de usabilidad.

7. **Otros** (prioridad baja)
   - Localización/traducciones si se requiere multi-idioma.
   - Páginas legales (Términos, Privacidad), políticas de privacidad y facturación.

## Estimación de esfuerzo (macro)

- Tests & QA: 2–4 semanas (1–2 devs) para cobertura básica y E2E.
- Pagos & Webhooks: 1–2 semanas para ajustes y pruebas con pasarela.
- CI/CD + Infra: 1 semana para pipeline + despliegue inicial.
- Hardening (seguridad, observabilidad): 1–2 semanas.

## Recomendación inmediata (próximos pasos)

1. Priorizar crear suite de tests (unit + E2E) y bloquear merge de cambios críticos sin tests.
2. Preparar entorno de staging con credenciales de pasarela en sandbox y probar flujos completos con webhooks.
3. Añadir pipeline CI que ejecute linters, tests y despliegue a staging automáticamente al pushear a `main`/`staging`.
4. Hacer una revisión rápida de seguridad (dependencias, endpoints expuestos, manejo de archivos subidos).

## Conclusión corta

El proyecto está avanzado y es funcional en muchos flujos clave; sin embargo para un lanzamiento público y escalable requiere pruebas automatizadas, ajustes en la integración de pagos, y trabajo de infra/observabilidad. Con un equipo pequeño (1–2 desarrolladores) y foco en las tres prioridades (tests, pagos, CI/CD) se puede preparar un piloto en 3–6 semanas.

---

Archivo generado automáticamente: `flujo.md` — si quieres que ajuste el porcentaje o que detalle un plan de tareas con issues y tiempos estimados, lo hago a continuación.
