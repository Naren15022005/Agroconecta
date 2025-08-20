import { Move, ChartBar, Tractor, ShoppingCart, Wallet, FileText, Bolt } from 'lucide-react';

export default async function DashboardCards() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  let r;
  let errorDetails = '';
  
  try {
    console.log('DashboardCards: Fetching from', `${baseUrl}/api/admin/dashboard`);
    const res = await fetch(`${baseUrl}/api/admin/dashboard`, { cache: 'no-store' });
    console.log('DashboardCards: Response status:', res.status);
    
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}: ${res.statusText}`);
    }
    
    const data = await res.json();
    console.log('DashboardCards: Data received:', data);
    r = data?.resumen;
  } catch (err) {
    console.error('DashboardCards: Error fetching data:', err);
    errorDetails = err instanceof Error ? err.message : 'Error desconocido';
    r = undefined;
  }
  
  if (!r) {
    return (
      <div className="bg-white rounded-lg shadow p-6 mb-8 text-center text-red-600">
        <p>Error al cargar datos del dashboard. Verifica la conexión o intenta más tarde.</p>
        {errorDetails && <p className="text-sm mt-2">Detalles: {errorDetails}</p>}
      </div>
    );
  }
  return (
    <section className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="rounded-lg shadow p-6 flex flex-col items-start card-gradient" style={{ background: 'var(--card)', color: '#1b3a2b' }}>
            <span style={{ color: 'var(--muted)' }} className="mb-2">Total Recaudado</span>
            <span style={{ color: 'var(--accent)' }} className="text-2xl font-bold mb-2">{r.totalRecaudado?.toLocaleString('es-CO', { style: 'currency', currency: 'COP' }) ?? '-'}</span>
            <Move size={32} style={{ color: 'var(--success)' }} />
      </div>
          <div className="rounded-lg shadow p-6 flex flex-col items-start card-gradient" style={{ background: 'var(--card)', color: '#1b3a2b' }}>
            <span style={{ color: 'var(--muted)' }} className="mb-2">Ganancia AgroConecta</span>
            <span style={{ color: 'var(--accent)' }} className="text-2xl font-bold mb-2">{r.ganancia?.toLocaleString('es-CO', { style: 'currency', currency: 'COP' }) ?? '-'}</span>
            <ChartBar size={32} style={{ color: 'var(--success)' }} />
      </div>
          <div className="rounded-lg shadow p-6 flex flex-col items-start card-gradient" style={{ background: 'var(--card)', color: '#1b3a2b' }}>
            <span style={{ color: 'var(--muted)' }} className="mb-2">A Pagar a Agricultores</span>
            <span style={{ color: 'var(--accent)' }} className="text-2xl font-bold mb-2">{r.aPagar?.toLocaleString('es-CO', { style: 'currency', currency: 'COP' }) ?? '-'}</span>
            <Tractor size={32} style={{ color: 'var(--success)' }} />
      </div>
          <div className="rounded-lg shadow p-6 flex flex-col items-start card-gradient" style={{ background: 'var(--card)', color: '#1b3a2b' }}>
            <span style={{ color: 'var(--muted)' }} className="mb-2">Pedidos Realizados</span>
            <span style={{ color: 'var(--accent)' }} className="text-2xl font-bold mb-2">{r.pedidos ?? '-'}</span>
            <ShoppingCart size={32} style={{ color: 'var(--success)' }} />
      </div>
          <div className="rounded-lg shadow p-6 flex flex-col items-start card-gradient" style={{ background: 'var(--card)', color: '#1b3a2b' }}>
            <span style={{ color: 'var(--muted)' }} className="mb-2">Saldo Total Billeteras</span>
            <span style={{ color: 'var(--accent)' }} className="text-2xl font-bold mb-2">{r.totalWallets?.toLocaleString('es-CO', { style: 'currency', currency: 'COP' }) ?? '-'}</span>
            <Wallet size={32} style={{ color: 'var(--success)' }} />
      </div>
          <div className="rounded-lg shadow p-6 flex flex-col items-start card-gradient" style={{ background: 'var(--card)', color: '#1b3a2b' }}>
            <span style={{ color: 'var(--muted)' }} className="mb-2">Ventas Realizadas</span>
            <span style={{ color: 'var(--accent)' }} className="text-2xl font-bold mb-2">{r.ventasCount ?? '-'}</span>
            <FileText size={32} style={{ color: 'var(--success)' }} />
      </div>
          <div className="rounded-lg shadow p-6 flex flex-col items-start card-gradient" style={{ background: 'var(--card)', color: '#1b3a2b' }}>
            <span style={{ color: 'var(--muted)' }} className="mb-2">Comisiones Totales</span>
            <span style={{ color: 'var(--accent)' }} className="text-2xl font-bold mb-2">{r.comisionesTotal?.toLocaleString('es-CO', { style: 'currency', currency: 'COP' }) ?? '-'}</span>
            <Bolt size={32} style={{ color: 'var(--success)' }} />
      </div>
          <div className="rounded-lg shadow p-6 flex flex-col items-start card-gradient" style={{ background: 'var(--card)', color: '#1b3a2b' }}>
            <span style={{ color: 'var(--muted)' }} className="mb-2">Impuestos Totales</span>
            <span style={{ color: 'var(--accent)' }} className="text-2xl font-bold mb-2">{r.impuestosTotal?.toLocaleString('es-CO', { style: 'currency', currency: 'COP' }) ?? '-'}</span>
            <ChartBar size={32} style={{ color: 'var(--success)' }} />
      </div>
    </section>
  );
}
