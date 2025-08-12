import { Users } from 'lucide-react';

export default async function PagosAgricultoresTable() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  let pagos;
  let errorDetails = '';
  
  try {
    console.log('PagosAgricultoresTable: Fetching from', `${baseUrl}/api/admin/dashboard`);
    const res = await fetch(`${baseUrl}/api/admin/dashboard`, { cache: 'no-store' });
    console.log('PagosAgricultoresTable: Response status:', res.status);
    
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}: ${res.statusText}`);
    }
    
    const data = await res.json();
    console.log('PagosAgricultoresTable: Data received:', data);
    pagos = data?.pagos;
  } catch (err) {
    console.error('PagosAgricultoresTable: Error fetching data:', err);
    errorDetails = err instanceof Error ? err.message : 'Error desconocido';
    pagos = undefined;
  }
  
  if (!Array.isArray(pagos)) {
    return (
      <div className="rounded-lg shadow p-6 mb-8 text-center" style={{ background: 'var(--card)', color: 'var(--danger)' }}>
        <p>Error al cargar pagos a agricultores. Verifica la conexión o intenta más tarde.</p>
        {errorDetails && <p className="text-sm mt-2" style={{ color: 'var(--muted)' }}>Detalles: {errorDetails}</p>}
      </div>
    );
  }
  return (
  <section className="rounded-lg p-6 mb-8" style={{ background: 'var(--card)', color: '#fff', boxShadow: 'none' }}>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold flex items-center gap-2" style={{ color: 'var(--purple-fluor)' }}><Users size={24} style={{ color: 'var(--purple-fluor)' }} /> Pagos a Agricultores</h3>
        <span className="font-semibold cursor-pointer hover:underline" style={{ color: 'var(--purple-fluor)' }}>Ver todos</span>
      </div>
      <table className="w-full text-sm">
        <thead>
          <tr style={{ background: 'var(--card)' }}>
            <th className="p-3 text-left th-hover-morado" style={{ color: 'var(--muted)', transition: 'color 0.2s' }}>ID</th>
            <th className="p-3 text-left th-hover-morado" style={{ color: 'var(--muted)', transition: 'color 0.2s' }}>Agricultor</th>
            <th className="p-3 text-right th-hover-morado" style={{ color: 'var(--muted)', transition: 'color 0.2s' }}>Ventas Totales</th>
            <th className="p-3 text-right th-hover-morado" style={{ color: 'var(--muted)', transition: 'color 0.2s' }}>Comisión</th>
            <th className="p-3 text-right th-hover-morado" style={{ color: 'var(--muted)', transition: 'color 0.2s' }}>A Pagar</th>
            <th className="p-3 text-center th-hover-morado" style={{ color: 'var(--muted)', transition: 'color 0.2s' }}>Estado</th>
            <th className="p-3 text-center th-hover-morado" style={{ color: 'var(--muted)', transition: 'color 0.2s' }}>Acción</th>
          </tr>
        </thead>
        <tbody>
          {pagos.map((p: any) => (
            <tr key={p.id} style={{ borderBottom: '1px solid var(--glass-2)' }}>
              <td className="p-3 text-left font-mono text-xs" style={{ color: 'var(--muted)' }}>{p.id}</td>
              <td className="p-3 text-left font-medium" style={{ color: '#fff' }}>{p.agricultor}</td>
              <td className="p-3 text-right font-semibold" style={{ color: 'var(--accent)' }}>{p.ventas?.toLocaleString('es-CO', { style: 'currency', currency: 'COP' }) ?? '-'}</td>
              <td className="p-3 text-right" style={{ color: 'var(--muted)' }}>{p.comision?.toLocaleString('es-CO', { style: 'currency', currency: 'COP' }) ?? '-'}</td>
              <td className="p-3 text-right font-semibold" style={{ color: 'var(--success)' }}>{p.aPagar?.toLocaleString('es-CO', { style: 'currency', currency: 'COP' }) ?? '-'}</td>
              <td className="p-3 text-center">
                {p.estado === 'pendiente' ? (
                  <span className="px-2 py-1 rounded-full text-xs" style={{ background: 'var(--danger)', color: '#fff' }}>Pendiente</span>
                ) : p.estado === 'sin_ventas' ? (
                  <span className="px-2 py-1 rounded-full text-xs" style={{ background: 'var(--glass)', color: 'var(--muted)' }}>Sin Ventas</span>
                ) : (
                  <span className="px-2 py-1 rounded-full text-xs" style={{ background: 'var(--success)', color: '#fff' }}>Pagado</span>
                )}
              </td>
              <td className="p-3 text-center">
                {p.estado === 'pendiente' ? (
                  <button className="px-3 py-1 rounded text-xs" style={{ background: 'var(--danger)', color: '#fff' }}>Pagar</button>
                ) : (
                  <button className="px-3 py-1 rounded text-xs" style={{ background: 'var(--glass)', color: 'var(--muted)' }}>Ver</button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
