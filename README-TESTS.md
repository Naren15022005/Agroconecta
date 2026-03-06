# Tests — AgroConecta

Este documento explica cómo ejecutar las pruebas unitarias y E2E localmente y cómo funciona el CI.

Requisitos
- Node.js 18+
- npm

Instalación rápida
```powershell
npm install --no-audit
```

Tests unitarios (Vitest)
```powershell
# Ejecuta todos los tests unitarios
npm run test

# Modo watch
npm run test:watch

# Ejecutar con cobertura
npm run test:ci
```

Tests E2E (Playwright)
Playwright necesita descargar navegadores antes de ejecutar pruebas E2E:

```powershell
# Instala navegadores (una sola vez)
npx playwright install --with-deps

# Ejecuta las pruebas E2E (arranca dev server según playwright.config.ts)
npx playwright test --project=chromium --config=playwright.config.ts
```

Notas sobre E2E
- El test E2E `tests/e2e/add-to-cart.spec.ts` arranca el servidor de desarrollo (`npm run dev`) automáticamente a través de la configuración `playwright.config.ts`.
- El flujo de agregar al carrito utiliza `localStorage` (key `agroconecta-cart`) para persistencia en el cliente; el test valida que el item fue añadido en `localStorage`.

CI (GitHub Actions)
- El workflow `./github/workflows/ci.yml` ejecuta:
  1. `npm ci`
  2. `npx prisma generate` (para asegurar cliente Prisma disponible)
  3. Descarga navegadores Playwright (`npx playwright install --with-deps`)
  4. Ejecuta tests unitarios
  5. Ejecuta tests E2E

Consejos y soluciones a errores comunes
- Si `npx playwright install --with-deps` falla por red, ejecuta `npx playwright install` o reintenta desde otra red.
- Si los E2E fallan por `NEXTAUTH_URL` u otras variables de entorno, define en tu shell (o en GitHub Secrets para CI) las variables necesarias:
  - `DATABASE_URL` (solo si pruebas requieren DB)
  - `NEXTAUTH_URL` (por ejemplo `http://localhost:3000`)

Preguntas frecuentes
- ¿Los tests E2E requieren acceso a la base de datos? Actualmente no: la página de catálogo usa datos demo cuando la API falla, por lo que el E2E de `add-to-cart` no requiere DB real. Para pruebas integradas con DB se debe provisionar una base de datos y ejecutar migraciones.

---
Generado automáticamente para facilitar ejecución de pruebas locales y en CI.
