"use client";

import { useEffect, useState } from 'react';

type OrdersResponse = {
  resumen: { totalOrders: number; totalRevenue: number; averageOrder: number; ordersByStatus: any };
  ordersPerDay: Record<string, { orders: number; revenue: number; statuses?: Record<string, number> }>;
  topBuyers: Array<any>;
};

function formatCurrency(n: number) {
  return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(n);
}

function isoDate(d: Date) {
  return d.toISOString().slice(0, 10);
}

export default function PedidosStatsClient() {
  const [start, setStart] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 29);
    return isoDate(d);
  });
  const [end, setEnd] = useState(() => isoDate(new Date()));
  const [data, setData] = useState<OrdersResponse | null>(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function fetchData(s: string, e: string) {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/pedidos/stats?start=${s}&end=${e}`);
      if (!res.ok) throw new Error(await res.text());
      const json = await res.json();
      setData(json);
      setPage(1);
    } catch (err: any) {
      setError(err?.message || 'Error');
      setData(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchData(start, end);
  }, []);

  return (
    <div className="space-y-6">
      <form
        onSubmit={(ev) => {
          ev.preventDefault();
          fetchData(start, end);
        }}
        className="flex items-end gap-3"
      >
        <div>
          <label className="text-sm text-muted">Desde</label>
          <input className="block mt-1 p-2 rounded bg-transparent border" type="date" value={start} onChange={(e) => setStart(e.target.value)} />
        </div>
        <div>
          <label className="text-sm text-muted">Hasta</label>
          <input className="block mt-1 p-2 rounded bg-transparent border" type="date" value={end} onChange={(e) => setEnd(e.target.value)} />
        </div>
        <div>
          <button className="px-3 py-2 rounded bg-cyan-600 text-white" type="submit">Filtrar</button>
        </div>
      </form>

      {loading && <div className="text-sm text-muted">Cargando...</div>}
      {error && <div className="text-sm text-red-500">{error}</div>}

      {data && (
        <>
          <div className="grid grid-cols-4 gap-4">
            <div className="p-4 rounded-md" style={{ background: 'var(--card)' }}>
              <div className="text-sm" style={{ color: 'var(--muted)' }}>Pedidos</div>
              <div className="text-2xl font-semibold" style={{ color: '#fff' }}>{data.resumen.totalOrders}</div>
            </div>
            <div className="p-4 rounded-md" style={{ background: 'var(--card)' }}>
              <div className="text-sm" style={{ color: 'var(--muted)' }}>Ingresos</div>
              <div className="text-2xl font-semibold" style={{ color: '#fff' }}>{formatCurrency(data.resumen.totalRevenue)}</div>
            </div>
            <div className="p-4 rounded-md" style={{ background: 'var(--card)' }}>
              <div className="text-sm" style={{ color: 'var(--muted)' }}>Ticket Promedio</div>
              <div className="text-2xl font-semibold" style={{ color: '#fff' }}>{formatCurrency(data.resumen.averageOrder)}</div>
            </div>
            <div className="p-4 rounded-md" style={{ background: 'var(--card)' }}>
              <div className="text-sm" style={{ color: 'var(--muted)' }}>Estados</div>
              <div className="mt-2 space-y-1">
                  {(() => {
                    const obs = data.resumen.ordersByStatus;
                    if (!obs) return null;
                    if (Array.isArray(obs)) {
                      return obs.map((s: any) => (
                        <div key={s.status} style={{ color: 'var(--muted)', display: 'flex', justifyContent: 'space-between' }}>
                          <span>{s.status}</span>
                          <span style={{ color: 'var(--accent)' }}>{(s._count && s._count._all) ?? s.count ?? 0}</span>
                        </div>
                      ));
                    }
                    // fallback if ordersByStatus is an object like { CONFIRMADO: 2 }
                    return Object.entries(obs).map(([status, cnt]) => (
                      <div key={status} style={{ color: 'var(--muted)', display: 'flex', justifyContent: 'space-between' }}>
                        <span>{status}</span>
                        <span style={{ color: 'var(--accent)' }}>{(cnt && (cnt._count?._all ?? cnt)) ?? 0}</span>
                      </div>
                    ));
                  })()}
              </div>
            </div>
          </div>

          <section className="p-4 rounded-md" style={{ background: 'var(--card)' }}>
            <h3 className="font-semibold" style={{ color: '#fff' }}>Pedidos por día</h3>
            <div className="mt-3">
              {/* Datatable with pagination (10 rows) */}
              {(() => {
                const entries = Object.entries(data.ordersPerDay).sort((a, b) => b[0].localeCompare(a[0]));
                const pageSize = 10;
                const total = entries.length;
                const totalPages = Math.max(1, Math.ceil(total / pageSize));
                const currentPage = Math.min(Math.max(1, page), totalPages);
                const startIdx = (currentPage - 1) * pageSize;
                const pageEntries = entries.slice(startIdx, startIdx + pageSize);

                return (
                  <>
                    <div className="flex items-center justify-between mb-2">
                      <div style={{ color: 'var(--muted)' }}>{`Mostrando ${Math.min(total, pageSize)} de ${total} días`}</div>
                      <div className="flex items-center gap-2">
                        <button className="px-2 py-1 rounded border" disabled={currentPage <= 1} onClick={() => setPage(currentPage - 1)}>Anterior</button>
                        <div style={{ color: 'var(--muted)' }}>{currentPage} / {totalPages}</div>
                        <button className="px-2 py-1 rounded border" disabled={currentPage >= totalPages} onClick={() => setPage(currentPage + 1)}>Siguiente</button>
                      </div>
                    </div>

                    <div className="overflow-auto">
                      <table className="w-full table-auto">
                        <thead>
                          <tr>
                            <th className="text-left text-xs" style={{ color: 'var(--muted)' }}>Fecha</th>
                            <th className="text-right text-xs" style={{ color: 'var(--muted)' }}>Pedidos</th>
                            <th className="text-right text-xs" style={{ color: 'var(--muted)' }}>Ingresos</th>
                            <th className="text-right text-xs" style={{ color: 'var(--muted)' }}>Estados</th>
                          </tr>
                        </thead>
                        <tbody>
                          {pageEntries.map(([date, v]) => (
                            <tr key={date} style={{ borderTop: '1px solid rgba(255,255,255,0.03)' }}>
                              <td className="px-3 py-2" style={{ color: 'var(--muted)' }}>{date}</td>
                              <td className="px-3 py-2 text-right" style={{ color: 'var(--accent)' }}>{v.orders}</td>
                              <td className="px-3 py-2 text-right" style={{ color: '#fff' }}>{formatCurrency(v.revenue)}</td>
                              <td className="px-3 py-2 text-right" style={{ color: 'var(--muted)' }}>
                                {v.statuses && Object.keys(v.statuses).length > 0 ? Object.entries(v.statuses).map(([s,c]) => `${s}: ${c}`).join(' • ') : '-'}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </>
                );
              })()}
            </div>
          </section>

          <section className="p-4 rounded-md" style={{ background: 'var(--card)' }}>
            <h3 className="font-semibold" style={{ color: '#fff' }}>Top Compradores</h3>
            <div className="mt-3 space-y-2">
              {data.topBuyers.map((t, idx) => (
                <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--muted)' }}>
                  <div>
                    <div style={{ color: '#fff' }}>{t.buyer?.nombre || t.buyer?.id}</div>
                    <div style={{ color: 'var(--muted)', fontSize: 12 }}>{t.buyer?.correo}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ color: 'var(--accent)' }}>{formatCurrency(t.total)}</div>
                    <div style={{ color: 'var(--muted)', fontSize: 12 }}>{t.orders} pedidos</div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </>
      )}
    </div>
  );
}
