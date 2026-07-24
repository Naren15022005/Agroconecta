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
  Wallet
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { signOut, useSession } from 'next-auth/react';
import BrandIcon from './BrandIcon';

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
  const [mounted, setMounted] = useState(false);
  const [perfil, setPerfil] = useState<any | null>(null);

  useEffect(() => { setMounted(true); }, []);

  // Hook para actualizar el contador de pedidos nuevos cada 10s
  useEffect(() => {
    if (!session?.user?.id) return;
    if (session?.user?.role !== 'CAMPESINO') return; // solo los agricultores consultan pedidos
    const fetchPedidos = async () => {
      try {
        // Obtener directamente los pedidos del agricultor en estado PENDIENTE
        const res = await fetch(`/api/agricultor/pedidos`);
        if (!res.ok) {
          setPedidosNuevos(0);
          return;
        }
        const pedidos = await res.json();
        
        // Filtrar solo pedidos en estado PENDIENTE (que necesitan ser aceptados)
        const pedidosPendientes = pedidos.filter((pedido: any) => 
          pedido.estado && pedido.estado.toLowerCase() === 'pendiente'
        );
        
        setPedidosNuevos(pedidosPendientes.length);
      } catch (error) {
        console.log('Error al obtener pedidos:', error);
        setPedidosNuevos(0);
      }
    };
    
    fetchPedidos();
    const interval = setInterval(fetchPedidos, 10000);
    return () => clearInterval(interval);
  }, [session?.user?.id]);

  useEffect(() => {
    if (!session?.user?.id) return;
    if (session?.user?.role !== 'CAMPESINO') return; // solo cargar perfil si es agricultor
    let mountedFlag = true;
    const fetchPerfil = async () => {
      try {
        const res = await fetch('/api/agricultor/perfil');
        if (!res.ok) return;
        const json = await res.json();
        if (!mountedFlag) return;
        setPerfil(json?.agricultor ?? null);
      } catch (error) {
        console.log('Error al cargar perfil:', error);
      }
    };
    fetchPerfil();
    return () => { mountedFlag = false; };
  }, [session?.user?.id]);

  const handleLogout = () => {
    signOut({ callbackUrl: '/auth/signin' });
  };

  return (
    <div className="relative">
      {/* Topbar fijo */}
      <header className={`fixed top-0 left-0 right-0 z-40 bg-neutral-900 border-b border-neutral-800 shadow-sm transform transition-transform duration-300 ${isOpen ? 'md:translate-x-64 lg:translate-x-72' : ''}`}>
        <div className="flex items-center justify-between h-16 px-4">
          {/* Toggle sidebar + Logo */}
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 hover:bg-neutral-800 rounded-lg transition-colors"
            >
              <Menu className="w-6 h-6 text-neutral-100" />
            </button>
            
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
          </div>

          {/* Información del usuario en topbar */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 text-neutral-100">
              <User className="w-5 h-5 text-neutral-100" />
              <span className="hidden sm:block font-medium text-white">{session?.user?.name || 'Usuario'}</span>
            </div>
          </div>
        </div>
      </header>

      {/* Sidebar */}
      <nav className={`
        fixed top-0 left-0 z-50
        w-64 md:w-72 bg-neutral-800 border-r border-neutral-700 shadow-2xl
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        flex flex-col
        h-screen
      `}>
        {/* Header del sidebar */}
        <div className="p-4 border-b border-neutral-700">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-neutral-100">Navegación</h2>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 hover:bg-neutral-700 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-neutral-200" />
            </button>
          </div>
        </div>

        {/* Información del usuario */}
        <div className="px-4 py-3 bg-neutral-900/5 border-b border-neutral-700">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full overflow-hidden bg-neutral-900/10 border border-neutral-700 flex items-center justify-center">
              <div className="w-full h-full relative">
                <img
                  src={perfil?.foto ?? 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw=='}
                  alt="Avatar"
                  className="w-full h-full object-cover"
                />
                <div className={`absolute inset-0 flex items-center justify-center transition-opacity duration-200 ${perfil?.foto ? 'opacity-0' : 'opacity-100'}`}>
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-r from-green-600 to-green-700">
                    <User className="w-5 h-5 text-white" />
                  </div>
                </div>
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-neutral-100 truncate">
                {perfil?.user?.nombre || session?.user?.name || 'Usuario'}
              </p>
              <p className="text-xs text-neutral-400 truncate">
                {perfil?.user?.correo || session?.user?.email || 'email@ejemplo.com'}
              </p>
            </div>
          </div>
        </div>

        {/* Menú de navegación */}
        <div className="flex-1 py-4 overflow-y-auto">
          <ul className="space-y-2 px-4">
            {menu.map(({ href, label, icon: Icon }) => {
              const isActive = pathname === href;
              const isPedidos = href === '/agricultor/pedidos';
              return (
                <li key={href}>
                  <Link
                    href={href}
                    onClick={() => setIsOpen(false)}
                    className={`
                        flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200
                        ${isActive 
                          ? 'bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg' 
                          : 'text-neutral-200 hover:bg-neutral-700 hover:text-green-400'
                        }
                        group relative
                      `}
                  >
                      <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-neutral-300 group-hover:text-green-400'}`} />
                      <span className={`font-medium ${isActive ? 'text-white' : 'text-neutral-200'}`}>{label}</span>
                    {isPedidos && pedidosNuevos > 0 && mounted && (
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg border border-white animate-bounce">
                        {pedidosNuevos}
                      </span>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>

          {/* Footer del sidebar con botón de logout */}
          <div className="p-4 border-t border-neutral-700 bg-neutral-800/80">
            <button
              onClick={handleLogout}
              className="w-full flex items-center space-x-3 px-4 py-3 text-red-400 hover:bg-red-700/10 hover:text-red-300 rounded-xl transition-all duration-200 group"
            >
              <LogOut className="w-5 h-5 text-red-400" />
              <span className="font-medium">Cerrar Sesión</span>
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
    </div>
  );
}
