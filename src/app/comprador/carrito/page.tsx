"use client";
import { useCartStore } from '@/store/cart';
import { useCleanInvalidCartItems } from '@/store/useCleanInvalidCartItems';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function CarritoPage() {
  const cart = useCartStore();
  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Limpia productos inválidos automáticamente
  useCleanInvalidCartItems();

  const hasInvalidItems = cart.items.some(item => !item.id.startsWith('AGRC_PRD_'));

  const handleCheckout = async () => {
    setIsProcessing(true);
    setError(null);
    setSuccess(null);
    if (hasInvalidItems) {
      setError('Tu carrito contiene productos inválidos. Por favor elimínalos antes de finalizar la compra.');
      setIsProcessing(false);
      return;
    }
    try {
      const allItems = cart.items.map(item => ({
        productoId: item.id,
        nombre: item.name,
        cantidad: item.quantity,
        precioUnitario: item.price,
        agricultorId: item.campesinoId,
        stockDisponible: item.stock,
        metodoEntrega: 'ENTREGA_DIRECTA',
        metodoPago: 'CONTRAENTREGA',
      }));
      const response = await fetch('/api/carrito/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: allItems }),
      });
      if (!response.ok) {
        const error = await response.json();
        // Si el error es de stock insuficiente, intentar obtener el stock actualizado
        if (error.error && error.error.startsWith('Stock insuficiente para')) {
          const nombreProducto = error.error.replace('Stock insuficiente para ', '');
          // Buscar el producto en el carrito
          const item = cart.items.find(i => i.name === nombreProducto);
          if (item) {
            // Consultar el stock actualizado del backend (endpoint correcto)
            const res = await fetch(`/api/productos/${item.id}/stock`);
            if (res.ok) {
              const prod = await res.json();
              cart.updateQuantity(item.id, prod.stock);
              setError(`Stock actualizado para "${item.name}": solo quedan ${prod.stock} unidades. Ajusta la cantidad y vuelve a intentar.`);
              return;
            }
          }
        }
        setError(error.error || 'Error al procesar el pedido.');
        return;
      }
      cart.clearCart();
      setSuccess('¡Pedido realizado exitosamente! Pronto recibirás notificaciones.');
      setTimeout(() => router.push('/comprador/pedidos'), 2000);
    } catch (e) {
      setError('Error inesperado al procesar el pedido. Intenta de nuevo.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold text-green-700 mb-6">Carrito de compras</h1>
      {cart.items.length === 0 ? (
        <div className="text-center text-gray-500 py-16">Tu carrito está vacío.</div>
      ) : (
        <div className="bg-white rounded-xl shadow p-6">
          <table className="w-full mb-6">
            <thead>
              <tr className="text-left text-gray-500 text-sm border-b">
                <th className="py-2">Producto</th>
                <th className="py-2">Campesino</th>
                <th className="py-2">Cantidad</th>
                <th className="py-2">Stock</th>
                <th className="py-2">Precio</th>
                <th className="py-2">Subtotal</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {cart.items.map(item => (
                <tr key={item.id} className="border-b last:border-0 align-middle">
                  <td className="py-2 font-medium flex items-center gap-3">
                    {item.imageUrl && (
                      item.imageUrl.startsWith('/uploads/') ? (
                        <img src={item.imageUrl} alt={item.name} className="w-14 h-14 object-cover rounded-lg border" />
                      ) : (
                        <span className="text-3xl">{item.imageUrl}</span>
                      )
                    )}
                    <div>
                      <div className="font-semibold text-gray-900 text-base">{item.name}</div>
                      <div className="text-xs text-gray-400">{item.unit}</div>
                    </div>
                  </td>
                  <td className="py-2 text-green-700 font-semibold">{item.campesinoName}</td>
                  <td className="py-2">
                    <div className="flex items-center gap-2">
                      <button
                        className="px-2 py-1 bg-gray-100 rounded hover:bg-gray-200"
                        onClick={() => cart.updateQuantity(item.id, item.quantity - 1)}
                        disabled={item.quantity <= 1}
                      >-</button>
                      <span className="px-2">{item.quantity}</span>
                      <button
                        className="px-2 py-1 bg-gray-100 rounded hover:bg-gray-200"
                        onClick={() => cart.updateQuantity(item.id, item.quantity + 1)}
                        disabled={item.quantity >= item.stock}
                      >+</button>
                    </div>
                  </td>
                  <td className="py-2 text-xs text-gray-500">{item.stock}</td>
                  <td className="py-2">${item.price.toLocaleString()}</td>
                  <td className="py-2 font-semibold text-green-700">${(item.price * item.quantity).toLocaleString()}</td>
                  <td className="py-2">
                    <button
                      className="text-red-500 hover:underline"
                      onClick={() => cart.removeItem(item.id)}
                    >Eliminar</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="flex justify-between items-center mb-4">
            <span className="font-semibold text-lg">Total:</span>
            <span className="text-2xl font-bold text-green-700">${cart.getTotalPrice().toLocaleString()}</span>
          </div>
          {hasInvalidItems && (
            <div className="text-red-600 font-semibold mb-4">
              ⚠️ Hay productos inválidos en tu carrito. Elimínalos para poder comprar.
            </div>
          )}
          {error && <div className="text-red-600 mb-4">{error}</div>}
          {success && <div className="text-green-600 mb-4">{success}</div>}
          <button
            className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold text-lg hover:bg-green-700 transition disabled:opacity-50"
            onClick={handleCheckout}
            disabled={isProcessing}
          >
            {isProcessing ? 'Procesando...' : 'Finalizar compra'}
          </button>
        </div>
      )}
    </div>
  );
}
