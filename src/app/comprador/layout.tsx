"use client";

import { ReactNode } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import CartSidebar from '@/components/CartSidebar';
import { ShoppingBag, Package, User, LogOut, Home } from 'lucide-react';

export default function CompradorLayout({ children }: { children: ReactNode }) {
  const { data: session, status } = useSession();
  const router = useRouter();

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

  const handleLogout = () => {
    router.push('/api/auth/signout');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation Bar */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center">
              <Link href="/comprador" className="flex items-center space-x-2">
                <span className="text-2xl">🌾</span>
                <span className="text-xl font-bold text-green-600">AgroConecta</span>
              </Link>
            </div>

            {/* Navigation Links */}
            <div className="hidden md:flex items-center space-x-8">
              <Link 
                href="/comprador" 
                className="flex items-center space-x-1 text-gray-700 hover:text-green-600 transition-colors"
              >
                <Home size={18} />
                <span>Inicio</span>
              </Link>
              <Link 
                href="/comprador/mercado" 
                className="flex items-center space-x-1 text-gray-700 hover:text-green-600 transition-colors"
              >
                <ShoppingBag size={18} />
                <span>Mercado</span>
              </Link>
              <Link 
                href="/comprador/pedidos" 
                className="flex items-center space-x-1 text-gray-700 hover:text-green-600 transition-colors"
              >
                <Package size={18} />
                <span>Mis Pedidos</span>
              </Link>
            </div>

            {/* User Menu */}
            <div className="flex items-center space-x-4">
              <div className="hidden md:flex items-center space-x-2 text-sm">
                <User size={16} className="text-gray-400" />
                <span className="text-gray-700">
                  {session?.user?.name || session?.user?.email}
                </span>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-1 text-gray-700 hover:text-red-600 transition-colors"
              >
                <LogOut size={18} />
                <span className="hidden md:inline">Salir</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Navigation */}
      <div className="md:hidden bg-white border-b">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-around py-2">
            <Link 
              href="/comprador" 
              className="flex flex-col items-center py-2 text-gray-700 hover:text-green-600"
            >
              <Home size={20} />
              <span className="text-xs mt-1">Inicio</span>
            </Link>
            <Link 
              href="/comprador/mercado" 
              className="flex flex-col items-center py-2 text-gray-700 hover:text-green-600"
            >
              <ShoppingBag size={20} />
              <span className="text-xs mt-1">Mercado</span>
            </Link>
            <Link 
              href="/comprador/pedidos" 
              className="flex flex-col items-center py-2 text-gray-700 hover:text-green-600"
            >
              <Package size={20} />
              <span className="text-xs mt-1">Pedidos</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main>{children}</main>
      
      {/* Cart Sidebar */}
      <CartSidebar />
    </div>
  );
}
