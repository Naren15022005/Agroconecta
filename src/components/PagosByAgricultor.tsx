"use client";
import React, { useEffect, useMemo, useState } from 'react';
import { RefreshCw, List, Grid } from 'lucide-react';

export default function PagosByAgricultor() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pedidos, setPedidos] = useState<any[]>([]);
  const [viewMode, setViewMode] = useState<'cards' | 'list'>('cards');
  const [filterAgricultor, setFilterAgricultor] = useState<string | null>(null);
  const [selectedAgric, setSelectedAgric] = useState<any | null>(null);
  const [ordersForAgric, setOrdersForAgric] = useState<any[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [metodoPago, setMetodoPago] = useState<string>('NEQUI');
  const [referenciaPago, setReferenciaPago] = useState<string>('');
  const [comprobanteUrl, setComprobanteUrl] = useState<string | null>(null);
  

  useEffect(() => { fetchCards(); }, []);

  async function fetchCards() {
    setLoading(true);
    setError(null);
    try {
      // Use the same source as dashboard which aggregates pagos por agricultor
      const res = await fetch('/api/admin/dashboard');
      if (!res.ok) throw new Error(await res.text());
      const json = await res.json();
      const pagosFromDashboard = json.pagos || [];
      // keep only pendientes (not yet liquidated)
      const pendientes = pagosFromDashboard.filter((p: any) => String(p.estado).toLowerCase() === 'pendiente' && Number(p.aPagar || 0) > 0);
      // For each pendiente, fetch payment-orders to compute the actual accumulated pending amount
      const enhanced = await Promise.all(pendientes.map(async (p: any) => {
        const agricultorId = p.agricultorId ?? p.id;
        try {
          const r = await fetch(`/api/admin/payment-orders?agricultorId=${encodeURIComponent(agricultorId)}`);
          if (!r.ok) throw new Error(await r.text());
          const j = await r.json();
          const pedidos = j.pedidos || [];
          const totalAcumulado = pedidos.reduce((s: number, it: any) => s + Number(it._agricultorAmount ?? it.monto_neto ?? 0), 0);
          return {
            agricultorId,
            agricultorName: p.agricultor,
            total: totalAcumulado || p.aPagar || 0,
            count: pedidos.length || 1,
            raw: { ...p, paymentOrders: pedidos }
          };
        } catch (e) {
          // fallback to dashboard value
          return {
            agricultorId,
            agricultorName: p.agricultor,
            total: p.aPagar,
            count: 1,
            raw: p
          };
        }
      }));
      setPedidos(enhanced);
    } catch (err: any) {
      setError(err?.message || 'Error al cargar pagos pendientes');
      setPedidos([]);
    } finally {
      setLoading(false);
    }
  }

  const grouped = useMemo(() => {
    const map: Record<string, { agricultorId: string; name?: string; total: number; count: number; pedidos: any[] }> = {};
    for (const p of pedidos) {
      const agricultorId = p.agricultorId || p.id || p.raw?.id || 'unknown';
      const agricultorName = p.agricultorName || p.agricultor || p.raw?.agricultor || undefined;
      const monto = Number(p.total ?? p.aPagar ?? p.totalAmount ?? 0);
      if (!map[agricultorId]) map[agricultorId] = { agricultorId, name: agricultorName, total: 0, count: 0, pedidos: [] };
      map[agricultorId].total += monto;
      map[agricultorId].count += p.count ?? 1;
      map[agricultorId].pedidos.push(p);
    }
    return Object.values(map).sort((a, b) => b.total - a.total);
  }, [pedidos]);

  function formatCurrency(n: number) {
    return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(n);
  }

  const grandTotal = grouped.reduce((s, g) => s + Number(g.total ?? 0), 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-end">
        <div style={{ color: 'var(--muted)' }} className="text-sm">Total acumulado:</div>
        <div className="ml-3 text-lg font-semibold text-cyan-400">{formatCurrency(grandTotal)}</div>
      </div>
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Pagos pendientes por agricultor</h2>
        <div className="flex items-center gap-2">
          <button title="Cambiar vista" onClick={() => setViewMode(v => v === 'cards' ? 'list' : 'cards')} className="px-2 py-1 rounded border bg-white/5 text-white flex items-center gap-2">
            {viewMode === 'cards' ? <List className="w-4 h-4" /> : <Grid className="w-4 h-4" />} {viewMode === 'cards' ? 'Lista' : 'Cards'}
          </button>
          <button onClick={fetchCards} className="px-3 py-1 rounded bg-cyan-600 text-white flex items-center gap-2">
            <RefreshCw /> Actualizar
          </button>
        </div>
      </div>

      

      {loading && <div className="text-sm text-muted">Cargando...</div>}
      {error && <div className="text-sm text-red-500">{error}</div>}

      <>
          {viewMode === 'cards' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {grouped.length === 0 && !loading && <div className="text-muted">No hay pagos pendientes</div>}
              {grouped.map(g => (
                <button
                  key={g.agricultorId}
                  type="button"
                  aria-label={`Ver pagos de ${g.name || g.agricultorId}`}
                  onClick={async () => {
                    // open modal with payment-orders for this agricultor
                    setSelectedAgric(g);
                    setOrdersForAgric([]);
                    setModalOpen(true);
                    try {
                      const agricultorId = encodeURIComponent(g.agricultorId);
                      const r = await fetch(`/api/admin/payment-orders?agricultorId=${agricultorId}`);
                      if (r.ok) {
                        const j = await r.json();
                        setOrdersForAgric(j.pedidos || []);
                      } else {
                        setOrdersForAgric([]);
                      }
                    } catch (e) {
                      setOrdersForAgric([]);
                    }
                  }}
                  className="p-4 rounded-lg shadow-sm transition duration-150 text-left focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  style={{ minWidth: 320, background: 'linear-gradient(180deg, rgba(255,255,255,0.01), rgba(255,255,255,0.00))', border: '1px solid rgba(255,255,255,0.03)' }}
                >
                  <div className="flex items-center">
                    <div className="flex-none">
                      <div className="w-12 h-12 rounded-full bg-cyan-500 flex items-center justify-center text-white font-bold text-sm">
                        {((g.name || g.agricultorId) + '').split(' ').map((s:any) => s[0]).join('').slice(0,2).toUpperCase()}
                      </div>
                    </div>
                    <div className="flex-1 px-3 min-w-0">
                      <div className="text-xs text-muted">Agricultor</div>
                      <div className="text-lg font-semibold text-white truncate">{g.name || g.agricultorId}</div>
                      <div className="mt-1 text-sm text-muted">Pedidos: <span className="font-semibold text-cyan-300 hover:underline">{g.count}</span></div>
                      <div className="mt-1 text-sm text-muted">Acumulado: <span className="font-semibold text-cyan-300">{formatCurrency(g.total)}</span></div>
                    </div>
                    <div className="flex-none text-right ml-3">
                      <div className="text-xs text-muted">Total</div>
                      <div className="text-2xl font-extrabold text-cyan-400">{formatCurrency(g.total)}</div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}

          {viewMode === 'list' && (
            <div className="overflow-auto">
              <table className="w-full table-auto">
                <thead>
                  <tr>
                    <th className="text-left text-xs" style={{ color: 'var(--muted)' }}>Agricultor</th>
                    <th className="text-right text-xs" style={{ color: 'var(--muted)' }}>Pedidos</th>
                    <th className="text-right text-xs" style={{ color: 'var(--muted)' }}>Acumulado</th>
                  </tr>
                </thead>
                <tbody>
                  {(filterAgricultor ? grouped.filter(x=>x.agricultorId===filterAgricultor) : grouped).map(g => (
                    <tr key={g.agricultorId} style={{ borderTop: '1px solid rgba(255,255,255,0.03)' }}>
                      <td className="px-3 py-2" style={{ color: '#fff' }}>{g.name || g.agricultorId}</td>
                      <td className="px-3 py-2 text-right" style={{ color: 'var(--accent)' }}>{g.count}</td>
                      <td className="px-3 py-2 text-right" style={{ color: '#fff' }}>{formatCurrency(g.total)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

      {/* Modal: detalle de pagos por agricultor */}
      {modalOpen && selectedAgric && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="bg-[#0b1220] w-[95%] max-w-6xl p-4 rounded-lg max-h-[70vh] overflow-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Liquidar pagos - {selectedAgric.name || selectedAgric.agricultorName || selectedAgric.agricultorId}</h3>
              <div className="flex gap-2">
                <button className="px-3 py-1 bg-gray-600 rounded" onClick={() => { setModalOpen(false); setSelectedAgric(null); setOrdersForAgric([]); }}>Cerrar</button>
              </div>
            </div>

            <div className="mb-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-muted">Pedidos pendientes:</div>
                  <div className="text-lg font-semibold">{selectedAgric.count ?? 0} pedidos</div>
                  <div className="text-sm text-muted mt-2">Monto a pagar (90%):</div>
                  <div className="text-2xl font-extrabold text-cyan-400">{formatCurrency(Number(selectedAgric.total ?? 0))}</div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-2">
                    <select value={metodoPago} onChange={(e)=>setMetodoPago(e.target.value)} className="px-2 py-1 rounded bg-neutral-700 text-white">
                      <option value="NEQUI">Nequi</option>
                      <option value="BANCOLINDO">Bancolombia</option>
                      <option value="TRANSFERENCIA">Transferencia</option>
                    </select>
                    <input value={referenciaPago} onChange={(e)=>setReferenciaPago(e.target.value)} placeholder="Referencia (opcional)" className="px-2 py-1 rounded bg-neutral-700 text-white" />
                    <input type="file" accept="image/*" onChange={async (ev)=>{
                      const f = ev.target.files?.[0];
                      if (!f) return;
                      // preview
                      const url = URL.createObjectURL(f);
                      setImagePreviewUrl(url);
                      try {
                        const fd = new FormData();
                        fd.append('file', f);
                        const uploadRes = await fetch('/api/upload', { method: 'POST', body: fd });
                        const uj = await uploadRes.json();
                        if (uploadRes.ok) {
                          setComprobanteUrl(uj.url || uj.publicUrl || uj.fileUrl || null);
                        } else {
                          alert(uj.error || 'Error subiendo comprobante');
                        }
                      } catch (e:any) { console.error(e); alert('Error subiendo comprobante'); }
                    }} />
                  </div>
                  <button className="px-3 py-1 rounded bg-cyan-600 text-white" onClick={async () => {
                    // pagar todo (usa el endpoint de liquidación masiva) with method/ref/comprobante
                    try {
                      const payload: any = { userId: selectedAgric.agricultorId, monto: Number(selectedAgric.total ?? 0), metodoPago: metodoPago || 'LIQUIDACION' };
                      if (referenciaPago) payload.referencia = referenciaPago;
                      if (comprobanteUrl) payload.comprobanteUrl = comprobanteUrl;
                      const res = await fetch('/api/admin/pagos/procesar', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
                      const j = await res.json();
                      if (!res.ok) throw new Error(j.error || 'Error procesando liquidación');
                      await fetchCards();
                      setModalOpen(false);
                      setSelectedAgric(null);
                      setOrdersForAgric([]);
                    } catch (err:any) {
                      alert(err.message || 'Error al pagar todo');
                    }
                  }}>Pagar todo ({formatCurrency(Number(selectedAgric.total ?? 0))})</button>
                </div>
              </div>
            </div>

            <div className="mb-4 overflow-auto max-h-64">
              <table className="w-full text-sm table-auto">
                <thead>
                  <tr className="text-left text-xs" style={{ color: 'var(--muted)' }}>
                    <th className="px-2 py-1">ID Pedido</th>
                    <th className="px-2 py-1">Comprador</th>
                    <th className="px-2 py-1 text-right">Monto bruto</th>
                    <th className="px-2 py-1 text-right">Monto neto agricultor</th>
                    <th className="px-2 py-1">Método</th>
                    <th className="px-2 py-1">Producto</th>
                    <th className="px-2 py-1 text-center">Acción</th>
                  </tr>
                </thead>
                <tbody>
                  {(ordersForAgric || []).map((o:any) => {
                    const bruto = Number(o.monto_bruto ?? o.monto ?? o.total ?? (o.rawOrder && o.rawOrder.total) ?? 0);
                    const neto = Number(o._agricultorAmount ?? o.monto_neto ?? (o.rawOrder && (o.rawOrder.items || []).reduce((s:any,it:any)=>s+Number(it.subtotal||0),0)) ?? 0);
                    const comprador = o.cliente_nombre ?? o.buyer?.nombre ?? (o.rawOrder && o.rawOrder.buyer?.nombre) ?? o.buyerId ?? '-';
                    const metodo = o.metodo_pago_cliente ?? (o.rawOrder && o.rawOrder.paymentMethod) ?? (o.rawOrder?.paymentTransactions && o.rawOrder.paymentTransactions[0]?.method) ?? '-';
                    const producto = o.producto_resumen ?? (o.rawOrder && (o.rawOrder.items || []).map((it:any)=>it.product?.name).filter(Boolean).join(', ')) ?? '-';
                    return (
                      <tr key={o.id} style={{ borderTop: '1px solid rgba(255,255,255,0.03)' }}>
                        <td className="px-2 py-2 font-mono text-xs" style={{ color: 'var(--muted)' }}>{o.pedido_id ?? o.id}</td>
                        <td className="px-2 py-2">{comprador}</td>
                        <td className="px-2 py-2 text-right">{formatCurrency(bruto)}</td>
                        <td className="px-2 py-2 text-right text-cyan-300">{formatCurrency(neto)}</td>
                        <td className="px-2 py-2">{metodo}</td>
                        <td className="px-2 py-2 truncate" title={producto}>{producto}</td>
                        <td className="px-2 py-2 text-center">
                          <div className="flex items-center gap-2 justify-center">
                            <button className="px-2 py-1 bg-green-600 rounded text-white text-xs" onClick={async () => {
                              // Pagar individual
                              try {
                                const res = await fetch('/api/admin/payment-orders', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'pay-individual', orderId: o.id }) });
                                const j = await res.json();
                                if (!res.ok) throw new Error(j.error || 'Error pagando pedido');
                                // refresh orders list and cards
                                try { const r2 = await fetch(`/api/admin/payment-orders?agricultorId=${encodeURIComponent(selectedAgric.agricultorId || selectedAgric.id)}`); if (r2.ok) { const jj = await r2.json(); setOrdersForAgric(jj.pedidos || []); } } catch(_){}
                                await fetchCards();
                              } catch (err:any) { alert(err.message || 'Error al pagar'); }
                            }}>Pagar</button>
                            <button className="px-2 py-1 bg-red-600 rounded text-white text-xs" onClick={async () => {
                              // Reembolsar
                              if (!confirm('¿Confirmar reembolso de este pedido?')) return;
                              try {
                                const res = await fetch('/api/admin/payment-orders', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'refund', orderId: o.id, motivo: 'Reembolso manual' }) });
                                const j = await res.json();
                                if (!res.ok) throw new Error(j.error || 'Error reembolsando pedido');
                                try { const r2 = await fetch(`/api/admin/payment-orders?agricultorId=${encodeURIComponent(selectedAgric.agricultorId || selectedAgric.id)}`); if (r2.ok) { const jj = await r2.json(); setOrdersForAgric(jj.pedidos || []); } } catch(_){}
                                await fetchCards();
                              } catch (err:any) { alert(err.message || 'Error al reembolsar'); }
                            }}>Reembolsar</button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            
          </div>
        </div>
      )}

      {/* Imagen modal */}
      {imagePreviewUrl && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/60">
          <div className="max-w-[90%] max-h-[90%] p-4">
            <div className="relative bg-transparent">
              <button className="absolute -top-6 -right-6 bg-red-600 text-white rounded-full p-2" onClick={() => setImagePreviewUrl(null)}>Cerrar</button>
              <img src={imagePreviewUrl} alt="preview" className="max-w-full max-h-[80vh] rounded-md shadow-lg object-contain" />
            </div>
          </div>
        </div>
      )}
        </>
      
    </div>
  );
}


