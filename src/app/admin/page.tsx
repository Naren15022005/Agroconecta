import { TrendingUp, DollarSign, Users, Package, Activity, Clock } from 'lucide-react';
import Link from 'next/link';
import DashboardCards from './DashboardCards';
import PagosAgricultoresTable from './PagosAgricultoresTable';
import { Suspense } from 'react';

export default function AdminHome() {
  return (
    <div className="space-y-6">
      {/* Banner de bienvenida simplificado */}
      <section className="rounded-lg p-6" 
        style={{ 
          background: '#232a34',
          border: '1px solid rgba(28, 198, 228, 0.2)'
        }}>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center"
                style={{ background: 'var(--accent)' }}>
                <Activity size={20} style={{ color: '#0b1114' }} />
              </div>
              <div>
                <p className="text-xs font-medium" style={{ color: '#94a3b8' }}>Panel de Control</p>
                <h2 className="text-xl font-bold" style={{ color: '#e6faff' }}>Dashboard Administrativo</h2>
              </div>
            </div>
            <p className="text-sm" style={{ color: '#94a3b8' }}>
              Monitorea el rendimiento de tu plataforma en tiempo real
            </p>
          </div>
          
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg" 
            style={{ 
              background: 'rgba(28, 198, 228, 0.1)',
              border: '1px solid rgba(28, 198, 228, 0.2)'
            }}>
            <Clock size={14} style={{ color: 'var(--accent)' }} />
            <span className="text-xs font-medium" style={{ color: 'var(--accent)' }}>
              Actualizado hace 2 min
            </span>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 space-y-6">
          {/* Cards de métricas */}
          <Suspense fallback={<div className="flex items-center justify-center py-8"><div className="animate-spin rounded-full h-8 w-8 border-2 border-t-transparent" style={{ borderColor: 'var(--accent)' }}></div></div>}>
            <DashboardCards />
          </Suspense>

          {/* Tabla de pagos */}
          <PagosAgricultoresTable />
        </div>

        <aside className="lg:col-span-4 space-y-4">
          <div className="p-5 rounded-lg" style={{ background: '#232a34', border: '1px solid rgba(28, 198, 228, 0.15)' }}>
            <h3 className="text-base font-semibold mb-3" style={{ color: '#e6faff' }}>Actividad Reciente</h3>
            <p className="text-xs mb-4" style={{ color: '#94a3b8' }}>Últimas acciones del sistema y alertas rápidas.</p>
            <ul className="space-y-3">
              <li className="flex items-start gap-2 pb-3 border-b border-gray-700">
                <span className="w-1.5 h-1.5 rounded-full mt-1.5" style={{ background: 'var(--accent)' }}></span>
                <div className="flex-1">
                  <div className="text-xs" style={{ color: '#e6faff' }}>Pedido #AGRC_ORD_xxx confirmado</div>
                  <div className="text-xs" style={{ color: '#94a3b8' }}>Hace 3 minutos</div>
                </div>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full mt-1.5" style={{ background: '#f59e0b' }}></span>
                <div className="flex-1">
                  <div className="text-xs" style={{ color: '#e6faff' }}>Pago pendiente de validación</div>
                  <div className="text-xs" style={{ color: '#94a3b8' }}>Hace 12 minutos</div>
                </div>
              </li>
            </ul>
          </div>

          <div className="p-5 rounded-lg" style={{ background: '#232a34', border: '1px solid rgba(28, 198, 228, 0.15)' }}>
            <h3 className="text-base font-semibold mb-3" style={{ color: '#e6faff' }}>Acciones rápidas</h3>
            <div className="flex flex-col gap-2">
              <Link className="px-4 py-2 rounded-lg text-sm font-medium text-center transition-colors hover:bg-opacity-10" style={{ border: '1px solid var(--accent)', color: 'var(--accent)', background: 'transparent' }} href="/admin/billetera">Billetera</Link>
              <Link className="px-4 py-2 rounded-lg text-sm font-medium text-center transition-colors hover:bg-opacity-10" style={{ border: '1px solid var(--accent)', color: 'var(--accent)', background: 'transparent' }} href="/admin/validaciones-pagos">Validaciones</Link>
              <Link className="px-4 py-2 rounded-lg text-sm font-medium text-center transition-colors hover:bg-opacity-10" style={{ border: '1px solid var(--accent)', color: 'var(--accent)', background: 'transparent' }} href="/admin/pagos">Revisar pagos</Link>
            </div>
          </div>

        </aside>
      </div>

      {/* animations moved to global CSS */}
    </div>
  );
}
