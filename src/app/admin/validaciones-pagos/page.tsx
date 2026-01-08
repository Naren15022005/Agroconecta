"use client";
import React, { useEffect, useState } from "react";
import { ShieldCheck, Clock } from "lucide-react";

type Pago = {
  id: string;
  pedidoId: string;
  compradorId: string;
  agricultorId: string;
  monto: string;
  fecha: string;
  metodo: string;
  estado: string;
  comprobanteUrl?: string;
};

export default function ValidacionesPage() {
  const [pendientes, setPendientes] = useState<Pago[]>([]);
  const [validados, setValidados] = useState<Pago[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'validacion' | 'crud'>('validacion');
  const [agricultores, setAgricultores] = useState<any[]>([]);
  const [comprobantesMap, setComprobantesMap] = useState<Record<string, string | null>>({});
  const [actionLoading, setActionLoading] = useState(false);
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);

  const formatMoney = (value: any) => {
    const n = Number(value || 0);
    if (!isFinite(n)) return String(value);
    const fixed = n.toFixed(2);
    if (fixed.endsWith('.00')) {
      return Number(n).toLocaleString('es-CO', { maximumFractionDigits: 0 });
    }
    return Number(fixed).toLocaleString('es-CO', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  // Cargar pagos
  const fetchPagos = async () => {
    setLoading(true);
    try {
      const [pendRes, valRes] = await Promise.all([
        fetch("/api/admin/pagos-validaciones?estado=PENDIENTE", { headers: { 'Cache-Control': 'no-cache' } }),
        fetch("/api/admin/pagos-validaciones?estado=VERIFICADO", { headers: { 'Cache-Control': 'no-cache' } }),
      ]);
      const pend = pendRes.ok ? await pendRes.json() : { pagos: [] };
      const val = valRes.ok ? await valRes.json() : { pagos: [] };
      // Accept either `pagos` or `pedidos` property coming from the API
      setPendientes(pend.pagos || pend.pedidos || []);
      setValidados(val.pagos || val.pedidos || []);
    } catch (e) {
      setPendientes([]);
      setValidados([]);
    }
    setLoading(false);
  };

  // Cargar resumen/tabla CRUD (dashboard)
  const fetchDashboardPagos = async () => {
    try {
      const r = await fetch('/api/admin/dashboard', { headers: { 'Cache-Control': 'no-cache' } });
      const data = r.ok ? await r.json() : null;
      const pagos = data?.pagos || [];
      setAgricultores(pagos);

      // precargar comprobantes para cada agricultor (primer comprobante disponible)
      const map: Record<string, string | null> = {};
      await Promise.all(pagos.map(async (p: any) => {
        try {
          const res = await fetch(`/api/admin/payment-orders?agricultorId=${p.agricultorId || p.id}`, { headers: { 'Cache-Control': 'no-cache' } });
          if (!res.ok) { map[p.id] = null; return; }
          const j = await res.json();
          const pedidos = j.pedidos || [];
          const first = pedidos[0];
          const txUrl = first?.paymentTransactions && first.paymentTransactions.length > 0 ? (first.paymentTransactions[0]?.comprobanteUrl || first.paymentTransactions[0]?.evidenceUrl) : null;
          const url = first?.comprobanteUrl || txUrl || first?.rawOrder?.comprobanteUrl || (first?.rawOrder?.paymentTransactions && (first.rawOrder.paymentTransactions[0]?.comprobanteUrl || first.rawOrder.paymentTransactions[0]?.evidenceUrl)) || null;
          map[p.id] = url;
        } catch (e) {
          map[p.id] = null;
        }
      }));
      setComprobantesMap(map);
    } catch (e) {
      setAgricultores([]);
      setComprobantesMap({});
    }
  };

  useEffect(() => {
    fetchPagos();
    // precarga de agricultores para la pestaña CRUD
    fetchDashboardPagos();
  }, []);

  // Al cambiar a la pestaña CRUD, refrescar para reflejar validaciones recientes
  useEffect(() => {
    if (tab === 'crud') {
      fetchDashboardPagos();
    }
  }, [tab]);

  // Validar pago
  const validarPago = async (id: string) => {
    try {
      const res = await fetch('/api/admin/pagos-validaciones', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ pedidoId: id, pagoVerificado: true }) });
      if (!res.ok) {
        let body: any = {};
        try { body = await res.json(); } catch (e) { body = { raw: await res.text().catch(()=>'') }; }
        console.error('Validar pago failed', res.status, body);
        alert(body.error || body.raw || 'Error validando pago');
      }
    } catch (e) {
      console.error('Validar pago network error', e);
      alert('Error de conexión al validar pago');
    }
    // Refrescar ambos: lista de validaciones y tabla CRUD
    await fetchPagos();
    await fetchDashboardPagos();
  };

  return (
    <div className="max-w-6xl mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6 flex items-center gap-2">
        <ShieldCheck className="text-[var(--accent-2)]" size={32} />
        Validaciones & Pagos
      </h1>

      <div className="mb-6 flex gap-2">
        <button onClick={() => setTab('validacion')} className={`px-4 py-2 rounded ${tab === 'validacion' ? 'bg-[var(--accent)] text-white' : 'bg-[#20252a] text-gray-300'}`}>Validación</button>
        <button onClick={() => setTab('crud')} className={`px-4 py-2 rounded ${tab === 'crud' ? 'bg-[var(--accent)] text-white' : 'bg-[#20252a] text-gray-300'}`}>Pagos (CRUD)</button>
      </div>

      {tab === 'validacion' ? (
        <div>
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Clock className="text-yellow-400" size={20} /> Pendientes de validación
          </h2>
          {loading ? (
            <div className="text-gray-400">Cargando...</div>
          ) : pendientes.length === 0 ? (
            <div className="text-gray-400">No hay pagos pendientes.</div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-2">
              {pendientes.map((p: any) => {
                const id = p.id || p.pedidoId || p.orderId;
                const monto = p.monto ?? p.total ?? p.order?.total ?? (p.items ? p.items.reduce((s:any,it:any)=>s+Number(it.subtotal||0),0) : 0);
                const metodo = p.metodo || p.paymentMethod || p.order?.paymentMethod || '';
                const fecha = p.fecha || p.createdAt || p.order?.createdAt;
                const comprador = p.cliente_nombre || p.buyer?.nombre || p.order?.buyer?.nombre || p.buyerId || '';
                const items = p.items || p.order?.items || p.rawOrder?.items || [];
                const txComprob = p.paymentTransactions && p.paymentTransactions.length > 0 ? (p.paymentTransactions[0]?.comprobanteUrl || p.paymentTransactions[0]?.evidenceUrl) : null;
                const comprobante = p.comprobanteUrl || txComprob || p.rawOrder?.comprobanteUrl || (p.rawOrder?.paymentTransactions && (p.rawOrder.paymentTransactions[0]?.comprobanteUrl || p.rawOrder.paymentTransactions[0]?.evidenceUrl)) || null;
                // Status badge (prefer payment validation state)
                const estadoRaw = (
                  p.paymentTransactions?.[0]?.estado ??
                  (p.pagoVerificado ? 'VERIFICADO' : 'PENDIENTE')
                ).toString().toUpperCase();
                const statusMap: Record<string, string> = {
                  'PENDIENTE': 'bg-yellow-400 text-black',
                  'VERIFICADO': 'bg-green-600 text-white',
                  'PAGADO': 'bg-green-600 text-white',
                  'PAGADO_MASIVO': 'bg-green-600 text-white',
                  'PAGADO_INDIVIDUAL': 'bg-green-600 text-white',
                  'REEMBOLSADO': 'bg-red-600 text-white',
                  'BLOQUEADO': 'bg-orange-600 text-white',
                  'CANCELADO': 'bg-gray-500 text-white'
                };
                const badgeClass = statusMap[estadoRaw] || 'bg-gray-600 text-white';

                return (
                  <article key={id} className="w-full bg-gradient-to-b from-[#0b1220] to-[#0f1316] border border-neutral-800 rounded-xl p-4 shadow-lg h-full flex flex-col justify-between overflow-hidden">
                    <div className="flex gap-4">
                      <div className="flex-shrink-0 h-32 w-48">
                        {comprobante ? (
                          <img
                            src={comprobante}
                            alt="comprobante"
                            onClick={() => { setImagePreviewUrl(comprobante); setImageModalOpen(true); }}
                            className="h-full w-full object-cover rounded-md cursor-pointer border border-neutral-800 shadow-sm"
                          />
                        ) : (
                          <div className="h-full w-full bg-[#202428] rounded-md flex items-center justify-center text-sm text-gray-500">Sin comprobante</div>
                        )}
                      </div>
                      <div className="flex-1 flex flex-col">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="text-xs text-gray-400">Pedido</div>
                            <div className="font-semibold text-white truncate" title={id}>{id}</div>
                          </div>
                          <div className="flex-shrink-0 text-right ml-2">
                            <div className="text-xs text-gray-400">Monto</div>
                            <div className="font-semibold text-green-400 text-lg">${formatMoney(monto)}</div>
                          </div>
                        </div>
                        <div className="mt-2 text-sm text-gray-300 space-y-1 flex-1">
                          <div>Comprador: <span className="font-medium text-white">{comprador}</span></div>
                          <div>Método: <span className="text-gray-300">{metodo}</span></div>
                          <div>Fecha: <span className="text-gray-300">{fecha ? new Date(fecha).toLocaleString() : '-'}</span></div>
                          <div className="mt-3">
                            <div className="text-sm text-gray-400">Items</div>
                            <ul className="text-sm mt-1 space-y-1 max-h-20 overflow-hidden">
                              {(items || []).slice(0,4).map((it:any, idx:number)=>(
                                <li key={idx} className="flex justify-between">
                                  <span className="truncate">{it.product?.name || it.name || it.producto || '-'}</span>
                                  <span className="text-gray-300">${formatMoney(it.subtotal ?? it.price ?? 0)}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="mt-3 flex items-center justify-end">
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-1 rounded-full text-xs ${badgeClass}`}>{estadoRaw.replace('_',' ')}</span>
                        {!p.pagoVerificado && (
                          <button
                            onClick={() => validarPago(id)}
                            className="px-3 py-1.5 rounded-md text-xs font-semibold bg-[var(--accent)] text-white hover:opacity-90"
                          >
                            Validar
                          </button>
                        )}
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
          {/* Imagen modal preview */}
          {imageModalOpen && imagePreviewUrl && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
              <div className="max-w-[90%] max-h-[90%] p-4">
                <div className="relative bg-transparent">
                  <button className="absolute -top-6 -right-6 bg-red-600 text-white rounded-full p-2" onClick={() => { setImageModalOpen(false); setImagePreviewUrl(null); }}>Cerrar</button>
                  <img src={imagePreviewUrl} alt="preview" className="max-w-full max-h-[80vh] rounded-md shadow-lg object-contain" />
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div>
          <section className="bg-[#232a34] rounded-xl p-6 shadow-lg">
            <h2 className="text-xl font-semibold mb-4">Listado de agricultores y pagos</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full text-left">
                <thead>
                  <tr>
                    <th className="px-3 py-2">Agricultor</th>
                    <th className="px-3 py-2">Ventas</th>
                    <th className="px-3 py-2">Comisión</th>
                    <th className="px-3 py-2">A Pagar</th>
                    <th className="px-3 py-2">Comprobante pago</th>
                    <th className="px-3 py-2">Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {agricultores.map(a => (
                    <tr key={a.id} className="hover:bg-[#15181b]">
                        <td className="px-3 py-2">{a.agricultor}</td>
                        <td className="px-3 py-2">${formatMoney(a.ventas)}</td>
                        <td className="px-3 py-2">${formatMoney(a.comision)}</td>
                        <td className="px-3 py-2">${formatMoney(a.aPagar)}</td>
                        <td className="px-3 py-2">
                          {comprobantesMap[a.id] ? (
                            <img
                              src={comprobantesMap[a.id] as string}
                              alt="comprobante"
                              className="h-12 w-20 object-cover rounded cursor-pointer"
                              onClick={(e) => { e.stopPropagation(); setImagePreviewUrl(comprobantesMap[a.id] as string); setImageModalOpen(true); }}
                            />
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </td>
                        <td className="px-3 py-2">{a.estado}</td>
                      </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
          
        </div>
      )}
    </div>
  );
}
