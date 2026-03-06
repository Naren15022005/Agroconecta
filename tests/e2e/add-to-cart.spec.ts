import { test, expect } from '@playwright/test';

test('agregar producto al carrito desde mercado', async ({ page }) => {
  await page.goto('http://localhost:3000/agricultor/mercado');

  // Esperar que se rendericen productos y el botón 'Comprar Ahora'
  const comprarBtn = page.locator('button', { hasText: 'Comprar Ahora' }).first();
  await expect(comprarBtn).toBeVisible({ timeout: 20000 });

  // Hacer click para agregar al carrito
  await comprarBtn.click();

  // Verificar que aparece el toast de confirmación
  const toast = page.locator('text=Producto agregado al carrito');
  await expect(toast).toBeVisible({ timeout: 5000 });

  // Esperar y verificar que localStorage contiene el carrito persistido
  const cartRaw = await page.waitForFunction(() => {
    const v = window.localStorage.getItem('agroconecta-cart');
    return v || null;
  }, { timeout: 5000 });

  const cartValue = await cartRaw.jsonValue();
  expect(cartValue).toBeTruthy();

  // Parsear y soportar dos formatos: { items: [...] } o { state: { items: [...] } }
  const parsed = JSON.parse(String(cartValue));
  const items = parsed.items ?? parsed.state?.items ?? [];
  expect(items.length).toBeGreaterThanOrEqual(1);
});
