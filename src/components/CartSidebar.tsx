"use client";

import { useCartStore } from '@/store/cart';
import { X, Plus, Minus, Trash2, ShoppingBag } from 'lucide-react';
import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Dialog } from '@radix-ui/react-dialog';

export default function CartSidebar() {
  const { data: session } = useSession();
  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState(false);
  const [modal, setModal] = useState<{ open: boolean; success?: boolean; message?: string }>({ open: false });

  const { 
    items, 
    isOpen, 
    toggleCart, 
    updateQuantity, 
    removeItem, 
    clearCart, 
    getTotalItems, 
    getTotalPrice, 
    getItemsByVendor 
  } = useCartStore();

  const itemsByVendor = getItemsByVendor();

  const handleUpdateQuantity = (itemId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeItem(itemId);
    } else {
      updateQuantity(itemId, newQuantity);
    }
  };

  const handleCheckout = async () => {
    if (!session) {
      router.push('/auth/signin?callbackUrl=/comprador/mercado');
      return;
    }
    setIsProcessing(true);
    try {
      // Unificar todos los items en un solo array para el endpoint
      const allItems = items.map(item => ({
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
        setModal({ open: true, success: false, message: error.error || 'Error al procesar el pedido.' });
        return;
      }
      clearCart();
      toggleCart();
      setModal({ open: true, success: true, message: '¡Tus pedidos fueron creados exitosamente! Pronto recibirás notificaciones.' });
    } catch (error) {
      setModal({ open: true, success: false, message: 'Error inesperado al procesar el pedido. Intenta de nuevo.' });
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Modal de confirmación y error */}
      <Dialog open={modal.open} onOpenChange={open => setModal(m => ({ ...m, open }))}>
        {modal.open && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black bg-opacity-40">
            <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
              {modal.success ? (
                <>
                  <div className="text-green-600 text-4xl mb-2">✔️</div>
                  <h2 className="text-xl font-bold mb-2">¡Pedido realizado!</h2>
                  <p className="mb-4">{modal.message}</p>
                  <button
                    className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                    onClick={() => setModal({ open: false })}
                  >
                    Cerrar
                  </button>
                </>
              ) : (
                <>
                  <div className="text-red-500 text-4xl mb-2">❌</div>
                  <h2 className="text-xl font-bold mb-2">Ocurrió un error</h2>
                  <p className="mb-4">{modal.message}</p>
                  <button
                    className="bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400"
                    onClick={() => setModal({ open: false })}
                  >
                    Cerrar
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </Dialog>
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-40"
        onClick={toggleCart}
      />
      
      {/* Sidebar */}
      <div className="fixed right-0 top-0 h-full w-96 bg-white shadow-xl z-50 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <ShoppingBag size={20} />
            Mi Carrito ({getTotalItems()})
          </h2>
          <button
            onClick={toggleCart}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-500">
              <ShoppingBag size={48} className="mb-4" />
              <p className="text-lg font-medium">Tu carrito está vacío</p>
              <p className="text-sm">Agrega productos para comenzar</p>
            </div>
          ) : (
            <div className="p-4">
              {/* Agrupación por agricultor */}
              {Object.entries(itemsByVendor).map(([agricultorId, vendor]) => (
                <div key={agricultorId} className="mb-6">
                  <div className="bg-green-50 p-3 rounded-lg mb-3">
                    <h3 className="font-medium text-green-800">
                      🚜 {vendor.campesinoName}
                    </h3>
                    <p className="text-sm text-green-600">
                      {vendor.items.length} producto(s)
                    </p>
                  </div>
                  
                  {vendor.items.map((item) => (
                    <div key={item.id} className="flex items-center gap-3 mb-4 p-3 border rounded-lg">
                      <div className="w-16 h-16 bg-gray-200 rounded-lg flex-shrink-0">
                        {item.imageUrl ? (
                          <img
                            src={item.imageUrl}
                            alt={item.name}
                            className="w-full h-full object-cover rounded-lg"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400">
                            🥬
                          </div>
                        )}
                      </div>
                      
                      <div className="flex-1">
                        <h4 className="font-medium text-sm">{item.name}</h4>
                        <p className="text-green-600 font-semibold">
                          ${item.price.toLocaleString()}/{item.unit}
                        </p>
                        
                        <div className="flex items-center gap-2 mt-2">
                          <button
                            onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                            className="p-1 hover:bg-gray-100 rounded"
                          >
                            <Minus size={14} />
                          </button>
                          <span className="px-2 py-1 bg-gray-100 rounded text-sm">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                            disabled={item.quantity >= item.stock}
                            className="p-1 hover:bg-gray-100 rounded disabled:opacity-50"
                          >
                            <Plus size={14} />
                          </button>
                          <button
                            onClick={() => removeItem(item.id)}
                            className="p-1 hover:bg-red-100 text-red-600 rounded ml-auto"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t p-4">
            <div className="flex justify-between items-center mb-4">
              <span className="text-lg font-semibold">Total:</span>
              <span className="text-2xl font-bold text-green-600">
                ${getTotalPrice().toLocaleString()}
              </span>
            </div>
            
            <div className="space-y-2">
              <button
                onClick={handleCheckout}
                disabled={isProcessing}
                className="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 font-medium"
              >
                {isProcessing ? 'Procesando...' : 'Realizar Pedidos'}
              </button>
              
              <button
                onClick={clearCart}
                className="w-full bg-gray-200 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors text-sm"
              >
                Vaciar Carrito
              </button>
            </div>
            
            <p className="text-xs text-gray-500 mt-3 text-center">
              Se crearán pedidos separados por cada agricultor
            </p>
          </div>
        )}
      </div>
    </>
  );
}
