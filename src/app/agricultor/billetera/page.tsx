"use client";
import { useEffect, useState } from 'react';
import { 
  Wallet, 
  TrendingUp, 
  DollarSign, 
  ShoppingBag, 
  Calendar, 
  ArrowDownCircle, 
  ArrowUpCircle,
  Activity,
  CheckCircle,
  Clock
} from 'lucide-react';


interface Transaction {
  id: number;
  type: 'income' | 'expense';
  description: string;
  amount: number;
  fecha: string;
}

interface PagoRecibido {
  id: number;
  monto: number;
  fecha: string;
  ordenes: number;
  estado: string;
}

interface BilleteraData {
  saldoDisponible: number;
  totalVentasMes: number;
  totalVentasMesNeto: number;
  totalIngresosAcumulados: number;
  totalIngresosNeto: number;
  comisionPlataforma: number;
  comisionPlataformaMes: number;
  pedidosCompletados: number;
  totalPagosRecibidos: number;
  pendienteLiquidacion: number;
  cantidadPagosRecibidos: number;
  transacciones: Transaction[];
  pagosRecibidos: PagoRecibido[];
}

export default function MiAgroBilleteraPage() {
  const [data, setData] = useState<BilleteraData | null>(null);
  const [perfil, setPerfil] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPago, setSelectedPago] = useState<PagoRecibido | null>(null);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [resB, resP] = await Promise.all([
          fetch('/api/agricultor/billetera'),
          fetch('/api/agricultor/perfil')
        ]);

        if (!resB.ok) throw new Error('Error al cargar datos de billetera');
        if (!resP.ok) throw new Error('Error al cargar perfil del agricultor');

        const jsonB = await resB.json();
        const jsonP = await resP.json();

        setData(jsonB);
        // perfil endpoint returns { agricultor: { ... , user: { nombre } } }
        setPerfil(jsonP?.agricultor ?? null);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, []);

  

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-900 flex items-center justify-center text-neutral-200">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-neutral-700 border-t-green-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-neutral-300">Cargando tu billetera...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-neutral-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-600/20 border border-red-700 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">⚠️</span>
          </div>
          <p className="text-red-400">{error || 'Error al cargar datos'}</p>
        </div>
      </div>
    );
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-CO', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  

  return (
    <div className="min-h-screen bg-neutral-900 text-neutral-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header compacto */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-600 rounded-lg">
              <Wallet className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-neutral-100">Mi Billetera</h1>
              <p className="text-sm text-neutral-400">Resumen financiero</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="rounded-xl p-6 shadow-lg bg-neutral-800 border border-neutral-700">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <p className="text-green-300/80 text-xs font-medium uppercase tracking-wide mb-2">Total de tus Ventas (Neto)</p>
                  <h2 className="text-4xl font-bold mb-1 text-green-400">{formatCurrency(data.totalIngresosNeto)}</h2>
                  <p className="text-neutral-300 text-sm mb-3">Después de comisión del 10%</p>
                  <div className="rounded-lg p-3 bg-neutral-900/60 border border-neutral-700 w-full sm:max-w-xl md:max-w-2xl">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-neutral-300">Ventas brutas:</span>
                      <span className="font-semibold text-neutral-100">{formatCurrency(data.totalIngresosAcumulados)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-neutral-300">Comisión plataforma:</span>
                      <span className="font-semibold text-red-300">-{formatCurrency(data.comisionPlataforma)}</span>
                    </div>
                  </div>
                </div>
                <div className="p-3 bg-neutral-900/60 rounded-lg border border-neutral-700">
                  <DollarSign className="w-7 h-7 text-green-400" />
                </div>
              </div>
              <div className="pt-3 border-t border-green-500/30">
                <div className="flex items-center justify-between">
                  <span className="text-neutral-300 text-xs">Saldo en billetera:</span>
                  <span className="text-lg font-bold text-neutral-100">{formatCurrency(data.saldoDisponible)}</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Métricas en grid (removed 'Este mes' card) */}
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="rounded-xl shadow-sm border border-neutral-700 p-4 bg-neutral-800">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-neutral-900/60 border border-neutral-700 flex items-center justify-center overflow-hidden">
                  {perfil?.foto || ((data as any)?.agricultor?.avatarUrl) ? (
                    <img src={perfil?.foto ?? (data as any).agricultor.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <div className="text-lg font-semibold text-neutral-200">{((perfil?.user?.nombre) || ((data as any)?.agricultor?.name) || 'U').split(' ').map((n: string) => n[0]).slice(0,2).join('')}</div>
                  )}
                </div>
                <div>
                  <div className="text-sm font-semibold text-neutral-100">{perfil?.user?.nombre || (data as any)?.agricultor?.name || 'Tu perfil'}</div>
                  <div className="text-xs text-neutral-400">Resumen estadístico</div>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3">
                <div className="p-3 bg-neutral-900/40 border border-neutral-700 rounded">
                  <div className="text-xs text-neutral-400">Pedidos completados</div>
                  <div className="text-sm font-bold text-neutral-100">{data.pedidosCompletados}</div>
                </div>
                <div className="p-3 bg-neutral-900/40 border border-neutral-700 rounded">
                  <div className="text-xs text-neutral-400">Pagos recibidos</div>
                  <div className="text-sm font-bold text-neutral-100">{data.cantidadPagosRecibidos}</div>
                </div>
                <div className="p-3 bg-neutral-900/40 border border-neutral-700 rounded col-span-2">
                  <div className="text-xs text-neutral-400">Promedio por pago</div>
                  <div className="text-sm font-bold text-neutral-100">{data.cantidadPagosRecibidos ? formatCurrency(Math.round(data.totalPagosRecibidos / data.cantidadPagosRecibidos)) : '—'}</div>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-3">
            <div className="rounded-xl shadow-sm border border-neutral-700 mt-6 bg-neutral-800">
              <div className="p-4 border-b border-neutral-700 bg-neutral-900 text-neutral-100 rounded-t-xl">
                <h3 className="font-semibold">Pagos realizados</h3>
                <p className="text-xs text-neutral-400">Historial de pagos enviados por el administrador</p>
              </div>
              <div className="p-4 overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-xs text-neutral-300 border-b border-neutral-700">
                      <th className="px-3 py-2">Fecha</th>
                      <th className="px-3 py-2 text-right">Monto</th>
                      <th className="px-3 py-2">Estado</th>
                      <th className="px-3 py-2">Método</th>
                      <th className="px-3 py-2">Comprobante</th>
                      <th className="px-3 py-2">Acción</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-800">
                    {data.pagosRecibidos.map((pago) => (
                      <tr key={pago.id} className="hover:bg-neutral-900">
                        <td className="px-3 py-3">
                          <div className="text-xs text-neutral-200">{new Date(pago.fecha).toLocaleString('es-CO')}</div>
                          <div className="text-xs text-neutral-400">#{pago.id}</div>
                        </td>
                        <td className="px-3 py-3 text-right font-semibold text-neutral-100">{formatCurrency(pago.monto)}</td>
                        <td className="px-3 py-3">
                          <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-600/15 text-green-300 border border-green-700/40">{pago.estado}</span>
                        </td>
                        <td className="px-3 py-3 text-neutral-200">{(pago as any).metodoPago || '—'}</td>
                        <td className="px-3 py-3">
                          {(pago as any).comprobanteUrl ? (
                            <a href={(pago as any).comprobanteUrl} target="_blank" rel="noreferrer" className="text-green-400 hover:text-green-300 text-sm font-medium">Ver</a>
                          ) : (
                            <span className="text-xs text-neutral-400">—</span>
                          )}
                        </td>
                        <td className="px-3 py-3 text-right">
                          <button onClick={() => setSelectedPago(pago)} className="text-green-400 hover:text-green-300 text-sm font-medium">Ver</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="p-4 border-t border-neutral-700 bg-neutral-900">
                <div className="flex items-start gap-2">
                  <div className="w-5 h-5 bg-neutral-800 rounded-full border border-neutral-700 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs">💡</span>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-neutral-100 mb-1">¿Cómo funcionan los pagos?</p>
                    <p className="text-xs text-neutral-300">Cuando tus pedidos son confirmados y entregados, el administrador procesa el pago y el dinero se acredita en tu billetera.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {selectedPago && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
              <div className="bg-neutral-900 border border-neutral-700 rounded-lg shadow-lg w-full max-w-md">
                <div className="p-4 border-b border-neutral-800 flex items-center justify-between">
                  <h4 className="font-semibold text-neutral-100">Detalles de Pago</h4>
                  <button onClick={() => setSelectedPago(null)} className="text-neutral-400 hover:text-neutral-200">Cerrar</button>
                </div>
                <div className="p-4 text-neutral-200">
                  <p className="text-sm mb-2">ID: <span className="font-medium text-neutral-100">{selectedPago.id}</span></p>
                  <p className="text-sm mb-2">Fecha: <span className="font-medium text-neutral-100">{new Date(selectedPago.fecha).toLocaleString('es-CO')}</span></p>
                  <p className="text-sm mb-2">Monto: <span className="font-medium text-neutral-100">{formatCurrency(selectedPago.monto)}</span></p>
                  <p className="text-sm mb-2">Órdenes: <span className="font-medium text-neutral-100">{selectedPago.ordenes}</span></p>
                  <p className="text-sm mb-2">Estado: <span className="font-medium text-neutral-100">{selectedPago.estado}</span></p>
                  <p className="text-sm mb-2">Método: <span className="font-medium text-neutral-100">{(selectedPago as any).metodoPago || '—'}</span></p>
                  <p className="text-sm mb-2">Referencia: <span className="font-medium text-neutral-100">{(selectedPago as any).referencia || '—'}</span></p>
                  {(selectedPago as any).comprobanteUrl && (
                    <p className="text-sm mb-2">Comprobante: <a href={(selectedPago as any).comprobanteUrl} target="_blank" rel="noreferrer" className="text-green-400 hover:text-green-300">Ver/Descargar</a></p>
                  )}
                  <div className="mt-4 text-right">
                    <button onClick={() => setSelectedPago(null)} className="px-3 py-1 rounded bg-green-600 text-white text-sm hover:bg-green-700">Cerrar</button>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
