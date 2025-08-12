import { UserCircle, ShoppingCart, Box, ChartBar, Cog, Users, Move, FileText, Star, Tractor, Bolt, Wallet } from 'lucide-react';
import DashboardCards from './DashboardCards';
import PagosAgricultoresTable from './PagosAgricultoresTable';
import { Suspense } from 'react';

// Server action para obtener datos reales
async function getAdminDashboardData() {
  const res = await fetch(process.env.NEXT_PUBLIC_API_URL + '/api/admin/dashboard', { cache: 'no-store' });
  if (!res.ok) return null;
  return res.json();
}
export default function AdminHome() {
  return (
    <div className="flex min-h-screen" style={{ background: 'var(--bg)', color: '#fff' }}>
      {/* Sidebar fijo */}
      <aside className="w-64 flex flex-col py-8 px-4 fixed h-screen left-0 top-0 z-20 shadow-xl" style={{ background: 'var(--card)', color: '#fff' }}>
        <div className="flex items-center gap-3 mb-10 px-2">
          <Tractor size={32} style={{ color: 'var(--accent-2)' }} />
          <span className="text-xl font-bold tracking-wide" style={{ color: 'var(--accent)' }}>AgroConecta</span>
        </div>
        <nav className="flex-1">
          <ul className="space-y-2">
            <li>
              <a href="/admin" className="flex items-center gap-3 px-3 py-2 rounded-lg font-semibold" style={{ color: '#fff' }}>
                <ChartBar size={20} style={{ color: 'var(--accent-2)' }} />
                Dashboard
              </a>
            </li>
            <li>
              <a href="/admin/productos" className="flex items-center gap-3 px-3 py-2 rounded-lg" style={{ color: '#fff' }}>
                <Box size={20} style={{ color: 'var(--accent-2)' }} />
                Productos
              </a>
            </li>
            <li>
              <a href="/admin/agricultores" className="flex items-center gap-3 px-3 py-2 rounded-lg" style={{ color: '#fff' }}>
                <Tractor size={20} style={{ color: 'var(--accent-2)' }} />
                Agricultores
              </a>
            </li>
            <li>
              <a href="/admin/usuarios" className="flex items-center gap-3 px-3 py-2 rounded-lg" style={{ color: '#fff' }}>
                <Users size={20} style={{ color: 'var(--accent-2)' }} />
                Usuarios
              </a>
            </li>
            <li>
              <a href="/admin/pedidos" className="flex items-center gap-3 px-3 py-2 rounded-lg" style={{ color: '#fff' }}>
                <ShoppingCart size={20} style={{ color: 'var(--accent-2)' }} />
                Pedidos
              </a>
            </li>
            <li>
              <a href="/admin/pagos" className="flex items-center gap-3 px-3 py-2 rounded-lg" style={{ color: '#fff' }}>
                <Bolt size={20} style={{ color: 'var(--accent-2)' }} />
                Pagos
              </a>
            </li>
            <li>
              <a href="/admin/billetera" className="flex items-center gap-3 px-3 py-2 rounded-lg" style={{ color: '#fff' }}>
                <Wallet size={20} style={{ color: 'var(--accent-2)' }} />
                Billetera
              </a>
            </li>
          </ul>
        </nav>
        <div className="mt-auto px-2">
          <div className="flex items-center gap-2">
            <UserCircle size={24} style={{ color: 'var(--accent-2)' }} />
            <span className="font-semibold" style={{ color: 'var(--muted)' }}>Administrador</span>
          </div>
        </div>
      </aside>
      {/* Contenido principal */}
      <main className="flex-1 p-6">
        {/* Banner de bienvenida */}
        <section className="rounded-xl p-8 mb-8 flex flex-col md:flex-row justify-between items-center shadow" style={{ background: 'var(--card)', color: '#fff' }}>
          <div>
            <h2 className="text-3xl font-bold mb-2" style={{ color: 'var(--accent)' }}>Bienvenido al Panel de Administración</h2>
            <p className="text-lg" style={{ color: 'var(--muted)' }}>Gestiona tu plataforma agropecuaria desde un solo lugar</p>
          </div>
        </section>
        {/* Cards de resumen con datos reales */}
        <Suspense fallback={<div>Cargando resumen...</div>}>
          {/* @ts-expect-error Server Component */}
          <DashboardCards />
        </Suspense>
        {/* Tabla de pagos a agricultores con datos reales */}
        <section className="rounded-xl mb-8" style={{ background: 'var(--card)', boxShadow: '0 2px 8px var(--glass-2)' }}>
          <Suspense fallback={<div style={{ color: 'var(--muted)', padding: '2rem' }}>Cargando pagos...</div>}>
            {/* @ts-expect-error Server Component */}
            <PagosAgricultoresTable />
          </Suspense>
        </section>
        {/* Accesos rápidos */}
        <section className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="quick-card p-6 flex flex-col items-center cursor-pointer">
            <Box size={32} style={{ color: 'var(--purple-fluor)' }} className="mb-2" />
            <span className="font-semibold" style={{ color: 'var(--purple-fluor)' }}>Gestionar Productos</span>
            <span style={{ color: 'var(--muted)' }} className="text-sm">Agregar o editar productos</span>
          </div>
          <div className="quick-card p-6 flex flex-col items-center cursor-pointer">
            <Users size={32} style={{ color: 'var(--purple-fluor)' }} className="mb-2" />
            <span className="font-semibold" style={{ color: 'var(--purple-fluor)' }}>Administrar Usuarios</span>
            <span style={{ color: 'var(--muted)' }} className="text-sm">Clientes y agricultores</span>
          </div>
          <div className="quick-card p-6 flex flex-col items-center cursor-pointer">
            <Tractor size={32} style={{ color: 'var(--purple-fluor)' }} className="mb-2" />
            <span className="font-semibold" style={{ color: 'var(--purple-fluor)' }}>Agricultores</span>
            <span style={{ color: 'var(--muted)' }} className="text-sm">Ver y gestionar agricultores</span>
          </div>
          <div className="quick-card p-6 flex flex-col items-center cursor-pointer">
            <Cog size={32} style={{ color: 'var(--purple-fluor)' }} className="mb-2" />
            <span className="font-semibold" style={{ color: 'var(--purple-fluor)' }}>Configuración</span>
            <span style={{ color: 'var(--muted)' }} className="text-sm">Ajustes de la plataforma</span>
          </div>
        </section>
      </main>
    </div>
  );
}
