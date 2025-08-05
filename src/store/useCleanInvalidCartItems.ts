import { useEffect } from 'react';
import { useCartStore } from '@/store/cart';

/**
 * Hook que limpia automáticamente el carrito de productos cuyo ID no existe en la base de datos real.
 * Se ejecuta al montar el componente y cada vez que cambia el carrito.
 */
export function useCleanInvalidCartItems() {
  const cart = useCartStore();

  useEffect(() => {
    async function cleanCart() {
      if (cart.items.length === 0) return;
      // Verifica los IDs en el backend
      const ids = cart.items.map(item => item.id);
      const res = await fetch('/api/productos');
      if (!res.ok) return;
      const productos = await res.json();
      const validIds = new Set(productos.map((p: any) => p.id));
      let changed = false;
      cart.items.forEach(item => {
        if (!validIds.has(item.id)) {
          cart.removeItem(item.id);
          changed = true;
        }
      });
      if (changed) {
        // Opcional: notificar al usuario
        // alert('Se eliminaron productos inválidos del carrito.');
      }
    }
    cleanCart();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cart.items.length]);
}
