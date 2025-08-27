"use client";
import { usePathname } from 'next/navigation';
import { ReactNode } from 'react';
import { UserCircle, ShoppingCart, Box, ChartBar, Cog, Users, Tractor, Bolt, Wallet } from 'lucide-react';

const sidebarLinks = [
  { href: '/admin', label: 'Dashboard', icon: ChartBar },
  { href: '/admin/productos', label: 'Productos', icon: Box },
  { href: '/admin/agricultores', label: 'Agricultores', icon: Tractor },
  { href: '/admin/usuarios', label: 'Usuarios', icon: Users },
  { href: '/admin/pedidos', label: 'Pedidos', icon: ShoppingCart },
  { href: '/admin/pagos', label: 'Pagos', icon: Bolt },
  { href: '/admin/validaciones-pagos', label: 'Validaciones de pagos', icon: Cog },
  { href: '/admin/billetera', label: 'Billetera', icon: Wallet },
];

export default function AdminLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  return (
    <div className="min-h-screen w-full flex relative" style={{ background: 'var(--bg)', color: '#f3f6f4', margin: 0, padding: 0 }}>
      {/* Sidebar fijo */}
      <aside
        className="flex flex-col justify-between h-screen fixed left-0 top-0 z-20 shadow-2xl w-64 bg-[#1a1d23] border-r border-[#232a34]"
        style={{ boxShadow: '4px 0 24px 0 #0008' }}
      >
        <div>
          {/* Header con fondo sutil y borde inferior */}
          <div className="flex items-center gap-3 px-6 pt-8 pb-7 border-b border-[#232a34] bg-[#20242b]/80" style={{ boxShadow: '0 2px 8px 0 #0004' }}>
            <Tractor size={36} style={{ color: 'var(--accent)' }} />
            <span className="text-2xl font-extrabold tracking-wide ml-2" style={{ color: 'var(--accent)', letterSpacing: '0.01em' }}>AgroConecta</span>
          </div>
          <nav className="flex-1 mt-8">
            <ul className="flex flex-col gap-2 px-2">
              {sidebarLinks.map(({ href, label, icon: Icon }) => {
                const isActive = pathname === href;
                return (
                  <li key={href}>
                    <a
                      href={href}
                      className={`flex items-center gap-4 px-4 py-3 rounded-xl font-semibold transition-all duration-150 group sidebar-link ${isActive ? 'sidebar-link-active' : ''}`}
                      style={{
                        color: isActive ? 'var(--accent-2)' : 'var(--accent)',
                        background: isActive ? '#232a34ee' : 'none',
                        boxShadow: isActive ? '0 2px 12px 0 #00e6ff22' : 'none',
                        letterSpacing: '0.01em',
                        fontSize: '1.15rem',
                        position: 'relative',
                        fontFamily: 'Inter, Segoe UI, Arial, sans-serif',
                        fontWeight: isActive ? 700 : 500,
                        textDecoration: 'none',
                        alignItems: 'center',
                        minHeight: '3.2rem',
                      }}
                    >
                      <span className={`flex items-center justify-center w-10 h-10 rounded-full transition-all duration-150 sidebar-icon-bg ${isActive ? 'sidebar-icon-active' : ''}`}
                        style={{
                          background: isActive ? 'var(--accent-2)' : 'transparent',
                          boxShadow: isActive ? '0 2px 8px 0 #00e6ff33' : 'none',
                        }}
                      >
                        <Icon size={26} style={{ color: isActive ? '#10141a' : 'var(--accent)', transition: 'color 0.2s' }} />
                      </span>
                      <span className="sidebar-link-label transition-colors duration-150" style={{ textDecoration: 'none', fontWeight: 500, fontSize: '1.08rem' }}>
                        {label}
                      </span>
                      {isActive && (
                        <span className="absolute left-0 top-2 h-7 w-1 rounded-r bg-[var(--accent-2)] opacity-90 transition-all duration-150"></span>
                      )}
                    </a>
                  </li>
                );
              })}
            </ul>
          </nav>
        </div>
        <div className="px-6 pb-8">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-full bg-[#232a34] flex items-center justify-center border-2 border-[var(--accent)] shadow-lg" style={{ boxShadow: '0 2px 12px 0 #00e6ff44' }}>
              <span className="text-xl font-bold" style={{ color: 'var(--accent)' }}>
                N
              </span>
            </div>
            <span className="font-semibold text-[var(--accent)] text-base">Administrador</span>
          </div>
        </div>
      </aside>
      {/* Contenido principal */}
      <main className="p-6 min-h-screen ml-64 w-full" style={{ marginLeft: '16rem', background: 'var(--bg)', color: '#f3f6f4' }}>
        {children}
        <div style={{ margin: '2rem 0' }}></div>
      </main>
      <style jsx global>{`
        .sidebar-link, .sidebar-link:visited, .sidebar-link:active, .sidebar-link:focus {
          text-decoration: none !important;
          box-shadow: none;
        }
        .sidebar-link-label {
          text-decoration: none !important;
        }
        .sidebar-link:hover {
          background: #232a34ee;
          color: var(--accent-2);
          text-decoration: none !important;
          box-shadow: 0 4px 16px 0 #232a34cc !important;
        }
        .sidebar-link:hover .sidebar-link-label {
          color: var(--accent-2);
          text-decoration: none !important;
        }
        .sidebar-link:hover .sidebar-icon-bg {
          background: #232a34;
          box-shadow: 0 2px 8px 0 #232a34cc;
        }
        .sidebar-link:hover svg {
          color: var(--accent-2) !important;
        }
        .sidebar-link-active {
          font-weight: 700;
        }
        .sidebar-icon-bg {
          background: transparent;
        }
        .sidebar-icon-active {
          background: var(--accent-2) !important;
        }
      `}</style>
    </div>
  );
}
