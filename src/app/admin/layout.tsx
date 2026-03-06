"use client";
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { ReactNode } from 'react';
import BrandIcon from '@/components/BrandIcon'
import { UserCircle, ShoppingCart, Box, ChartBar, Cog, Users, Tractor, Bolt, Wallet } from 'lucide-react';

const sidebarLinks = [
  { href: '/admin', label: 'Dashboard', icon: ChartBar },
  { href: '/admin/productos', label: 'Productos', icon: Box },
  { href: '/admin/agricultores', label: 'Agricultores', icon: Tractor },
  { href: '/admin/usuarios', label: 'Usuarios', icon: Users },
  { href: '/admin/pedidos', label: 'Pedidos', icon: ShoppingCart },
  { href: '/admin/pagos', label: 'Gestión de Pagos', icon: Bolt },
  { href: '/admin/validaciones-pagos', label: 'Validaciones', icon: Cog },
  { href: '/admin/billetera', label: 'Billetera', icon: Wallet },
];

export default function AdminLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  return (
    <div className="min-h-screen w-full flex relative" style={{ background: 'var(--bg)', color: '#f3f6f4', margin: 0, padding: 0 }}>
      {/* Sidebar fijo */}
      <aside
        className="flex flex-col justify-between h-screen fixed left-0 top-0 z-20 w-56 bg-[#1a1d23] border-r border-[#232a34]"
      >
        <div>
          {/* Header con fondo sutil y borde inferior */}
          <div className="flex items-center gap-3 px-6 py-6" style={{ background: 'var(--bg)' }}>
            <BrandIcon className="w-10 h-10" />
            <span className="text-2xl font-extrabold tracking-wide ml-2" style={{ color: 'var(--accent)', letterSpacing: '0.01em' }}>AgroConecta</span>
          </div>
          <nav className="flex-1 mt-8">
            <ul className="flex flex-col gap-2 px-2">
              {sidebarLinks.map(({ href, label, icon: Icon }) => {
                const isActive = href === '/admin' ? pathname === href : pathname?.startsWith(href);
                return (
                  <li key={href}>
                    <Link
                      href={href}
                      className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors duration-200 sidebar-link ${isActive ? 'sidebar-link-active' : ''}`}
                      style={{
                        color: isActive ? 'var(--accent)' : '#94a3b8',
                        background: isActive ? 'rgba(28, 198, 228, 0.1)' : 'transparent',
                        position: 'relative',
                        textDecoration: 'none',
                      }}
                    >
                      {isActive && (
                        <span className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-1 rounded-r-full bg-[var(--accent)]"></span>
                      )}
                      <span className={`sidebar-icon flex items-center justify-center w-10 h-10 rounded-lg transition-colors duration-200`}
                        style={{
                          background: isActive ? 'var(--accent)' : 'transparent',
                        }}
                      >
                        <Icon size={20} style={{ color: isActive ? '#0b1114' : '#94a3b8' }} />
                      </span>
                      <span className="sidebar-link-label text-sm font-medium">
                        {label}
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
        </div>
        <div className="px-6 pb-8">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-[#232a34] flex items-center justify-center border-2 border-[var(--accent)] shadow-lg avatar-glow" style={{ boxShadow: '0 6px 24px -6px rgba(28,198,228,0.18)' }}>
              <span className="text-xl font-bold" style={{ color: 'var(--accent)' }}>
                N
              </span>
            </div>
            <span className="font-semibold text-[var(--accent)] text-base">Administrador</span>
          </div>
        </div>
      </aside>
      {/* Contenido principal */}
      <main className="p-6 min-h-screen ml-56 w-full" style={{ marginLeft: '14rem', background: 'var(--bg)', color: '#f3f6f4' }}>
        {children}
        <div style={{ margin: '2rem 0' }}></div>
      </main>
      <style jsx global>{`
        .sidebar-link:hover {
          background: rgba(28, 198, 228, 0.03);
        }
        .sidebar-link:hover .sidebar-link-label {
          color: var(--accent) !important;
        }
        .sidebar-link:hover .sidebar-icon {
          background: rgba(28, 198, 228, 0.08) !important;
        }
      `}</style>
    </div>
  );
}
