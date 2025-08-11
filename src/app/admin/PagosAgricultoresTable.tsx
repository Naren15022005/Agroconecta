'use client';
import { Users } from 'lucide-react';
import { useEffect, useState } from 'react';
import Toast from '@/components/Toast';
import LiquidacionModal from '@/components/LiquidacionModal';

interface PagoAgricultor {
  id: string;
  agricultor: string;
  agricultorId: string;
  ventas: number;
  comision: number;
  aPagar: number;
  estado: 'pendiente' | 'sin_ventas' | 'liquidado';
  fechaLiquidacion?: string;
  numeroTransaccion?: string;
}

interface ToastState {
  show: boolean;
  type: 'success' | 'error' | 'warning' | 'loading';
  message: string;
}

export default function PagosAgricultoresTable() {
  const [pagos, setPagos] = useState<PagoAgricultor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [procesando, setProcesando] = useState<string | null>(null);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [liquidacionSeleccionada, setLiquidacionSeleccionada] = useState<PagoAgricultor | null>(null);
  const [toast, setToast] = useState<ToastState>({
    show: false,
    type: 'success',
    message: ''
  });

  const showToast = (type: ToastState['type'], message: string) => {
    setToast({ show: true, type, message });
  };

  const hideToast = () => {
    setToast(prev => ({ ...prev, show: false }));
  };

  const abrirModal = (pago: PagoAgricultor) => {
    setLiquidacionSeleccionada(pago);
    setModalAbierto(true);
  };

  const cerrarModal = () => {
    setModalAbierto(false);
    setLiquidacionSeleccionada(null);
  };

  useEffect(() => {
    cargarPagos();
  }, []);

  const cargarPagos = async () => {
    try {
      setLoading(true);
      const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
      const res = await fetch(`${baseUrl}/api/admin/dashboard`, { cache: 'no-store' });
      
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      }
      
      const data = await res.json();
      setPagos(data?.pagos || []);
    } catch (err) {
      console.error('Error fetching pagos:', err);
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  const handlePagar = async (agricultorId: string, monto: number, agricultor: string) => {
    try {
      setProcesando(agricultorId);
      
      console.log('Enviando pago:', { agricultorId, monto, agricultor });
      
      // Mostrar notificación de carga
      showToast('loading', `Liquidando pago para ${agricultor}...`);
      
      const response = await fetch('/api/admin/pagos/procesar', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          agricultorId,
          monto
        })
      });

      const data = await response.json();
      console.log('Respuesta del servidor:', data);

      if (data.success) {
        // Actualizar el estado local
        setPagos(prev => 
          prev.map(pago => 
            pago.agricultorId === agricultorId 
              ? { ...pago, estado: 'liquidado' as const }
              : pago
          )
        );
        
        hideToast();
        setTimeout(() => {
          showToast('success', `¡Liquidación exitosa! ${monto.toLocaleString('es-CO', { style: 'currency', currency: 'COP' })} enviados a ${agricultor}`);
        }, 100);
      } else {
        hideToast();
        setTimeout(() => {
          showToast('error', data.error || 'No se pudo liquidar el pago');
        }, 100);
      }
    } catch (err) {
      console.error('Error al procesar pago:', err);
      hideToast();
      setTimeout(() => {
        showToast('error', 'Error de conexión al liquidar pago');
      }, 100);
    } finally {
      setProcesando(null);
    }
  };

  if (loading) {
    return (
      <section className="bg-white rounded-xl shadow-lg p-8 mb-8">
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500 mx-auto mb-4"></div>
          <p>Cargando pagos...</p>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="bg-white rounded-xl shadow-lg p-8 mb-8">
        <div className="text-center text-red-600">
          <p>Error al cargar pagos a agricultores.</p>
          <p className="text-sm mt-2">Detalles: {error}</p>
          <button 
            onClick={cargarPagos}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Reintentar
          </button>
        </div>
      </section>
    );
  }
  return (
    <>
    <section className="bg-white rounded-xl shadow-lg p-8 mb-8">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-2xl font-extrabold flex items-center gap-2 text-green-900"><Users size={28} /> Pagos a Agricultores</h3>
        <span className="text-green-700 font-bold text-base cursor-pointer hover:underline">Ver todos</span>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full text-base">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-4 text-left font-semibold text-gray-800">ID</th>
              <th className="p-4 text-left font-semibold text-gray-800">Agricultor</th>
              <th className="p-4 text-right font-semibold text-gray-800">Ventas Totales</th>
              <th className="p-4 text-right font-semibold text-gray-800">Comisión</th>
              <th className="p-4 text-right font-semibold text-gray-800">A Liquidar</th>
              <th className="p-4 text-center font-semibold text-gray-800">Estado</th>
              <th className="p-4 text-center font-semibold text-gray-800">Acción</th>
            </tr>
          </thead>
          <tbody>
            {pagos.map((p: any) => (
              <tr key={p.id} className="border-b border-gray-200 hover:bg-green-50">
                <td className="p-4 text-left font-mono text-sm text-gray-800">{p.id}</td>
                <td className="p-4 text-left font-bold text-gray-900">{p.agricultor}</td>
                <td className="p-4 text-right font-bold text-gray-900">{p.ventas?.toLocaleString('es-CO', { style: 'currency', currency: 'COP' }) ?? '-'}</td>
                <td className="p-4 text-right font-semibold text-purple-700">{p.comision?.toLocaleString('es-CO', { style: 'currency', currency: 'COP' }) ?? '-'}</td>
                <td className="p-4 text-right font-bold text-green-700">{p.aPagar?.toLocaleString('es-CO', { style: 'currency', currency: 'COP' }) ?? '-'}</td>
                <td className="p-4 text-center">
                  {p.estado === 'pendiente' ? (
                    <span className="bg-yellow-200 text-yellow-900 px-3 py-1 rounded-full text-sm font-semibold shadow">Pendiente</span>
                  ) : p.estado === 'sin_ventas' ? (
                    <span className="bg-gray-200 text-gray-700 px-3 py-1 rounded-full text-sm font-semibold">Sin Ventas</span>
                  ) : p.estado === 'liquidado' ? (
                    <span className="bg-green-200 text-green-900 px-3 py-1 rounded-full text-sm font-semibold">Liquidado</span>
                  ) : (
                    <span className="bg-green-200 text-green-900 px-3 py-1 rounded-full text-sm font-semibold">Liquidado</span>
                  )}
                </td>
                <td className="p-4 text-center">
                  {p.estado === 'pendiente' ? (
                    <button 
                      onClick={() => handlePagar(p.agricultorId, p.aPagar, p.agricultor)}
                      disabled={procesando === p.agricultorId}
                      className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 text-sm font-bold shadow disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                      {procesando === p.agricultorId ? 'Liquidando...' : 'Liquidar'}
                    </button>
                  ) : (
                    <button 
                      onClick={() => abrirModal(p)}
                      className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 text-sm font-bold shadow transition-colors"
                    >
                      Ver
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>

    {/* Toast de notificaciones */}
    <Toast
      type={toast.type}
      message={toast.message}
      isVisible={toast.show}
      onClose={hideToast}
      autoClose={toast.type !== 'loading'}
    />

    {/* Modal de detalles de liquidación */}
    <LiquidacionModal
      isOpen={modalAbierto}
      onClose={cerrarModal}
      liquidacion={liquidacionSeleccionada}
    />
    </>
  );
}
