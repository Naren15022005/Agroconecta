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
      
      {/* Sidebar con diseño moderno */}
      <div className="fixed right-0 top-0 h-full w-96 bg-gradient-to-b from-white to-gray-50 shadow-2xl z-50 flex flex-col">
        {/* Header mejorado */}
        <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white bg-opacity-10 rounded-full -translate-y-16 translate-x-16"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white bg-opacity-5 rounded-full translate-y-12 -translate-x-12"></div>
          
          <div className="relative flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-white bg-opacity-20 p-2 rounded-xl">
                <ShoppingBag size={24} className="text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold">Carrito de compras</h2>
                <p className="text-green-100 text-sm">{getTotalItems()} productos seleccionados</p>
              </div>
            </div>
            <button
              onClick={toggleCart}
              className="p-2 hover:bg-white hover:bg-opacity-20 rounded-xl transition-colors"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Content mejorado */}
        <div className="flex-1 overflow-y-auto bg-gray-50">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-500 p-8">
              <div className="bg-gradient-to-br from-green-100 to-emerald-100 p-8 rounded-3xl mb-6">
                <ShoppingBag size={64} className="text-green-500" />
              </div>
              <h3 className="text-xl font-bold text-gray-700 mb-2">Tu carrito está vacío</h3>
              <p className="text-gray-500 text-center">¡Explora nuestros productos frescos y agrega tus favoritos!</p>
            </div>
          ) : (
            <div className="p-4 space-y-6">
              {/* Agrupación por agricultor mejorada */}
              {Object.entries(itemsByVendor).map(([agricultorId, vendor]) => (
                <div key={agricultorId} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                  {/* Header del agricultor */}
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 border-b border-green-100">
                    <div className="flex items-center gap-3">
                      <div className="bg-green-500 p-2 rounded-xl">
                        <span className="text-white text-lg">🚜</span>
                      </div>
                      <div>
                        <h3 className="font-bold text-green-800 text-lg">
                          {vendor.campesinoName}
                        </h3>
                        <p className="text-green-600 text-sm font-medium">
                          {vendor.items.length} producto{vendor.items.length !== 1 ? 's' : ''} • ${vendor.items.reduce((sum, item) => sum + (item.price * item.quantity), 0).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Productos del agricultor */}
                  <div className="p-4 space-y-3">
                    {vendor.items.map((item) => (
                      <div key={item.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                        {/* Imagen del producto */}
                        <div className="w-16 h-16 rounded-xl overflow-hidden bg-gradient-to-br from-green-100 to-emerald-100 flex-shrink-0 shadow-sm">
                          {item.imageUrl ? (
                            <img
                              src={item.imageUrl}
                              alt={item.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-2xl">
                              🥬
                            </div>
                          )}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold text-gray-900 text-sm truncate capitalize">{item.name}</h4>
                          <p className="text-green-600 font-bold text-base">
                            ${item.price.toLocaleString()}<span className="text-gray-500 text-xs">/{item.unit}</span>
                          </p>
                          
                          {/* Controles de cantidad modernos */}
                          <div className="flex items-center gap-3 mt-3">
                            <div className="flex items-center bg-white rounded-lg shadow-sm border border-gray-200">
                              <button
                                onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                                className="p-2 hover:bg-gray-50 rounded-l-lg transition-colors"
                              >
                                <Minus size={16} className="text-gray-600" />
                              </button>
                              <span className="px-4 py-2 font-bold text-gray-900 min-w-[3rem] text-center">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                                disabled={item.quantity >= item.stock}
                                className="p-2 hover:bg-gray-50 rounded-r-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                <Plus size={16} className="text-gray-600" />
                              </button>
                            </div>
                            
                            <div className="flex-1 text-right">
                              <p className="font-bold text-lg text-gray-900">
                                ${(item.price * item.quantity).toLocaleString()}
                              </p>
                            </div>
                            
                            <button
                              onClick={() => removeItem(item.id)}
                              className="p-2 hover:bg-red-50 text-red-500 rounded-lg transition-colors"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                          
                          {item.quantity >= item.stock && (
                            <p className="text-xs text-amber-600 mt-1 font-medium">⚠️ Stock máximo alcanzado</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer moderno */}
        {items.length > 0 && (
          <div className="bg-white border-t border-gray-200 p-6 space-y-6">
            {/* Resumen de totales */}
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-2xl border border-green-100">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Total a pagar</p>
                  <p className="text-gray-500 text-xs">{getTotalItems()} productos</p>
                </div>
                <div className="text-right">
                  <p className="text-3xl font-bold text-green-600">
                    ${getTotalPrice().toLocaleString()}
                  </p>
                  <p className="text-green-500 text-xs font-medium">COP</p>
                </div>
              </div>
            </div>
            
            {/* Botones de acción */}
            <div className="space-y-3">
              <button
                onClick={handleCheckout}
                disabled={isProcessing}
                className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white py-4 px-6 rounded-2xl font-bold text-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                {isProcessing ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Procesando pedido...
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-2">
                    <ShoppingBag size={20} />
                    Proceder al Checkout
                  </div>
                )}
              </button>
              
              <button
                onClick={clearCart}
                className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 px-6 rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
              >
                <Trash2 size={16} />
                Eliminar
              </button>
            </div>
            
            {/* Nota informativa */}
            <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
              <div className="flex items-start gap-3">
                <div className="bg-blue-500 p-1 rounded-lg flex-shrink-0">
                  <span className="text-white text-sm">ℹ️</span>
                </div>
                <div>
                  <p className="text-blue-800 text-sm font-medium">Pedidos por agricultor</p>
                  <p className="text-blue-600 text-xs">Se crearán pedidos separados para cada agricultor automáticamente</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
