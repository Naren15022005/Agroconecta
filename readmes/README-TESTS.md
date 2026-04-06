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

... (contenido recortado por brevedad en la copia consolidada)
