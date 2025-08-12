"use client";
import { ReactNode } from 'react';
// ...existing imports...
import { UserCircle, ShoppingCart, Box, ChartBar, Cog, Users, Tractor, Bolt, Wallet, Menu } from 'lucide-react';

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen relative" style={{ background: "var(--bg)", color: "#fff" }}>
      <style jsx global>{`
        body, .min-h-screen {
          background: var(--bg) !important;
          color: #fff !important;
        }
        aside {
          background: var(--card) !important;
          color: #fff !important;
          box-shadow: 2px 0 8px rgba(0,0,0,0.08);
        }
        .font-bold, .font-semibold, .text-xl, .ml-2 {
          color: #fff !important;
        }
        .sidebar-link .ml-2 {
          color: #fff !important;
        }
        .sidebar-link .sidebar-icon {
          color: var(--purple-fluor) !important;
        }
        .sidebar-link:hover {
          background: var(--glass-2) !important;
        }
        .gap-3 svg {
          color: var(--purple-fluor) !important;
        }
        .ml-64, .p-6 {
          background: var(--bg) !important;
          color: #fff !important;
        }
        .rounded-lg, .shadow, .panel, .card {
          background: var(--card) !important;
          color: #fff !important;
          border-radius: var(--radius);
        }
        .panel .subtitle, .card .subtitle, .panel .description, .card .description {
          color: var(--muted) !important;
        }
        .text-success {
          color: var(--success) !important;
        }
        .text-danger {
          color: var(--danger) !important;
        }
        .active {
          background: linear-gradient(90deg, var(--accent), var(--purple-fluor));
          color: #fff !important;
        }
      `}</style>
      {/* Sidebar fijo */}
      <aside
        className="flex flex-col py-8 px-2 h-screen fixed left-0 top-0 z-20 shadow-xl w-64"
        style={{ background: "var(--card)", color: "var(--muted)", boxShadow: "2px 0 8px rgba(0,0,0,0.08)" }}
      >
        <div className="flex items-center gap-3 mb-10 px-2">
          <Tractor size={32} className="sidebar-icon" />
          <span className="text-xl font-bold tracking-wide ml-2" style={{ color: "var(--accent)" }}>AgroConecta</span>
        </div>
        <nav className="flex-1">
          <ul className="space-y-2">
            <li>
              <a href="/admin" className="sidebar-link flex items-center px-3 py-2 rounded-lg font-semibold gap-3">
                <ChartBar size={20} className="sidebar-icon" />
                <span className="ml-2" style={{ color: "var(--accent)" }}>Dashboard</span>
              </a>
            </li>
            <li>
              <a href="/admin/productos" className="sidebar-link flex items-center px-3 py-2 rounded-lg gap-3">
                <Box size={20} className="sidebar-icon" />
                <span className="ml-2" style={{ color: "var(--accent)" }}>Productos</span>
              </a>
            </li>
            <li>
              <a href="/admin/agricultores" className="sidebar-link flex items-center px-3 py-2 rounded-lg gap-3">
                <Tractor size={20} className="sidebar-icon" />
                <span className="ml-2" style={{ color: "var(--accent)" }}>Agricultores</span>
              </a>
            </li>
            <li>
              <a href="/admin/usuarios" className="sidebar-link flex items-center px-3 py-2 rounded-lg gap-3">
                <Users size={20} className="sidebar-icon" />
                <span className="ml-2" style={{ color: "var(--accent)" }}>Usuarios</span>
              </a>
            </li>
            <li>
              <a href="/admin/pedidos" className="sidebar-link flex items-center px-3 py-2 rounded-lg gap-3">
                <ShoppingCart size={20} className="sidebar-icon" />
                <span className="ml-2" style={{ color: "var(--purple-fluor)" }}>Pedidos</span>
              </a>
            </li>
            <li>
              <a href="/admin/pagos" className="sidebar-link flex items-center px-3 py-2 rounded-lg gap-3">
                <Bolt size={20} className="sidebar-icon" />
                <span className="ml-2" style={{ color: "var(--purple-fluor)" }}>Pagos</span>
              </a>
            </li>
            <li>
              <a href="/admin/billetera" className="sidebar-link flex items-center px-3 py-2 rounded-lg gap-3">
                <Wallet size={20} className="sidebar-icon" />
                <span className="ml-2" style={{ color: "var(--accent)" }}>Billetera</span>
              </a>
            </li>
          </ul>
        </nav>
        <div className="mt-auto px-2">
          <div className="flex items-center gap-2">
            <UserCircle size={24} className="sidebar-icon" />
            <span className="font-semibold ml-2" style={{ color: "var(--muted)" }}>Administrador</span>
          </div>
        </div>
      </aside>
      {/* Contenido principal */}
      <main className="p-6 min-h-screen ml-64" style={{ marginLeft: '16rem' }}>
        <div className="min-h-screen" style={{ background: "var(--bg)", color: "#fff" }}>
          {children}
          <div style={{ margin: "2rem 0" }}>
            {/* ColorPaletteTable removed */}
          </div>
        </div>
      </main>
    </div>
  );
}
