"use client";

import { useCartStore } from '@/store/cart';
import { X, Plus, Minus, Trash2, ShoppingBag, Store, ShieldAlert, CheckCircle2, ArrowRight, Sprout } from 'lucide-react';
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
    if (!session) {
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
      {/* Modal de confirmación y error */}
      {modal.open && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-2xl bg-neutral-900 border border-neutral-800 p-6 text-center text-white shadow-2xl">
            <div className="inline-flex items-center justify-center p-3 rounded-full bg-neutral-800 mb-3">
              {modal.success ? (
                <CheckCircle2 className="w-8 h-8 text-lime-400" />
              ) : (
                <X className="w-8 h-8 text-red-400" />
              )}
            </div>
            <h2 className="text-xl font-bold mb-2">
              {modal.success ? '¡Pedido realizado!' : 'Ocurrió un error'}
            </h2>
            <p className="text-neutral-300 text-sm mb-6">{modal.message}</p>
            <button
              className="w-full bg-neutral-800 hover:bg-neutral-700 text-white py-3 rounded-xl font-semibold transition-colors border border-neutral-700"
              onClick={() => setModal({ open: false })}
            >
              Cerrar
            </button>
          </div>
        </div>
      )}

      {/* Modal para solicitar autenticación antes del checkout */}
      {requireAuthModal && (
        <div className="fixed inset-0 z-[130] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-2xl bg-neutral-900 border border-neutral-800 p-6 text-center text-white shadow-2xl">
            <div className="inline-flex items-center justify-center p-3 rounded-full bg-lime-500/10 border border-lime-500/20 mb-4">
              <ShieldAlert className="w-8 h-8 text-lime-400" />
            </div>
            <h2 className="text-xl font-bold mb-2">Inicia sesión para continuar</h2>
            <p className="text-neutral-300 text-sm mb-6">
              Para completar tu pedido directo con los campesinos debes tener una cuenta activa. Guardaremos tus productos.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center mb-4">
              <button
                onClick={() => {
                  setRequireAuthModal(false);
                  router.push('/auth/signin?callbackUrl=/comprador/checkout');
                }}
                className="w-full py-2.5 px-4 rounded-xl bg-neutral-800 hover:bg-neutral-750 border border-neutral-700 text-neutral-200 font-semibold text-sm transition-colors"
              >
                Iniciar sesión
              </button>
              <button
                onClick={() => {
                  setRequireAuthModal(false);
                  router.push('/auth/registro?callbackUrl=/comprador/checkout');
                }}
                className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-lime-600 to-lime-500 hover:from-lime-500 hover:to-lime-600 text-white font-bold text-sm shadow-lg shadow-lime-900/40 transition-all"
              >
                Registrarme
              </button>
            </div>
            <button
              onClick={() => setRequireAuthModal(false)}
              className="text-xs text-neutral-400 hover:text-neutral-200 transition-colors pt-2"
            >
              Volver al carrito
            </button>
          </div>
        </div>
      )}

      {/* Overlay */}
      <div
        className={`fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0'}`}
        onClick={toggleCart}
        aria-hidden
      />

      {/* Panel Lateral */}
      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Carrito de compras"
        className={`fixed right-0 top-0 z-50 h-dvh w-screen sm:w-96 max-w-md transform bg-neutral-900 border-l border-neutral-800 shadow-2xl transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
      >
        <div className="h-full flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-800 bg-neutral-900/90 backdrop-blur-md">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-lime-500/10 border border-lime-500/20 p-2.5 text-lime-400">
                <ShoppingBag size={20} />
              </div>
              <div>
                <h2 className="text-base font-bold text-white">Carrito de compras</h2>
                <p className="text-xs text-neutral-400">{getTotalItems()} producto(s)</p>
              </div>
            </div>
            <button
              onClick={toggleCart}
              className="p-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white transition-colors"
              aria-label="Cerrar carrito"
            >
              <X size={18} />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-12 px-4">
                <div className="bg-neutral-800/80 border border-neutral-700/60 p-6 rounded-3xl mb-4 text-lime-400">
                  <ShoppingBag size={48} />
                </div>
                <h3 className="text-lg font-bold text-white">Tu carrito está vacío</h3>
                <p className="text-xs text-neutral-400 mt-2 max-w-xs leading-relaxed">
                  Explora los productos frescos publicados directamente por los campesinos.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {Object.entries(itemsByVendor).map(([campesinoId, vendor]) => (
                  <div key={campesinoId} className="rounded-2xl border border-neutral-800 bg-neutral-850 overflow-hidden shadow-md">
                    {/* Header del Vendedor */}
                    <div className="px-4 py-3 border-b border-neutral-800 bg-neutral-800/60 flex items-center justify-between">
                      <div className="flex items-center gap-2 min-w-0">
                        <Store size={16} className="text-lime-400 flex-shrink-0" />
                        <p className="font-semibold text-xs text-neutral-200 truncate">{vendor.campesinoName}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-bold text-lime-400">
                          ${vendor.items.reduce((sum, item) => sum + item.price * item.quantity, 0).toLocaleString()}
                        </p>
                      </div>
                    </div>

                    {/* Productos */}
                    <div className="p-3 space-y-3">
                      {vendor.items.map((item) => {
                        const hasImage = item.imageUrl && (item.imageUrl.startsWith('http') || item.imageUrl.startsWith('/'));
                        return (
                          <div key={`${item.id}-${item.purchaseUnit ?? ''}`} className="rounded-xl bg-neutral-800 p-3 border border-neutral-700/80 space-y-3">
                            <div className="flex items-center gap-3">
                              {/* Imagen o Fallback */}
                              <div className="w-14 h-14 rounded-xl bg-neutral-850 overflow-hidden border border-neutral-700/60 flex-shrink-0 flex items-center justify-center">
                                {hasImage ? (
                                  <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                                ) : (
                                  <Sprout className="w-6 h-6 text-lime-400" />
                                )}
                              </div>

                              {/* Info */}
                              <div className="min-w-0 flex-1">
                                <p className="font-bold text-sm text-white truncate capitalize">{item.name}</p>
                                <p className="text-xs text-lime-400 font-bold mt-0.5">
                                  ${item.price.toLocaleString()} <span className="text-[10px] text-neutral-400 font-medium">/{item.unit}</span>
                                </p>
                              </div>

                              {/* Eliminar */}
                              <button
                                onClick={() => removeItem(item.id)}
                                className="p-2 rounded-lg hover:bg-red-500/10 text-neutral-400 hover:text-red-400 transition-colors"
                                aria-label="Eliminar producto"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>

                            {/* Controles de Cantidad */}
                            <div className="flex items-center justify-between pt-2 border-t border-neutral-700/50">
                              <div className="inline-flex items-center bg-neutral-900 rounded-lg border border-neutral-700">
                                <button
                                  onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                                  className="p-1.5 hover:bg-neutral-800 text-neutral-300 hover:text-white rounded-l-lg transition-colors"
                                  aria-label="Disminuir cantidad"
                                >
                                  <Minus size={14} />
                                </button>
                                <span className="px-3 text-xs font-bold text-white min-w-[2rem] text-center">
                                  {item.quantity}
                                </span>
                                <button
                                  onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                                  disabled={item.quantity >= item.stock}
                                  className="p-1.5 hover:bg-neutral-800 text-neutral-300 hover:text-white rounded-r-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                                  aria-label="Aumentar cantidad"
                                >
                                  <Plus size={14} />
                                </button>
                              </div>

                              <div className="text-right">
                                <p className="text-xs font-extrabold text-white">
                                  ${(item.price * item.quantity).toLocaleString()}
                                </p>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {items.length > 0 && (
            <div className="p-4 border-t border-neutral-800 bg-neutral-900/95 space-y-3">
              <div className="rounded-xl border border-neutral-800 bg-neutral-800/60 p-3.5 flex items-center justify-between">
                <div>
                  <p className="text-xs text-neutral-400 font-medium">Total de la compra</p>
                  <p className="text-[11px] text-neutral-500">{getTotalItems()} producto(s)</p>
                </div>
                <p className="text-xl font-extrabold text-lime-400">${getTotalPrice().toLocaleString()}</p>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={clearCart}
                  className="px-3 py-3 rounded-xl border border-neutral-700 bg-neutral-800 hover:bg-neutral-750 text-neutral-300 text-xs font-semibold transition-colors"
                >
                  Vaciar
                </button>
                <button
                  onClick={handleCheckout}
                  className="flex-1 rounded-xl bg-gradient-to-r from-lime-600 to-lime-500 hover:from-lime-500 hover:to-lime-600 text-white py-3 px-4 text-sm font-bold shadow-lg shadow-lime-900/40 transition-all flex items-center justify-center gap-2"
                >
                  <span>Proceder al Checkout</span>
                  <ArrowRight size={16} />
                </button>
              </div>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
