"use client";

import { ReactNode, useEffect } from 'react';
import { signOut, useSession } from 'next-auth/react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import CartSidebar from '@/components/CartSidebar';
import BrandIcon from '@/components/BrandIcon';
import MobileMenu from '@/components/MobileMenu';
import { ShoppingBag, Package, User, LogOut, ShoppingCart, Heart } from 'lucide-react';
import { useCartStore } from '@/store/cart';

export default function CompradorLayout({ children }: { children: ReactNode }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const isMarket = !!pathname && (
    pathname.startsWith('/comprador/mercado') ||
    pathname.startsWith('/comprador/pedidos') ||
    pathname === '/comprador'
  );
  const cart = useCartStore();
  const totalItems = useCartStore(state => state.getTotalItems());

  useEffect(() => {
    if (status === 'unauthenticated' && !isMarket) {
      router.push('/auth/signin?callbackUrl=/comprador');
    }
  }, [status, router, isMarket]);

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
  }, [status, session, router, isMarket]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-neutral-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-lime-500 mx-auto"></div>
          <p className="mt-4 text-neutral-300">Cargando...</p>
        </div>
      </div>
    );
  }

  if (status === 'unauthenticated' && !isMarket) {
    return null;
  }

  if (session?.user?.role && status === 'authenticated') {
    const role = session.user.role;
    if (role !== 'COMPRADOR' && role !== 'EMPRESA' && !isMarket) {
      return null;
    }
  }

  const handleLogout = () => {
    signOut({ callbackUrl: '/' });
  };

  const isAuthenticated = status === 'authenticated';

  return (
    <div className="min-h-screen bg-neutral-900">
      {/* Top Header Navigation */}
      <header className="fixed top-0 left-0 right-0 z-40 bg-neutral-900/90 backdrop-blur-md border-b border-neutral-800 shadow-sm">
        <div className="w-full max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-10">
          <div className="flex items-center justify-between h-16">

            {/* Left: Logo (estilo idéntico a Home) */}
            <Link href="/" className="flex items-center gap-3 group">
              <div className="relative">
                <div className="absolute inset-0 bg-lime-500/20 blur-xl rounded-full group-hover:bg-lime-500/30 transition-all"></div>
                <BrandIcon className="relative h-9 w-9" />
              </div>
              <div>
                <div className="text-lg font-bold bg-gradient-to-r from-lime-500 to-lime-600 bg-clip-text text-transparent">
                  AgroConecta
                </div>
                <div className="text-xs text-neutral-400">Marketplace Agrícola</div>
              </div>
            </Link>

            {/* Right Navigation & Actions */}
            <div className="flex items-center space-x-3 sm:space-x-4">
              {isAuthenticated ? (
                /* Header para Usuario Autenticado en Desktop */
                <div className="hidden md:flex items-center space-x-6">
                  <Link
                    href="/comprador/mercado"
                    className="flex items-center space-x-2 text-neutral-200 hover:text-white transition-colors"
                  >
                    <ShoppingBag size={18} className="text-neutral-200" />
                    <span className="font-medium">Mercado</span>
                  </Link>
                  <Link
                    href="/comprador/pedidos"
                    className="flex items-center space-x-2 text-neutral-200 hover:text-white transition-colors"
                  >
                    <Package size={18} className="text-neutral-200" />
                    <span className="font-medium">Mis Pedidos</span>
                  </Link>
                  <Link
                    href="/comprador/favoritos"
                    className="flex items-center space-x-2 text-neutral-200 hover:text-red-400 transition-colors"
                  >
                    <Heart size={18} className="text-red-400" />
                    <span className="font-medium">Favoritos</span>
                  </Link>
                </div>
              ) : (
                /* Header Desktop para visitantes sin sesión */
                <nav className="hidden md:flex items-center gap-6">
                  <Link href="/auth/signin" className="text-sm font-medium text-neutral-200 hover:text-white transition-colors">
                    Iniciar sesión
                  </Link>
                  <Link 
                    href="/auth/registro" 
                    className="px-4 py-2 bg-gradient-to-r from-lime-600 to-lime-500 rounded-lg text-sm font-semibold text-white hover:from-lime-500 hover:to-lime-600 transition-all shadow-lg shadow-lime-900/50"
                  >
                    Registrarse
                  </Link>
                </nav>
              )}

              {/* Usuario logueado & Salir */}
              {isAuthenticated && session?.user && (
                <div className="hidden md:flex items-center space-x-3 text-sm">
                  <div className="flex items-center space-x-2 px-3 py-1.5 rounded-md bg-neutral-800/60 border border-neutral-700">
                    <User size={16} className="text-neutral-300" />
                    <span className="text-neutral-200 font-medium truncate max-w-[14ch]">{session.user.name || session.user.email}</span>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="flex items-center space-x-1 text-neutral-300 hover:text-red-400 transition-colors px-3 py-1.5 rounded-md border border-neutral-700/60 hover:border-red-900/50"
                  >
                    <LogOut size={16} />
                    <span>Salir</span>
                  </button>
                </div>
              )}

              {/* Botón Carrito de Compras */}
              <button
                id="cart-sidebar-btn"
                onClick={() => cart.toggleCart()}
                className={`relative p-2 rounded-full transition-colors hover:bg-neutral-800/80 ${totalItems > 0 ? 'animate-cart' : ''}`}
                aria-label="Abrir carrito"
              >
                <ShoppingCart size={22} className="text-white" />
                {totalItems > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5 font-bold">
                    {totalItems}
                  </span>
                )}
              </button>

              {/* Menú Hamburguesa Móvil en el Header */}
              {!isAuthenticated && (
                <div className="md:hidden">
                  <MobileMenu showMarketLink={false} />
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Sub-Header for Authenticated Users */}
      {isAuthenticated && (
        <div className="md:hidden fixed top-16 left-0 right-0 z-30 bg-neutral-900/95 backdrop-blur-md border-b border-neutral-800 px-4 py-2">
          <div className="flex justify-around items-center">
            <Link href="/comprador/mercado" className="flex flex-col items-center text-neutral-200">
              <ShoppingBag size={18} />
              <span className="text-[11px] mt-0.5">Mercado</span>
            </Link>
            <Link href="/comprador/pedidos" className="flex flex-col items-center text-neutral-200">
              <Package size={18} />
              <span className="text-[11px] mt-0.5">Pedidos</span>
            </Link>
            <Link href="/comprador/favoritos" className="flex flex-col items-center text-neutral-200 hover:text-red-400">
              <Heart size={18} className="text-red-400" />
              <span className="text-[11px] mt-0.5">Favoritos</span>
            </Link>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="pt-16">{children}</main>
      
      {/* Cart Sidebar */}
      <CartSidebar />
    </div>
  );
}
