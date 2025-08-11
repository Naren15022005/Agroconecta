'use client';
import { useEffect, useState } from 'react';
import { CheckCircle, XCircle, RefreshCw, AlertCircle } from 'lucide-react';
import { LoadingModal } from './LoadingModal';

interface Pago {
  id: string;
  pedidoId: string;
  comprador: string;
  compradorEmail: string;
  agricultor: string;
  agricultorId: string;
  monto: number;
  estado: 'pendiente' | 'liberado' | 'devuelto';
  metodoPago: string;
  comprobanteUrl?: string;
  fecha: string;
  fechaCreacion: Date;
  productos: Array<{
    nombre: string;
    cantidad: number;
    precio: number;
  }>;
}

interface EstadisticasPagos {
  total: number;
  pendientes: number;
  liberados: number;
  devueltos: number;
}

export default function PagosAdminPanel() {
  const [pagos, setPagos] = useState<Pago[]>([]);
  const [estadisticas, setEstadisticas] = useState<EstadisticasPagos>({
    total: 0,
    pendientes: 0,
    liberados: 0,
    devueltos: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [procesando, setProcesando] = useState<string | null>(null);

  // Cargar datos de la API
  useEffect(() => {
    cargarPagos();
  }, []);

  const cargarPagos = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/pagos');
      const data = await response.json();

      if (data.success) {
        setPagos(data.data);
        setEstadisticas({
          total: data.total,
          pendientes: data.pendientes,
          liberados: data.liberados,
          devueltos: data.devueltos
        });
      } else {
        setError(data.error || 'Error al cargar pagos');
      }
    } catch (err) {
      setError('Error de conexión al cargar pagos');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const procesarAccion = async (pedidoId: string, accion: 'liberar' | 'devolver', motivo?: string) => {
    try {
      setProcesando(pedidoId);
      
      const response = await fetch('/api/admin/pagos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          pedidoId,
          accion,
          motivo
        })
      });

      const data = await response.json();

      if (data.success) {
        // Actualizar estado local
        setPagos(prev => 
          prev.map(pago => 
            pago.pedidoId === pedidoId 
              ? { ...pago, estado: accion === 'liberar' ? 'liberado' : 'devuelto' }
              : pago
          )
        );

        // Actualizar estadísticas
        setEstadisticas(prev => ({
          ...prev,
          pendientes: prev.pendientes - 1,
          [accion === 'liberar' ? 'liberados' : 'devueltos']: prev[accion === 'liberar' ? 'liberados' : 'devueltos'] + 1
        }));

        alert(`Pago ${accion === 'liberar' ? 'liberado' : 'devuelto'} exitosamente`);
      } else {
        alert('Error: ' + data.error);
      }
    } catch (err) {
      console.error('Error al procesar pago:', err);
      alert('Error de conexión al procesar pago');
    } finally {
      setProcesando(null);
    }
  };

  const handleLiberarPago = (pedidoId: string) => {
    if (confirm('¿Estás seguro de que quieres liberar este pago? Esta acción no se puede deshacer.')) {
      procesarAccion(pedidoId, 'liberar');
    }
  };

  const handleDevolverPago = (pedidoId: string) => {
    const motivo = prompt('Ingresa el motivo de la devolución (opcional):');
    if (confirm('¿Estás seguro de que quieres devolver este pago? Esta acción no se puede deshacer.')) {
      procesarAccion(pedidoId, 'devolver', motivo || undefined);
    }
  };

  if (loading) {
    return <LoadingModal isOpen={true} title="Cargando pagos" message="Por favor espera mientras se cargan los pagos registrados..." />;
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-red-600">
        <AlertCircle size={48} className="mb-4" />
        <h3 className="text-lg font-semibold mb-2">Error al cargar pagos</h3>
        <p className="text-center mb-4">{error}</p>
        <button 
          onClick={cargarPagos}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-600 text-sm font-medium">Total Pagos</p>
              <p className="text-2xl font-bold text-blue-900">{estadisticas.total}</p>
            </div>
            <RefreshCw className="h-8 w-8 text-blue-400" />
          </div>
        </div>
        
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-yellow-600 text-sm font-medium">Pendientes</p>
              <p className="text-2xl font-bold text-yellow-900">{estadisticas.pendientes}</p>
            </div>
            <RefreshCw className="h-8 w-8 text-yellow-400" />
          </div>
        </div>
        
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-600 text-sm font-medium">Liberados</p>
              <p className="text-2xl font-bold text-green-900">{estadisticas.liberados}</p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-400" />
          </div>
        </div>
        
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-red-600 text-sm font-medium">Devueltos</p>
              <p className="text-2xl font-bold text-red-900">{estadisticas.devueltos}</p>
            </div>
            <XCircle className="h-8 w-8 text-red-400" />
          </div>
        </div>
      </div>

      {/* Tabla de pagos */}
      <section className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Gestión de Pagos</h2>
          <button 
            onClick={cargarPagos}
            className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 flex items-center gap-1"
          >
            <RefreshCw size={16} />
            Actualizar
          </button>
        </div>
        
        {pagos.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>No hay pagos registrados en el sistema.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-100">
                  <th className="p-3 text-left">ID Pedido</th>
                  <th className="p-3 text-left">Comprador</th>
                  <th className="p-3 text-left">Agricultor</th>
                  <th className="p-3 text-left">Monto</th>
                  <th className="p-3 text-left">Estado</th>
                  <th className="p-3 text-left">Método</th>
                  <th className="p-3 text-left">Productos</th>
                  <th className="p-3 text-left">Fecha</th>
                  <th className="p-3 text-left">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {pagos.map((pago) => (
                  <tr key={pago.id} className="border-b hover:bg-gray-50">
                    <td className="p-3 font-mono text-xs">{pago.pedidoId}</td>
                    <td className="p-3">
                      <div>
                        <div className="font-medium">{pago.comprador}</div>
                        <div className="text-xs text-gray-500">{pago.compradorEmail}</div>
                      </div>
                    </td>
                    <td className="p-3">{pago.agricultor}</td>
                    <td className="p-3 font-semibold">${pago.monto.toLocaleString()}</td>
                    <td className="p-3">
                      {pago.estado === 'pendiente' && (
                        <span className="text-yellow-600 flex items-center gap-1">
                          <RefreshCw size={16} /> Pendiente
                        </span>
                      )}
                      {pago.estado === 'liberado' && (
                        <span className="text-green-600 flex items-center gap-1">
                          <CheckCircle size={16} /> Liberado
                        </span>
                      )}
                      {pago.estado === 'devuelto' && (
                        <span className="text-red-600 flex items-center gap-1">
                          <XCircle size={16} /> Devuelto
                        </span>
                      )}
                    </td>
                    <td className="p-3 text-xs">{pago.metodoPago}</td>
                    <td className="p-3">
                      <div className="max-w-xs">
                        {pago.productos.map((producto, index) => (
                          <div key={index} className="text-xs">
                            {producto.cantidad}x {producto.nombre}
                          </div>
                        ))}
                      </div>
                    </td>
                    <td className="p-3 text-xs">{pago.fecha}</td>
                    <td className="p-3">
                      {pago.estado === 'pendiente' && (
                        <div className="flex gap-1">
                          <button
                            className="px-2 py-1 bg-green-100 text-green-700 rounded hover:bg-green-200 text-xs disabled:opacity-50"
                            onClick={() => handleLiberarPago(pago.pedidoId)}
                            disabled={procesando === pago.pedidoId}
                          >
                            {procesando === pago.pedidoId ? '...' : 'Liberar'}
                          </button>
                          <button
                            className="px-2 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 text-xs disabled:opacity-50"
                            onClick={() => handleDevolverPago(pago.pedidoId)}
                            disabled={procesando === pago.pedidoId}
                          >
                            {procesando === pago.pedidoId ? '...' : 'Devolver'}
                          </button>
                        </div>
                      )}
                      {(pago.estado === 'liberado' || pago.estado === 'devuelto') && (
                        <span className="text-gray-400 text-xs">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
