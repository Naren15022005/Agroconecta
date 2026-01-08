'use client';

import { useEffect, useMemo, useState } from 'react';
import { RefreshCw } from 'lucide-react';

type ResumenItem = {
  id: string;
  agricultorId: string;
  agricultorNombre: string | null;
  agricultorCorreo: string | null;
  totalPagado: number;
  cantidadPedidos: number;
  tipoPago: string;
  metodoPago: string | null;
  comprobanteUrl: string | null;
  fechaPago: string;
};

type ResumenResponse = {
  date: string;
  totalPagado: number;
  cantidadLiquidaciones: number;
  cantidadPedidos: number;
  items: ResumenItem[];
};

function todayLocalISODate() {
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const dd = String(now.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

function formatCurrency(n: number) {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(n);
}

export default function PagosResumenDiario() {
  const [date, setDate] = useState<string>(todayLocalISODate());
  const [data, setData] = useState<ResumenResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadingId, setUploadingId] = useState<string | null>(null);

  const empty = useMemo(() => !loading && !error && data && data.items.length === 0, [data, error, loading]);

  async function fetchResumen(selectedDate: string) {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/pagos/resumen?date=${encodeURIComponent(selectedDate)}`, {
        headers: { 'Cache-Control': 'no-cache' },
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || 'Error al cargar resumen');
      setData(json);
    } catch (e) {
      setData(null);
      setError(e instanceof Error ? e.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  }

  async function handleFileUpload(liquidacionId: string, file: File) {
    setUploadingId(liquidacionId);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const up = await fetch('/api/upload', { method: 'POST', body: fd });
      const uj = await up.json();
      if (!up.ok) throw new Error(uj.error || 'Error subiendo archivo');
      const url = uj.url || uj.publicUrl || uj.fileUrl || null;
      if (!url) throw new Error('No se obtuvo URL del upload');

      const res = await fetch('/api/admin/pagos/resumen/comprobante', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ liquidacionId, comprobanteUrl: url }) });
      const j = await res.json();
      if (!res.ok) throw new Error(j.error || 'Error actualizando comprobante');

      // refetch
      await fetchResumen(date);
    } catch (e) {
      console.error('Error uploading comprobante', e);
      setError(e instanceof Error ? e.message : 'Error subiendo comprobante');
    } finally {
      setUploadingId(null);
    }
  }

  useEffect(() => {
    fetchResumen(date);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold text-white">Resumen de pagos del admin</h2>
          <p className="text-sm" style={{ color: 'var(--muted)' }}>
            Filtra por día para ver liquidaciones realizadas.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
          <label className="text-sm" style={{ color: 'var(--muted)' }}>
            Día
          </label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="px-3 py-2 rounded bg-neutral-800 text-white border border-neutral-700"
          />
          <button
            onClick={() => fetchResumen(date)}
            className="px-3 py-2 rounded bg-cyan-600 text-white flex items-center gap-2"
            disabled={loading}
          >
            <RefreshCw className={loading ? 'animate-spin' : ''} size={18} />
            Actualizar
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-lg p-4 border border-neutral-700" style={{ background: 'rgba(255,255,255,0.02)' }}>
          <div className="text-xs" style={{ color: 'var(--muted)' }}>Total pagado</div>
          <div className="mt-1 text-2xl font-bold text-cyan-400">
            {data ? formatCurrency(data.totalPagado) : loading ? 'Cargando…' : formatCurrency(0)}
          </div>
        </div>
        <div className="rounded-lg p-4 border border-neutral-700" style={{ background: 'rgba(255,255,255,0.02)' }}>
          <div className="text-xs" style={{ color: 'var(--muted)' }}>Liquidaciones</div>
          <div className="mt-1 text-2xl font-bold text-white">
            {data ? data.cantidadLiquidaciones : loading ? '…' : 0}
          </div>
        </div>
        <div className="rounded-lg p-4 border border-neutral-700" style={{ background: 'rgba(255,255,255,0.02)' }}>
          <div className="text-xs" style={{ color: 'var(--muted)' }}>Pedidos incluidos</div>
          <div className="mt-1 text-2xl font-bold text-white">
            {data ? data.cantidadPedidos : loading ? '…' : 0}
          </div>
        </div>
      </div>

      {error && <div className="text-sm text-red-400">{error}</div>}
      {loading && <div className="text-sm" style={{ color: 'var(--muted)' }}>Cargando…</div>}
      {empty && <div className="text-sm" style={{ color: 'var(--muted)' }}>No hay pagos registrados para ese día.</div>}

      {!!data && data.items.length > 0 && (
        <div className="overflow-auto rounded-lg border border-neutral-700" style={{ background: 'rgba(255,255,255,0.02)' }}>
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b border-neutral-700">
                  <th className="p-3 text-left" style={{ color: 'var(--muted)' }}>Liquidación</th>
                  <th className="p-3 text-left" style={{ color: 'var(--muted)' }}>Agricultor</th>
                  <th className="p-3 text-right" style={{ color: 'var(--muted)' }}>Total</th>
                  <th className="p-3 text-right" style={{ color: 'var(--muted)' }}>Pedidos</th>
                  <th className="p-3 text-left" style={{ color: 'var(--muted)' }}>Método</th>
                  <th className="p-3 text-left" style={{ color: 'var(--muted)' }}>Comprobante</th>
                  <th className="p-3 text-left" style={{ color: 'var(--muted)' }}>Hora</th>
              </tr>
            </thead>
            <tbody>
              {data.items.map((it) => (
                <tr key={it.id} className="border-b border-neutral-800 hover:bg-neutral-900/40">
                  <td className="p-3 font-mono text-xs" style={{ color: 'var(--muted)' }}>{it.id}</td>
                  <td className="p-3 text-white">
                    <div className="font-medium">
                      {it.agricultorNombre || it.agricultorId}
                    </div>
                    {it.agricultorCorreo && (
                      <div className="text-xs" style={{ color: 'var(--muted)' }}>{it.agricultorCorreo}</div>
                    )}
                  </td>
                  <td className="p-3 text-right font-semibold text-cyan-300">{formatCurrency(it.totalPagado)}</td>
                  <td className="p-3 text-right text-white">{it.cantidadPedidos}</td>
                  <td className="p-3 text-white">{it.metodoPago || '-'}</td>
                    <td className="p-3 text-sm">
                      {it.comprobanteUrl ? (
                        <a href={it.comprobanteUrl} target="_blank" rel="noopener noreferrer" className="text-cyan-300 hover:underline">Ver</a>
                      ) : (
                        <div className="flex items-center gap-2">
                          <label className="inline-flex items-center px-2 py-1 bg-cyan-600 text-white rounded text-xs cursor-pointer">
                            {uploadingId === it.id ? 'Subiendo…' : 'Subir comprobante'}
                            <input type="file" accept="image/*,application/pdf" className="hidden" onChange={(e) => {
                              const f = e.target.files?.[0];
                              if (!f) return;
                              handleFileUpload(it.id, f);
                            }} />
                          </label>
                        </div>
                      )}
                    </td>
                  <td className="p-3" style={{ color: 'var(--muted)' }}>
                    {new Date(it.fechaPago).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
