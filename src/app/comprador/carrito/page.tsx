"use client";
import { useCartStore } from '@/store/cart';
import { useCleanInvalidCartItems } from '@/store/useCleanInvalidCartItems';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { ShoppingBag, Plus, Minus, Trash2, ShoppingCart, ArrowLeft, Store } from 'lucide-react';

export default function CarritoPage() {
  const cart = useCartStore();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Limpia productos inválidos automáticamente
  useCleanInvalidCartItems();

  const hasInvalidItems = cart.items.some(item => !item.id.startsWith('AGRC_PRD_'));
  const itemsByVendor = cart.getItemsByVendor();

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header profesional */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => router.push('/comprador/mercado')}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors font-medium"
            >
              <ArrowLeft size={20} />
              Continuar comprando
            </button>
            <div className="flex items-center gap-3">
              <ShoppingBag size={24} className="text-gray-700" />
              <div>
                <h1 className="text-xl font-semibold text-gray-900">Carrito de compras</h1>
                <p className="text-sm text-gray-500">{cart.getTotalItems()} productos</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {cart.items.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-16 text-center">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <ShoppingCart size={40} className="text-gray-400" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Tu carrito está vacío</h2>
            <p className="text-gray-500 mb-8">
              Explora nuestro mercado y encuentra productos frescos de agricultores locales
            </p>
            <button
              onClick={() => router.push('/comprador/mercado')}
              className="bg-gray-900 hover:bg-gray-800 text-white px-6 py-3 rounded-lg font-medium transition-colors inline-flex items-center gap-2"
            >
              <Store size={18} />
              Explorar mercado
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Lista de productos - 3 columnas */}
            <div className="lg:col-span-3">
              <div className="space-y-4">
                {Object.entries(itemsByVendor).map(([agricultorId, vendor]) => (
                  <div key={agricultorId} className="bg-white rounded-lg shadow-sm border border-gray-200">
                    {/* Header del vendedor - más simple */}
                    <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                          <Store size={16} className="text-green-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">{vendor.campesinoName}</h3>
                          <p className="text-sm text-gray-500">
                            {vendor.items.length} producto{vendor.items.length !== 1 ? 's' : ''}
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    {/* Productos - diseño limpio */}
                    <div className="divide-y divide-gray-100">
                      {vendor.items.map((item) => (
                        <div key={item.id} className="p-6">
                          <div className="flex items-center gap-4">
                            {/* Imagen más pequeña y elegante */}
                            <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                              {item.imageUrl ? (
                                item.imageUrl.startsWith('/uploads/') ? (
                                  <img
                                    src={item.imageUrl}
                                    alt={item.name}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center text-xl">
                                    {item.imageUrl}
                                  </div>
                                )
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-xl text-gray-400">
                                  🥬
                                </div>
                              )}
                            </div>
                            
                            {/* Información del producto */}
                            <div className="flex-1 min-w-0">
                              <h4 className="font-medium text-gray-900 capitalize">{item.name}</h4>
                              <p className="text-sm text-gray-500">{item.unit}</p>
                              <p className="text-lg font-semibold text-gray-900 mt-1">
                                ${item.price.toLocaleString()}
                              </p>
                            </div>
                            
                            {/* Controles de cantidad - más discretos */}
                            <div className="flex items-center gap-3">
                              <div className="flex items-center border border-gray-300 rounded-lg">
                                <button
                                  onClick={() => cart.updateQuantity(item.id, item.quantity - 1)}
                                  disabled={item.quantity <= 1}
                                  className="p-2 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                  <Minus size={16} className="text-gray-600" />
                                </button>
                                <span className="px-4 py-2 font-medium text-gray-900 min-w-[3rem] text-center">
                                  {item.quantity}
                                </span>
                                <button
                                  onClick={() => cart.updateQuantity(item.id, item.quantity + 1)}
                                  disabled={item.quantity >= item.stock}
                                  className="p-2 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                  <Plus size={16} className="text-gray-600" />
                                </button>
                              </div>
                              
                              {/* Subtotal */}
                              <div className="text-right min-w-[80px]">
                                <p className="font-semibold text-gray-900">
                                  ${(item.price * item.quantity).toLocaleString()}
                                </p>
                              </div>
                              
                              {/* Botón eliminar más discreto */}
                              <button
                                onClick={() => cart.removeItem(item.id)}
                                className="p-2 hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </div>
                          
                          {/* Información de stock */}
                          <div className="mt-3 flex items-center justify-between text-sm text-gray-500">
                            <span>Stock disponible: {item.stock}</span>
                            {item.quantity >= item.stock && (
                              <span className="text-amber-600 font-medium">Stock máximo alcanzado</span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Resumen - 1 columna, más compacto */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sticky top-8">
                <h3 className="font-semibold text-gray-900 mb-6">Resumen del pedido</h3>
                
                {/* Detalles del pedido */}
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Productos ({cart.getTotalItems()})</span>
                    <span className="font-medium">${cart.getTotalPrice().toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Envío</span>
                    <span className="text-green-600 font-medium">Calculado en checkout</span>
                  </div>
                  <hr className="my-4" />
                  <div className="flex justify-between">
                    <span className="font-semibold text-gray-900">Total</span>
                    <span className="text-xl font-bold text-gray-900">
                      ${cart.getTotalPrice().toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Alertas */}
                {hasInvalidItems && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                    <div className="flex gap-2">
                      <span className="text-red-500">⚠️</span>
                      <div>
                        <p className="text-sm font-medium text-red-800">Productos inválidos</p>
                        <p className="text-xs text-red-600">Elimínalos para continuar</p>
                      </div>
                    </div>
                  </div>
                )}

                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                    <p className="text-sm text-red-800">{error}</p>
                  </div>
                )}

                {success && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
                    <p className="text-sm text-green-800">{success}</p>
                  </div>
                )}

                {/* Botón principal */}
                <button
                  onClick={() => router.push('/comprador/checkout')}
                  disabled={hasInvalidItems}
                  className="w-full bg-gray-900 hover:bg-gray-800 text-white py-3 px-4 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <ShoppingBag size={18} />
                  Proceder al Checkout
                </button>
                
                <p className="text-xs text-gray-500 text-center mt-3">
                  Compra segura y protegida
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
