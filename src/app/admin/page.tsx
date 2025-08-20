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
    <>
      {/* Banner de bienvenida */}
      <section className="rounded-xl p-8 mb-8 flex flex-col md:flex-row justify-between items-center shadow" style={{ background: 'var(--card)', color: 'var(--accent)', boxShadow: '0 2px 16px #232a3433' }}>
        <div>
          <h2 className="text-3xl font-bold mb-2" style={{ color: 'var(--accent)' }}>Bienvenido al Panel de Administración</h2>
          <p className="text-lg" style={{ color: 'var(--muted)' }}>Gestiona tu plataforma agropecuaria desde un solo lugar</p>
        </div>
      </section>
      <Suspense fallback={<div>Cargando tarjetas...</div>}>
        <DashboardCards />
      </Suspense>
      <section className="rounded-xl p-8 mt-8 shadow" style={{ background: 'var(--card)', color: 'var(--accent)', boxShadow: '0 2px 16px #232a3433' }}>
        <h3 className="text-2xl font-bold mb-4" style={{ color: 'var(--accent)' }}>Pagos recientes a agricultores</h3>
        <PagosAgricultoresTable />
      </section>
    </>
  );
}
