"use client";
import { useCartStore } from '@/store/cart';
import { useCleanInvalidCartItems } from '@/store/useCleanInvalidCartItems';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { ShoppingBag, Plus, Minus, Trash2, ShoppingCart, ArrowLeft, Store, Sprout, ArrowRight, ShieldAlert } from 'lucide-react';

export default function CarritoPage() {
  const cart = useCartStore();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useCleanInvalidCartItems();

  const hasInvalidItems = cart.items.some(item => !item.id.startsWith('AGRC_PRD_'));
  const itemsByVendor = cart.getItemsByVendor();

  return (
    <div className="min-h-screen bg-neutral-900 text-white">
      {/* Header profesional */}
      <div className="bg-neutral-900/90 backdrop-blur-md border-b border-neutral-800 sticky top-16 z-30">
        <div className="w-full max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-10 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => router.push('/comprador/mercado')}
              className="flex items-center gap-2 text-neutral-300 hover:text-white transition-colors font-medium text-sm"
            >
              <ArrowLeft size={18} />
              <span>Seguir comprando</span>
            </button>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-lime-500/10 border border-lime-500/20 text-lime-400">
                <ShoppingBag size={20} />
              </div>
              <div>
                <h1 className="text-lg font-bold text-white">Carrito de compras</h1>
                <p className="text-xs text-neutral-400">{cart.getTotalItems()} producto(s)</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="w-full max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-10 py-8">
        {cart.items.length === 0 ? (
          <div className="bg-neutral-850 rounded-2xl border border-neutral-800 p-12 text-center max-w-lg mx-auto shadow-xl">
            <div className="w-16 h-16 bg-neutral-800 rounded-2xl border border-neutral-700 flex items-center justify-center mx-auto mb-4 text-lime-400">
              <ShoppingCart size={32} />
            </div>
            <h2 className="text-xl font-bold text-white mb-2">Tu carrito está vacío</h2>
            <p className="text-neutral-400 text-sm mb-6 leading-relaxed">
              Explora el mercado directo y apoya a los campesinos colombianos comprando cosechas frescas.
            </p>
            <button
              onClick={() => router.push('/comprador/mercado')}
              className="bg-gradient-to-r from-lime-600 to-lime-500 hover:from-lime-500 hover:to-lime-600 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-lg shadow-lime-900/40 inline-flex items-center gap-2 text-sm"
            >
              <Store size={18} />
              <span>Explorar Mercado</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Lista de productos por Vendedor */}
            <div className="lg:col-span-3 space-y-5">
              {Object.entries(itemsByVendor).map(([agricultorId, vendor]) => (
                <div key={agricultorId} className="bg-neutral-850 rounded-2xl border border-neutral-800 shadow-lg overflow-hidden">
                  {/* Header Vendedor */}
                  <div className="px-6 py-4 border-b border-neutral-800 bg-neutral-800/50 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-lime-500/10 border border-lime-500/20 rounded-xl flex items-center justify-center text-lime-400">
                        <Store size={18} />
                      </div>
                      <div>
                        <h3 className="font-bold text-white text-base">{vendor.campesinoName}</h3>
                        <p className="text-xs text-neutral-400">
                          {vendor.items.length} producto{vendor.items.length !== 1 ? 's' : ''}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                    <div className="text-right">
                      <p className="text-sm font-extrabold text-lime-400">
                        ${(vendor.items.reduce((sum, item) => sum + (item.price || 0) * (item.quantity || 0), 0) || 0).toLocaleString('es-CO')}
                      </p>
                    </div>
                  </div>

                  {/* Lista de Items */}
                  <div className="divide-y divide-neutral-800/80">
                    {vendor.items.map((item) => {
                      const hasImage = item.imageUrl && (item.imageUrl.startsWith('http') || item.imageUrl.startsWith('/'));
                      const itemPrice = item.price || 0;
                      const itemQty = item.quantity || 0;
                      return (
                        <div key={item.id} className="p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                          <div className="flex items-center gap-4 min-w-0 flex-1">
                            <div className="w-16 h-16 rounded-xl bg-neutral-800 border border-neutral-700/80 overflow-hidden flex-shrink-0 flex items-center justify-center">
                              {hasImage ? (
                                <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                              ) : (
                                <Sprout className="w-7 h-7 text-lime-400" />
                              )}
                            </div>

                            <div className="min-w-0 flex-1">
                              <h4 className="font-bold text-white text-base capitalize truncate">{item.name}</h4>
                              <p className="text-xs text-neutral-400 mb-1">Unidad: {item.unit}</p>
                              <p className="text-base font-extrabold text-lime-400">
                                ${itemPrice.toLocaleString('es-CO')}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-6 pt-2 sm:pt-0 border-t sm:border-t-0 border-neutral-800">
                            {/* Controles de cantidad */}
                            <div className="flex items-center bg-neutral-900 border border-neutral-700 rounded-xl">
                              <button
                                onClick={() => cart.updateQuantity(item.id, item.quantity - 1)}
                                disabled={item.quantity <= 1}
                                className="p-2 hover:bg-neutral-800 text-neutral-300 hover:text-white rounded-l-xl transition-colors disabled:opacity-40"
                              >
                                <Minus size={16} />
                              </button>
                              <span className="px-4 py-1.5 font-bold text-sm text-white min-w-[2.5rem] text-center">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() => cart.updateQuantity(item.id, item.quantity + 1)}
                                disabled={item.quantity >= item.stock}
                                className="p-2 hover:bg-neutral-800 text-neutral-300 hover:text-white rounded-r-xl transition-colors disabled:opacity-40"
                              >
                                <Plus size={16} />
                              </button>
                            </div>

                            <div className="text-right min-w-[100px]">
                              <p className="font-extrabold text-white text-base">
                                ${(itemPrice * itemQty).toLocaleString('es-CO')}
                              </p>
                            </div>

                            <button
                              onClick={() => cart.removeItem(item.id)}
                              className="p-2.5 rounded-xl hover:bg-red-500/10 text-neutral-400 hover:text-red-400 transition-colors"
                              aria-label="Eliminar"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            {/* Resumen del pedido */}
            <div className="lg:col-span-1">
              <div className="bg-neutral-850 rounded-2xl border border-neutral-800 p-6 sticky top-28 shadow-xl space-y-5">
                <h3 className="font-bold text-white text-lg border-b border-neutral-800 pb-3">Resumen del pedido</h3>
                
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between text-neutral-300">
                    <span>Productos ({cart.getTotalItems()})</span>
                    <span className="font-semibold text-white">${(cart.getTotalPrice() || 0).toLocaleString('es-CO')}</span>
                  </div>
                  <div className="flex justify-between text-neutral-300">
                    <span>Envío</span>
                    <span className="text-lime-400 font-semibold">Calculado en checkout</span>
                  </div>
                  <div className="border-t border-neutral-800 pt-3 flex justify-between items-baseline">
                    <span className="font-bold text-white text-base">Total</span>
                    <span className="text-2xl font-extrabold text-lime-400">
                      ${(cart.getTotalPrice() || 0).toLocaleString('es-CO')}
                    </span>
                  </div>
                </div>

                {hasInvalidItems && (
                  <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3 text-xs text-red-400 flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4 flex-shrink-0" />
                    <span>Hay productos inválidos en el carrito. Elimínalos para proceder.</span>
                  </div>
                )}

                <button
                  onClick={() => router.push('/comprador/checkout')}
                  disabled={hasInvalidItems}
                  className="w-full bg-gradient-to-r from-lime-600 to-lime-500 hover:from-lime-500 hover:to-lime-600 text-white py-3.5 px-4 rounded-xl font-bold transition-all shadow-lg shadow-lime-900/40 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm"
                >
                  <span>Proceder al Checkout</span>
                  <ArrowRight size={18} />
                </button>

                <p className="text-[11px] text-neutral-400 text-center">
                  Garantía AgroConecta: Compra directa y segura
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
