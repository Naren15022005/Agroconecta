"use client";

import { useCartStore } from '@/store/cart';
import { X, Plus, Minus, Trash2, ShoppingBag } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function CartSidebar() {
  const { data: session } = useSession();
  const router = useRouter();
  const [modal, setModal] = useState<{ open: boolean; success?: boolean; message?: string }>({ open: false });
  const [requireAuthModal, setRequireAuthModal] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

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

  const handleCheckout = () => {
    // El endpoint /api/carrito/checkout requiere deliveryInfo + paymentInfo.
    // El flujo correcto es ir a /comprador/checkout para recolectar esa info.
    if (!session) {
      // Show a modal informing the user they must login or register before completing the purchase
      setRequireAuthModal(true);
      return;
    }
    toggleCart();
    router.push('/comprador/checkout');
  };

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      const prev = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = prev;
      };
    }

    // allow close animation to finish before unmount
    const t = window.setTimeout(() => setIsVisible(false), 300);
    return () => window.clearTimeout(t);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') toggleCart();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen, toggleCart]);

  if (!isOpen && !isVisible) return null;

  return (
    <>
      {/* Modal simple de confirmación y error */}
      {modal.open && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-2xl bg-neutral-900 border border-neutral-800 p-6 text-center text-neutral-100 shadow-2xl">
            <div className={`text-3xl mb-2 ${modal.success ? 'text-green-300' : 'text-red-400'}`}>
              {modal.success ? '✔️' : '❌'}
            </div>
            <h2 className="text-lg font-bold mb-2">
              {modal.success ? '¡Pedido realizado!' : 'Ocurrió un error'}
            </h2>
            <p className="text-neutral-300 mb-5">{modal.message}</p>
            <button
              className="w-full bg-neutral-800 hover:bg-neutral-700 text-neutral-100 py-2.5 rounded-xl font-semibold transition-colors"
              onClick={() => setModal({ open: false })}
            >
              Cerrar
            </button>
          </div>
        </div>
      )}

      {/* Modal para solicitar autenticación antes del checkout */}
      {requireAuthModal && (
        <div className="fixed inset-0 z-[130] flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-neutral-900 border border-neutral-800 p-6 text-center text-neutral-100 shadow-2xl">
            <h2 className="text-2xl font-bold mb-2">Necesitas una cuenta para comprar</h2>
            <p className="text-neutral-300 mb-4">Para completar tu compra debes iniciar sesión o crear una cuenta. Puedes guardar tu carrito y continuar después.</p>
            <div className="flex gap-3 justify-center mb-4">
              <button
                onClick={() => {
                  setRequireAuthModal(false);
                  // redirect to signin with callback back to checkout
                  router.push('/auth/signin?callbackUrl=/comprador/checkout');
                }}
                className="px-4 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-100 font-semibold"
              >
                Iniciar sesión
              </button>
              <button
                onClick={() => {
                  setRequireAuthModal(false);
                  router.push('/auth/registro?callbackUrl=/comprador/checkout');
                }}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold"
              >
                Registrarme
              </button>
            </div>
            <button
              onClick={() => setRequireAuthModal(false)}
              className="text-sm text-neutral-300 underline hover:text-neutral-100 hover:underline-offset-2 transition-colors"
            >
              Volver al carrito
            </button>
          </div>
        </div>
      )}

      {/* Overlay */}
      <div
        className={`fixed inset-0 z-40 bg-black/25 backdrop-blur-sm transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0'}`}
        onClick={toggleCart}
        aria-hidden
      />

      {/* Panel */}
      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Carrito de compras"
        className={`fixed right-0 top-0 z-50 h-dvh w-screen sm:w-96 max-w-md transform bg-neutral-900 border-l border-neutral-800 shadow-2xl transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
      >
        <div className="h-full flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-800">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-neutral-800 p-2">
                <ShoppingBag size={20} className="text-green-300" />
              </div>
              <div>
                <h2 className="text-base font-bold text-neutral-100">Carrito de compras</h2>
                <p className="text-xs text-neutral-300">{getTotalItems()} producto(s)</p>
              </div>
            </div>
            <button
              onClick={toggleCart}
              className="p-2 rounded-xl hover:bg-neutral-800 transition-colors"
              aria-label="Cerrar carrito"
            >
              <X size={20} className="text-neutral-200" />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-4">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-12">
                <div className="bg-neutral-800 p-7 rounded-3xl mb-5">
                  <ShoppingBag size={56} className="text-green-300" />
                </div>
                <h3 className="text-lg font-bold text-neutral-100">Tu carrito está vacío</h3>
                <p className="text-sm text-neutral-300 mt-2">Agrega productos desde el Mercado.</p>
              </div>
            ) : (
              <div className="space-y-5">
                {Object.entries(itemsByVendor).map(([campesinoId, vendor]) => (
                  <div key={campesinoId} className="rounded-2xl border border-neutral-800 bg-neutral-800/30 overflow-hidden">
                    <div className="px-4 py-3 border-b border-neutral-800 flex items-center justify-between">
                      <div className="min-w-0">
                        <p className="font-semibold text-neutral-100 truncate">{vendor.campesinoName}</p>
                        <p className="text-xs text-neutral-300">{vendor.items.length} producto(s)</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-green-300">
                          ${vendor.items.reduce((sum, item) => sum + item.price * item.quantity, 0).toLocaleString()}
                        </p>
                      </div>
                    </div>

                    <div className="p-4 space-y-3">
                      {vendor.items.map((item) => (
                        <div key={`${item.id}-${item.purchaseUnit ?? ''}`} className="rounded-xl bg-neutral-800 p-3 border border-neutral-700">
                          <div className="flex items-center gap-3">
                            <div className="w-14 h-14 rounded-xl bg-neutral-700 overflow-hidden flex-shrink-0">
                              {item.imageUrl ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                              ) : null}
                            </div>

                            <div className="min-w-0 flex-1">
                              <p className="font-semibold text-neutral-100 truncate capitalize">{item.name}</p>
                              <p className="text-sm text-green-300 font-bold">
                                ${item.price.toLocaleString()} <span className="text-xs text-neutral-400 font-medium">/{item.unit}</span>
                              </p>
                            </div>

                            <button
                              onClick={() => removeItem(item.id)}
                              className="p-2 rounded-lg hover:bg-red-600/10 transition-colors"
                              aria-label="Eliminar producto"
                            >
                              <Trash2 size={16} className="text-red-400" />
                            </button>
                          </div>

                          <div className="mt-3 flex items-center gap-3">
                            <div className="inline-flex items-center bg-neutral-900 rounded-lg border border-neutral-700">
                              <button
                                onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                                className="p-2 hover:bg-neutral-800 rounded-l-lg transition-colors"
                                aria-label="Disminuir cantidad"
                              >
                                <Minus size={16} className="text-neutral-200" />
                              </button>
                              <span className="px-4 text-sm font-bold text-neutral-100 min-w-[2.75rem] text-center">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                                disabled={item.quantity >= item.stock}
                                className="p-2 hover:bg-neutral-800 rounded-r-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                aria-label="Aumentar cantidad"
                              >
                                <Plus size={16} className="text-neutral-200" />
                              </button>
                            </div>

                            <div className="flex-1 text-right">
                              <p className="text-sm font-bold text-neutral-100">
                                ${(item.price * item.quantity).toLocaleString()}
                              </p>
                              {item.quantity >= item.stock && (
                                <p className="text-xs text-amber-400">Stock máximo</p>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {items.length > 0 && (
            <div className="p-4 border-t border-neutral-800 bg-neutral-900/80">
              <div className="rounded-2xl border border-neutral-800 bg-neutral-800/40 p-4 flex items-center justify-between">
                <div>
                  <p className="text-xs text-neutral-300">Total</p>
                  <p className="text-xs text-neutral-400">{getTotalItems()} producto(s)</p>
                </div>
                <p className="text-2xl font-bold text-green-300">${getTotalPrice().toLocaleString()}</p>
              </div>

              <div className="mt-4 space-y-2">
                <button
                  onClick={handleCheckout}
                  className="w-full rounded-2xl bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white py-3 font-bold transition-colors"
                >
                  Proceder al Checkout
                </button>
                <button
                  onClick={clearCart}
                  className="w-full rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-100 py-2.5 font-semibold transition-colors"
                >
                  Vaciar carrito
                </button>
              </div>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
