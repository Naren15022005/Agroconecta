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
  LogOut
} from 'lucide-react';
import { useState } from 'react';
import { signOut, useSession } from 'next-auth/react';

const menu = [
  { href: '/agricultor/mercado', label: 'Mercado', icon: Store },
  { href: '/agricultor/mis-productos', label: 'Mis productos', icon: Package },
  { href: '/agricultor/publicar', label: 'Publicar', icon: Plus },
  { href: '/agricultor/pedidos', label: 'Pedidos', icon: ShoppingBag },
  { href: '/agricultor/estadisticas', label: 'Estadísticas', icon: BarChart3 },
  { href: '/agricultor/perfil', label: 'Perfil', icon: User },
];

export default function NavMenu({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const { data: session } = useSession();

  const handleLogout = () => {
    signOut({ callbackUrl: '/auth/signin' });
  };

  return (
    <div className="relative">
      {/* Topbar fijo */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 shadow-sm">
        <div className="flex items-center justify-between h-16 px-4">
          {/* Toggle sidebar + Logo */}
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Menu className="w-6 h-6 text-gray-700" />
            </button>
            
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-green-600 to-green-700 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">A</span>
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900">AgroConecta</h1>
              </div>
            </div>
          </div>

          {/* Información del usuario en topbar */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 text-gray-700">
              <User className="w-5 h-5" />
              <span className="hidden sm:block font-medium">{session?.user?.name || 'Usuario'}</span>
            </div>
          </div>
        </div>
      </header>

      {/* Sidebar */}
      <nav className={`
        fixed top-16 left-0 z-40
        w-80 bg-white border-r border-gray-200 shadow-xl
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        flex flex-col
        h-[calc(100vh-4rem)]
      `}>
        {/* Header del sidebar */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-gray-900">Navegación</h2>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        </div>

        {/* Información del usuario */}
        <div className="px-4 py-3 bg-gradient-to-r from-green-50 to-orange-50 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-green-600 to-green-700 rounded-full flex items-center justify-center">
              <User className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {session?.user?.name || 'Usuario'}
              </p>
              <p className="text-xs text-gray-500 truncate">
                {session?.user?.email || 'email@ejemplo.com'}
              </p>
            </div>
          </div>
        </div>

        {/* Menú de navegación */}
        <div className="flex-1 py-4 overflow-y-auto">
          <ul className="space-y-2 px-4">
            {menu.map(({ href, label, icon: Icon }) => {
              const isActive = pathname === href;
              return (
                <li key={href}>
                  <Link
                    href={href}
                    onClick={() => setIsOpen(false)}
                    className={`
                      flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200
                      ${isActive 
                        ? 'bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg' 
                        : 'text-gray-700 hover:bg-gray-100 hover:text-green-600'
                      }
                      group
                    `}
                  >
                    <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-gray-500 group-hover:text-green-600'}`} />
                    <span className="font-medium">{label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>

        {/* Footer del sidebar con botón de logout */}
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <button
            onClick={handleLogout}
            className="w-full flex items-center space-x-3 px-4 py-3 text-red-600 hover:bg-red-50 hover:text-red-700 rounded-xl transition-all duration-200 group"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Cerrar Sesión</span>
          </button>
        </div>
      </nav>

      {/* Contenido principal que se desplaza */}
      <div className={`
        transition-all duration-300 ease-in-out pt-16
        ${isOpen ? 'ml-80' : 'ml-0'}
      `}>
        {children}
      </div>
    </div>
  );
}
