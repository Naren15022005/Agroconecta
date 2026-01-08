"use client";

import { ReactNode } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import CartSidebar from '@/components/CartSidebar';
import { ShoppingBag, Package, User, LogOut, Home, ShoppingCart } from 'lucide-react';
import { useCartStore } from '@/store/cart';


export default function CompradorLayout({ children }: { children: ReactNode }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const isMarket = !!pathname && (
    pathname.startsWith('/comprador/mercado') || pathname.startsWith('/comprador/pedidos')
  );
  const cart = useCartStore();

  // Verificar autenticación
  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  if (status === 'unauthenticated') {
    router.push('/auth/signin?callbackUrl=/comprador');
    return null;
  }

  // Verificar que el usuario tenga el rol correcto
  if (session?.user?.role && session.user.role !== 'COMPRADOR' && session.user.role !== 'EMPRESA') {
    // Si el usuario es agricultor, redirigir a su dashboard
    if (session.user.role === 'CAMPESINO') {
      router.push('/agricultor');
      return null;
    }
    // Si es admin, redirigir a admin
    if (session.user.role === 'ADMINISTRADOR') {
      router.push('/admin');
      return null;
    }
    // Para cualquier otro rol, redirigir a inicio
    router.push('/');
    return null;
  }

  const handleLogout = () => {
    router.push('/api/auth/signout');
  };

  return (
    <div className={`min-h-screen bg-neutral-900`}>
      {/* Top Navigation Bar (copiado de NavMenu - header fijo del mercado) */}
      <header className={`fixed top-0 left-0 right-0 z-40 bg-neutral-900 border-b border-neutral-800 shadow-sm`}>
        <div className="flex items-center justify-between h-16 px-4">
          {/* Left: Logo */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center flex-shrink-0">
              <Link href="/comprador" className="flex items-center">
                <span className={`text-xl font-bold text-green-300`}>AgroConecta</span>
              </Link>
            </div>
          </div>

          {/* Center: Navigation (centered) */}
          <div className="flex-1 flex justify-center">
            <div className="hidden md:flex items-center space-x-8">
              <Link
                href="/comprador/mercado"
                className="flex items-center space-x-2 text-neutral-200 transition-colors"
              >
                <ShoppingBag size={18} className="text-neutral-200" />
                <span className="font-medium text-neutral-200">Mercado</span>
              </Link>
              <Link
                href="/comprador/pedidos"
                className="flex items-center space-x-2 text-neutral-200 transition-colors"
              >
                <Package size={18} className="text-neutral-200" />
                <span className="font-medium text-neutral-200">Mis Pedidos</span>
              </Link>
            </div>
          </div>

          {/* Right: Actions (user, logout, cart) */}
          <div className="flex items-center space-x-4 flex-shrink-0">
            <div className="hidden md:flex items-center space-x-3 text-sm">
              <div className={`flex items-center space-x-2 px-3 py-1 rounded-md bg-neutral-800/40`}>
                <User size={16} className={`text-neutral-200`} />
                <span className={`text-neutral-200 font-medium truncate max-w-[12ch]`}>{session?.user?.name || session?.user?.email}</span>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className={`hidden md:flex items-center space-x-1 text-neutral-200 hover:text-red-400 transition-colors px-3 py-1 rounded-md`}
            >
              <LogOut size={18} />
              <span className="hidden md:inline">Salir</span>
            </button>

            {/* Carrito al final (más visible) */}
            <button
              id="cart-sidebar-btn"
              onClick={() => cart.toggleCart()}
              className={`relative p-2 rounded-full transition-colors hover:bg-neutral-800/50`}
              aria-label="Abrir carrito"
            >
              <ShoppingCart size={24} className={`text-white`} />
              {cart.getTotalItems() > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5 font-bold">
                  {cart.getTotalItems()}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Navigation */}
      <div className={`md:hidden bg-neutral-900 border-b border-neutral-800`}>
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-around py-2">
              <Link
                href="/comprador/mercado"
                className="flex flex-col items-center py-2 text-neutral-200"
              >
                <ShoppingBag size={20} className="text-neutral-200" />
                <span className="text-xs mt-1 text-neutral-200">Mercado</span>
              </Link>
            <Link
              href="/comprador/pedidos"
              className="flex flex-col items-center py-2 text-neutral-200"
            >
              <Package size={20} className="text-neutral-200" />
              <span className="text-xs mt-1 text-neutral-200">Pedidos</span>
            </Link>
            <button
              onClick={() => cart.toggleCart()}
              className={`flex flex-col items-center py-2 relative text-neutral-200 hover:text-green-300`}
              aria-label="Abrir carrito"
            >
              <ShoppingCart size={20} className={`text-neutral-200`} />
              {cart.getTotalItems() > 0 && (
                <span className="absolute -top-1 -right-2 bg-red-500 text-white text-[10px] rounded-full px-1 py-0.5 font-bold">
                  {cart.getTotalItems()}
                </span>
              )}
              <span className="text-xs mt-1 text-neutral-200">Carrito</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content (empujado por header fijo) */}
      <main className="pt-16">{children}</main>
      
      {/* Cart Sidebar */}
      <CartSidebar />
    </div>
  );
}
