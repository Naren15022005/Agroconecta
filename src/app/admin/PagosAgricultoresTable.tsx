"use client";
import React, { useState } from 'react';
import { Users } from 'lucide-react';

export default function PagosAgricultoresTable() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  const [pagos, setPagos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorDetails, setErrorDetails] = useState('');
  const [modal, setModal] = useState<{type: 'pagar'|'ver'|null, data: any, feedback?: string, loading?: boolean}>({type: null, data: null});

  async function fetchPagos() {
    setLoading(true);
    setErrorDetails('');
    try {
      const res = await fetch(`${baseUrl}/api/admin/dashboard`, { cache: 'no-store' });
      if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      const data = await res.json();
      setPagos(data?.pagos || []);
    } catch (err) {
      setErrorDetails(err instanceof Error ? err.message : 'Error desconocido');
      setPagos([]);
    } finally {
      setLoading(false);
    }
  }
  // Cargar pagos al montar
  React.useEffect(() => { fetchPagos(); }, []);

  if (loading) {
    return <div className="p-6 text-center">Cargando pagos...</div>;
  }
  if (!Array.isArray(pagos)) {
    return (
      <div className="rounded-lg shadow p-6 mb-8 text-center" style={{ background: 'var(--card)', color: 'var(--danger)' }}>
        <p>Error al cargar pagos a agricultores. Verifica la conexión o intenta más tarde.</p>
        {errorDetails && <p className="text-sm mt-2" style={{ color: 'var(--muted)' }}>Detalles: {errorDetails}</p>}
      </div>
    );
  }
  function handlePagar(p: any) {
    setModal({ type: 'pagar', data: p });
  }
  function handleVer(p: any) {
    setModal({ type: 'ver', data: p });
  }
  function closeModal() {
    setModal({ type: null, data: null });
  }
  async function confirmarLiquidacion() {
    setModal(m => ({ ...m, loading: true, feedback: '' }));
    try {
      const res = await fetch(`${baseUrl}/api/admin/pagos/procesar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: modal.data.id, monto: modal.data.aPagar })
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || 'Error al liquidar');
      setModal(m => ({ ...m, feedback: 'Liquidación exitosa', loading: false }));
      await fetchPagos();
      setTimeout(() => closeModal(), 1200);
    } catch (err: any) {
      setModal(m => ({ ...m, feedback: err.message || 'Error desconocido', loading: false }));
    }
  }
  return (
  <>
  {/* Modal */}
      {modal.type && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: 'var(--card)', color: '#fff', borderRadius: 12, padding: 32, minWidth: 320, maxWidth: '90vw', boxShadow: '0 4px 32px #0008' }}>
            {modal.type === 'pagar' && (
              <>
                <h2 className="text-lg font-bold mb-2">Confirmar Liquidación</h2>
                <p className="mb-4">¿Deseas liquidar al agricultor <b>{modal.data.agricultor}</b> por <b>{modal.data.aPagar?.toLocaleString('es-CO', { style: 'currency', currency: 'COP' })}</b>?</p>
                {modal.feedback && <div className={`mb-2 ${modal.feedback.includes('exitosa') ? 'text-green-400' : 'text-red-400'}`}>{modal.feedback}</div>}
                <div className="flex gap-4 justify-end">
                  <button onClick={closeModal} className="px-4 py-2 rounded bg-gray-500 text-white" disabled={modal.loading}>Cancelar</button>
                  <button onClick={confirmarLiquidacion} className="px-4 py-2 rounded bg-green-600 text-white" disabled={modal.loading}>{modal.loading ? 'Procesando...' : 'Confirmar'}</button>
                </div>
              </>
            )}
            {modal.type === 'ver' && (
              <>
                <h2 className="text-lg font-bold mb-2">Detalle Agricultor</h2>
                <div className="mb-4">
                  <div><b>Agricultor:</b> {modal.data.agricultor}</div>
                  <div><b>Ventas:</b> {modal.data.ventas?.toLocaleString('es-CO', { style: 'currency', currency: 'COP' })}</div>
                  <div><b>Comisión:</b> {modal.data.comision?.toLocaleString('es-CO', { style: 'currency', currency: 'COP' })}</div>
                  <div><b>A Pagar:</b> {modal.data.aPagar?.toLocaleString('es-CO', { style: 'currency', currency: 'COP' })}</div>
                  <div><b>Estado:</b> {modal.data.estado}</div>
                </div>
                <div className="flex gap-4 justify-end">
                  <button onClick={closeModal} className="px-4 py-2 rounded bg-gray-500 text-white">Cerrar</button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
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
                  <button
                    className="px-3 py-1 rounded text-xs"
                    style={{ background: 'var(--danger)', color: '#fff' }}
                    onClick={() => handlePagar(p)}
                  >
                    Pagar
                  </button>
                ) : (
                  <button
                    className="px-3 py-1 rounded text-xs"
                    style={{ background: 'var(--glass)', color: 'var(--muted)' }}
                    onClick={() => handleVer(p)}
                  >
                    Ver
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>

      </table>
    </section>
    </>
  );
}
