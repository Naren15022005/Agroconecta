import React, { useEffect, useRef } from 'react';
import { useCartStore } from '@/store/cart';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface MiniCartProps {
  open: boolean;
  onClose: () => void;
}

const MiniCart: React.FC<MiniCartProps> = ({ open, onClose }) => {
  const { items, getTotalPrice, getItemsByVendor } = useCartStore();
  const ref = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Cerrar al hacer clic fuera
  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onClose();
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open, onClose]);

  // Cerrar automáticamente después de 3 segundos
  useEffect(() => {
    if (!open) return;
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [open, onClose]);

  if (!open) return null;

  const itemsByVendor = getItemsByVendor();

  return (
    <div
      ref={ref}
      className="fixed top-16 right-8 w-88 bg-white border border-gray-200 rounded-2xl shadow-2xl z-[1000] animate-fade-in"
      style={{ minWidth: 340, fontFamily: 'Inter, sans-serif' }}
    >
      {/* Flecha decorativa */}
      <div className="absolute -top-2 right-12 w-8 h-8 flex items-center justify-center z-10">
        <div className="w-4 h-4 bg-white border-l border-t border-gray-200 shadow-md rotate-45"></div>
      </div>
      <div className="p-5 pt-3">
        <h3 className="font-bold text-lg text-green-700 mb-3 tracking-tight">Carrito de compras</h3>
        {items.length === 0 ? (
          <div className="text-gray-400 text-center py-8 text-base">Tu carrito está vacío</div>
        ) : (
          <div className="space-y-4 max-h-56 overflow-y-auto pr-1">
            {Object.entries(itemsByVendor).map(([campesinoId, vendor]) => (
              <div key={campesinoId}>
                <div className="text-green-600 font-semibold text-xs mb-1 uppercase tracking-wide">{vendor.campesinoName}</div>
                {vendor.items.map(item => (
                  <div key={item.id} className="flex items-center justify-between text-sm py-1.5">
                    <span className="truncate max-w-[140px] font-medium text-gray-800">{item.name} <span className="text-gray-400">x{item.quantity}</span></span>
                    <span className="font-semibold text-green-700">${((item.price || 0) * (item.quantity || 0)).toLocaleString('es-CO')}</span>
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}
        <div className="border-t mt-4 pt-4 flex justify-between items-center">
          <span className="font-semibold text-gray-700">Total:</span>
          <span className="text-green-700 font-bold text-xl">${(getTotalPrice() || 0).toLocaleString('es-CO')}</span>
        </div>
        <div className="mt-5 flex gap-2">
          <Link href="/comprador/mercado" className="flex-1 bg-gray-100 text-gray-700 py-2 rounded-lg text-center font-medium hover:bg-gray-200 transition border border-gray-200">Seguir comprando</Link>
          <button
            className="flex-1 bg-green-600 text-white py-2 rounded-lg font-semibold hover:bg-green-700 transition shadow-sm"
            onClick={() => { onClose(); router.push('/comprador/carrito'); }}
          >
            Ir al carrito
          </button>
        </div>
      </div>
    </div>
  );
};

export default MiniCart;
