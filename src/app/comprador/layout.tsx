"use client";

import { ReactNode, useEffect } from 'react';
import { signOut } from 'next-auth/react';
import { useSession } from 'next-auth/react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import CartSidebar from '@/components/CartSidebar';
import { ShoppingBag, Package, User, LogOut, Home, ShoppingCart, Heart } from 'lucide-react';
import { useCartStore } from '@/store/cart';


export default function CompradorLayout({ children }: { children: ReactNode }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const isMarket = !!pathname && (
    pathname.startsWith('/comprador/mercado') || pathname.startsWith('/comprador/pedidos')
  );
  const cart = useCartStore();
  const totalItems = useCartStore(state => state.getTotalItems());

  // Redirects must run inside effects to avoid updating other components during render
  useEffect(() => {
    if (status === 'unauthenticated' && !isMarket) {
      router.push('/auth/signin?callbackUrl=/comprador');
    }
  }, [status, router]);

  useEffect(() => {
    if (status === 'authenticated' && session?.user?.role && !isMarket) {
      const role = session.user.role;
      if (role !== 'COMPRADOR' && role !== 'EMPRESA') {
        if (role === 'CAMPESINO') {
          router.push('/agricultor');
        } else if (role === 'ADMINISTRADOR') {
          router.push('/admin');
        } else {
          router.push('/');
        }
      }
    }
  }, [status, session, router]);

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
  if (status === 'unauthenticated' && !isMarket) {
    // Effect will redirect; avoid rendering while redirecting
    return null;
  }

  // If the user is authenticated but has an unexpected role, block render only when not viewing the public market
  if (session?.user?.role && status === 'authenticated') {
    const role = session.user.role;
    if (role !== 'COMPRADOR' && role !== 'EMPRESA' && !isMarket) {
      return null;
    }
  }

  const handleLogout = () => {
    // Use NextAuth signOut helper to clear session and redirect to home
    signOut({ callbackUrl: '/' });
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

          {/* Spacer to keep header layout */}
          <div className="flex-1" />

          {/* Right: Navigation + Actions (user, logout, cart) */}
          <div className="flex items-center space-x-4 flex-shrink-0">
            {status === 'authenticated' ? (
              <div className="hidden md:flex items-center space-x-6">
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
                <Link
                  href="/comprador/favoritos"
                  className="flex items-center space-x-2 text-neutral-200 transition-colors hover:text-red-400"
                >
                  <Heart size={18} className="text-red-400" />
                  <span className="font-medium text-neutral-200">Favoritos</span>
                </Link>
              </div>
            ) : null}

            {status === 'authenticated' && session?.user ? (
              <>
                <div className="hidden md:flex items-center space-x-3 text-sm">
                  <div className={`flex items-center space-x-2 px-3 py-1 rounded-md bg-neutral-800/40`}>
                    <User size={16} className={`text-neutral-200`} />
                    <span className={`text-neutral-200 font-medium truncate max-w-[12ch]`}>{session.user.name || session.user.email}</span>
                  </div>
                </div>

                <button
                  onClick={handleLogout}
                  className={`hidden md:flex items-center space-x-1 text-neutral-200 hover:text-red-400 transition-colors px-3 py-1 rounded-md`}
                >
                  <LogOut size={18} />
                  <span className="hidden md:inline">Salir</span>
                </button>
              </>
            ) : null}

            {/* Carrito al final (más visible) */}
            <button
              id="cart-sidebar-btn"
              onClick={() => cart.toggleCart()}
              className={`relative p-2 rounded-full transition-colors hover:bg-neutral-800/50 ${totalItems > 0 ? 'animate-cart' : ''}`}
              aria-label="Abrir carrito"
            >
              <ShoppingCart size={24} className={`text-white`} />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5 font-bold">
                  {totalItems}
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
            {status === 'authenticated' ? (
              <>
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
                  <Link
                    href="/comprador/favoritos"
                    className="flex flex-col items-center py-2 text-neutral-200 hover:text-red-400"
                  >
                    <Heart size={20} className="text-red-400" />
                    <span className="text-xs mt-1 text-neutral-200">Favoritos</span>
                  </Link>
              </>
            ) : null}
            <button
              onClick={() => cart.toggleCart()}
              className={`flex flex-col items-center py-2 relative text-neutral-200 hover:text-green-300 ${totalItems > 0 ? 'animate-cart' : ''}`}
              aria-label="Abrir carrito"
            >
              <ShoppingCart size={20} className={`text-neutral-200`} />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-2 bg-red-500 text-white text-[10px] rounded-full px-1 py-0.5 font-bold">
                  {totalItems}
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
