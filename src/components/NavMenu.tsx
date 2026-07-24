"use client";
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Store, 
  Package, 
  Plus, 
  ShoppingBag, 
  BarChart3, 
  User,
  Menu,
  X,
  LogOut,
  Wallet,
  ShoppingCart
} from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { signOut, useSession } from 'next-auth/react';
import BrandIcon from './BrandIcon';
import { useCartStore } from '@/store/cart';
import CartSidebar from './CartSidebar';

const menu = [
  { href: '/agricultor/mercado', label: 'Mercado', icon: Store },
  { href: '/agricultor/mis-productos', label: 'Mis productos', icon: Package },
  { href: '/agricultor/publicar', label: 'Publicar', icon: Plus },
  { href: '/agricultor/billetera', label: 'miAgrobilletera', icon: Wallet },
  { href: '/agricultor/pedidos', label: 'Pedidos', icon: ShoppingBag },
  { href: '/agricultor/estadisticas', label: 'Estadísticas', icon: BarChart3 },
  { href: '/agricultor/perfil', label: 'Perfil', icon: User },
];

export default function NavMenu({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const { data: session } = useSession();
  const [pedidosNuevos, setPedidosNuevos] = useState(0);

  const cart = useCartStore();
  const totalItems = useCartStore(state => state.getTotalItems());

  // Cerrar sidebar al presionar la tecla ESC
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    const fetchPedidosNuevos = async () => {
      try {
        const res = await fetch('/api/agricultor/pedidos');
        if (res.ok) {
          const data = await res.json();
          const pendientes = (data.pedidos || []).filter(
            (p: any) => p.status === 'PENDIENTE' || p.status === 'POR_ACEPTAR'
          );
          setPedidosNuevos(pendientes.length);
        }
      } catch (err) {
        console.error('Error obteniendo pedidos nuevos:', err);
      }
    };

    fetchPedidosNuevos();
    const interval = setInterval(fetchPedidosNuevos, 15000);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = () => {
    signOut({ callbackUrl: '/auth/signin' });
  };

  return (
    <div className="relative min-h-screen bg-neutral-950 text-white">
      {/* Topbar fijo */}
      <header className={`fixed top-0 left-0 right-0 z-40 bg-neutral-900 border-b border-neutral-800 shadow-sm transform transition-transform duration-300 ${isOpen ? 'md:translate-x-64 lg:translate-x-72' : ''}`}>
        <div className="flex items-center justify-between h-16 px-4">
          {/* Toggle sidebar + Logo */}
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 hover:bg-neutral-800 rounded-lg transition-colors cursor-pointer text-white"
              aria-label="Abrir menú"
            >
              <Menu className="w-6 h-6 text-white" />
            </button>
            
            <Link href="/" className="flex items-center gap-3 group text-white hover:text-white no-underline">
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
          </div>

          {/* Información del usuario + Carrito de compras en esquina derecha */}
          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-2 text-neutral-100 bg-neutral-800/60 hover:bg-neutral-800 px-3.5 py-1.5 rounded-full transition-all">
              <User className="w-4 h-4 text-lime-400" />
              <span className="hidden sm:block font-medium text-xs text-white">{session?.user?.name || 'Usuario'}</span>
            </div>

            {/* Botón Carrito de Compras en Esquina Derecha sin borde */}
            <button
              id="cart-sidebar-btn"
              onClick={() => cart.toggleCart()}
              className="relative p-2 rounded-full transition-all bg-neutral-800/60 hover:bg-neutral-800 cursor-pointer text-white"
              aria-label="Abrir carrito"
            >
              <ShoppingCart size={20} className="text-white" />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-lime-500 text-neutral-950 text-[11px] rounded-full w-5 h-5 flex items-center justify-center font-bold shadow-md shadow-lime-950/40">
                  {totalItems}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Overlay/Backdrop oscuro para cerrar el sidebar al hacer click o tap fuera */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-45 bg-black/60 backdrop-blur-xs transition-opacity"
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar de Navegación del Agricultor */}
      <nav className={`
        fixed top-0 left-0 z-50
        w-64 md:w-72 bg-neutral-900 border-r border-neutral-800 shadow-2xl
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        flex flex-col
        h-screen
      `}>
        {/* Header del sidebar */}
        <div className="p-4 border-b border-neutral-800 flex items-center justify-between">
          <h2 className="text-lg font-bold text-white">Navegación</h2>
          <button
            onClick={() => setIsOpen(false)}
            className="p-1 hover:bg-neutral-800 rounded-lg transition-colors cursor-pointer text-white"
            aria-label="Cerrar menú"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Links del sidebar con tipografía blanca garantizada */}
        <div className="flex-1 p-4 space-y-2 overflow-y-auto">
          {menu.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            const esPedidos = item.href === '/agricultor/pedidos';

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className={`
                  flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 group no-underline
                  ${isActive 
                    ? 'bg-neutral-800 text-white font-semibold shadow-lg shadow-black/30 border border-neutral-700' 
                    : 'text-white hover:bg-neutral-800/80 hover:text-white'
                  }
                `}
              >
                <div className="flex items-center space-x-3">
                  <Icon className={`w-5 h-5 transition-colors ${
                    isActive ? 'text-lime-400' : 'text-neutral-300 group-hover:text-white'
                  }`} />
                  <span className="text-white font-medium text-sm group-hover:text-white">{item.label}</span>
                </div>

                {esPedidos && pedidosNuevos > 0 && (
                  <span className="bg-lime-500 text-neutral-950 font-bold text-xs px-2 py-0.5 rounded-full animate-pulse">
                    {pedidosNuevos}
                  </span>
                )}
              </Link>
            );
          })}
        </div>

        {/* Footer del sidebar con botón de logout */}
        <div className="p-4 border-t border-neutral-800 bg-neutral-900/90">
          <button
            onClick={handleLogout}
            className="w-full flex items-center space-x-3 px-4 py-3 text-red-400 hover:bg-red-500/10 hover:text-red-300 rounded-xl transition-all duration-200 group cursor-pointer"
          >
            <LogOut className="w-5 h-5 text-red-400" />
            <span className="font-medium text-sm text-red-400 group-hover:text-red-300">Cerrar Sesión</span>
          </button>
        </div>
      </nav>

      {/* Contenido principal que se desplaza */}
      <div className={`
        transition-all duration-300 ease-in-out pt-16
        ${isOpen ? 'md:ml-64 lg:ml-72' : 'ml-0'}
      `}>
        {children}
      </div>

      {/* Drawer lateral de Carrito de Compras */}
      <CartSidebar />
    </div>
  );
}
