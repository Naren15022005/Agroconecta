"use client";


import { useEffect, useState } from 'react';
import PedidosPorAceptar from '@/components/PedidosPorAceptar';
import PedidosCrudGestion from '@/components/PedidosCrudGestion';
import PedidoDetalleModal from '@/components/PedidoDetalleModal';

export default function PedidosAgricultorPage() {
  const [tab, setTab] = useState<'recibidos' | 'gestion'>('recibidos');
  const [pedidosPorAceptar, setPedidosPorAceptar] = useState<any[]>([]);
  const [pedidosCrud, setPedidosCrud] = useState<any[]>([]);
  // Eliminar pedido de ejemplo: solo mostrar pedidos reales
  const [detalleId, setDetalleId] = useState<string|null>(null);
  const [detallePedido, setDetallePedido] = useState<any>(null);

  useEffect(() => {
    const fetchPedidos = () => {
      fetch('/api/agricultor/pedidos')
        .then(res => res.json())
        .then(data => {
          setPedidosPorAceptar(data.filter((p: any) => p.estado === 'pendiente'));
          setPedidosCrud(data.filter((p: any) => p.estado !== 'pendiente'));
        });
    };
    fetchPedidos();
    const interval = setInterval(fetchPedidos, 3000); // Actualiza cada 3 segundos
    return () => clearInterval(interval);
  }, []);

  const aceptarPedido = async (id: string) => {
    try {
      const res = await fetch(`/api/pedidos`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, action: 'confirmar' }),
      });
      if (!res.ok) {
        let data: any = {};
        try {
          data = await res.json();
        } catch (e) {
          try {
            const text = await res.text();
            console.error('Aceptar pedido error - raw text body:', text);
            data = { raw: text };
          } catch (e2) {
            console.error('Aceptar pedido error - no body');
          }
        }
        console.error('Aceptar pedido error:', res.status, res.statusText, data);
        alert(data.error || data.raw || 'Error al aceptar pedido');
        return;
      }
      setPedidosPorAceptar(pedidosPorAceptar.filter((p: any) => p.id !== id));
    } catch (e) {
      console.error('Aceptar pedido - network error', e);
      alert('Error de conexión al aceptar pedido');
    }
  };

  const rechazarPedido = async (id: string) => {
    try {
      const res = await fetch(`/api/pedidos`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: 'CANCELADO' }),
      });
      if (!res.ok) {
        let data: any = {};
        try {
          data = await res.json();
        } catch (e) {
          try {
            const text = await res.text();
            console.error('Rechazar pedido error - raw text body:', text);
            data = { raw: text };
          } catch (e2) {
            console.error('Rechazar pedido error - no body');
          }
        }
        console.error('Rechazar pedido error:', res.status, res.statusText, data);
        alert(data.error || data.raw || 'Error al rechazar pedido');
        return;
      }
      setPedidosPorAceptar(pedidosPorAceptar.filter((p: any) => p.id !== id));
    } catch (e) {
      console.error('Rechazar pedido - network error', e);
      alert('Error de conexión al rechazar pedido');
    }
  };

  const refrescarPedidos = () => {
    fetch('/api/agricultor/pedidos')
      .then(res => res.json())
      .then(data => {
        setPedidosPorAceptar(data.filter((p: any) => p.estado === 'pendiente'));
        setPedidosCrud(data.filter((p: any) => p.estado !== 'pendiente'));
        // Actualizar el detalle del pedido actual si está abierto
        if (detalleId) {
          const pedidoActualizado = data.find((p: any) => p.id === detalleId);
          if (pedidoActualizado) {
            setDetallePedido(pedidoActualizado);
          }
        }
      });
  };

  const verDetalle = (id: string) => {
    const pedido = pedidosCrud.find((p: any) => p.id === id);
    setDetallePedido(pedido);
    setDetalleId(id);
  };

  return (
    <main className="min-h-screen bg-neutral-900 py-8 text-neutral-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-neutral-100 mb-2">Gestión de Pedidos</h1>
          <p className="text-neutral-400">Administra los pedidos recibidos y gestiona su estado</p>
        </div>

        {/* Tabs */}
        <div className="mb-8">
          <div className="border-b border-neutral-700 bg-neutral-900 rounded-t-lg">
            <nav className="flex space-x-8 px-6" aria-label="Tabs">
              <button
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-all duration-200 ${
                  tab === 'recibidos' 
                    ? 'border-green-600 text-green-400 rounded-t-md' 
                    : 'border-transparent text-neutral-400 hover:text-neutral-300 hover:border-neutral-600'
                }`}
                onClick={() => setTab('recibidos')}
              >
                <div className="flex items-center space-x-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>Pedidos Recibidos</span>
                  {pedidosPorAceptar.length > 0 && (
                    <span className="bg-red-600/15 text-red-300 border border-red-700/40 text-xs px-2 py-1 rounded-full">
                      {pedidosPorAceptar.length}
                    </span>
                  )}
                </div>
              </button>
              <button
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-all duration-200 ${
                  tab === 'gestion' 
                    ? 'border-green-600 text-green-400 rounded-t-md' 
                    : 'border-transparent text-neutral-400 hover:text-neutral-300 hover:border-neutral-600'
                }`}
                onClick={() => setTab('gestion')}
              >
                <div className="flex items-center space-x-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  <span>Gestión de Pedidos</span>
                  {pedidosCrud.length > 0 && (
                    <span className="bg-blue-600/15 text-blue-300 border border-blue-700/40 text-xs px-2 py-1 rounded-full">
                      {pedidosCrud.length}
                    </span>
                  )}
                </div>
              </button>
            </nav>
          </div>
        </div>

        {/* Content */}
        <div className="bg-neutral-800 rounded-lg shadow-sm border border-neutral-700">
          {tab === 'recibidos' ? (
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-neutral-100">Pedidos por aceptar</h2>
                <div className="flex items-center space-x-2 text-sm text-neutral-400">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  <span>Actualización automática cada 3s</span>
                </div>
              </div>
              
              <div className="grid gap-6">
                {pedidosPorAceptar.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-20 h-20 bg-green-600/15 border border-green-700/40 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-10 h-10 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-medium text-neutral-100 mb-2">¡Todo al día!</h3>
                    <p className="text-neutral-400">No hay pedidos pendientes por aceptar.</p>
                  </div>
                ) : (
                  pedidosPorAceptar.map((pedido: any) => (
                    <div key={pedido.id} className="bg-neutral-900/60 border border-neutral-700 rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-200">
                      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
                        <div className="flex-1 space-y-3">
                          <div className="flex items-center space-x-3">
                            <div className="bg-yellow-600/20 text-yellow-300 border border-yellow-700/40 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide">
                              Nuevo Pedido
                            </div>
                            <div className="font-bold text-green-400 text-lg">
                              Pedido #{pedido.id.slice(-6)}
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            <div className="space-y-2">
                              <div className="flex items-center text-neutral-300">
                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a4 4 0 118 0v4M8 7a4 4 0 118 0V7m-8 0h8m-8 0H3a1 1 0 00-1 1v8a1 1 0 001 1h1M8 7v4" />
                                </svg>
                                <span className="font-medium">Cliente:</span>
                                <span className="ml-1">{pedido.cliente?.nombre}</span>
                              </div>
                              {pedido.cliente?.telefono && (
                                <div className="flex items-center text-neutral-300">
                                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                  </svg>
                                  <span>{pedido.cliente.telefono}</span>
                                </div>
                              )}
                              <div className="flex items-center text-neutral-300">
                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <span>{new Date(pedido.fechaPedido).toLocaleString('es-CO')}</span>
                              </div>
                            </div>
                            
                            <div className="space-y-2">
                              <div className="text-2xl font-bold text-green-400">
                                ${pedido.total?.toLocaleString('es-CO')}
                              </div>
                              <div className="text-xs text-neutral-400">Total del pedido</div>
                            </div>
                          </div>

                          <div className="bg-neutral-900 rounded-lg p-3 border border-neutral-700">
                            <div className="text-sm font-medium text-neutral-200 mb-2">Productos solicitados:</div>
                            <ul className="space-y-1 text-sm text-neutral-300">
                              {pedido.productos?.map((prod: any, i: number) => (
                                <li key={i} className="flex justify-between items-center py-1">
                                  <span>{prod.nombre}</span>
                                  <span className="font-medium">x {prod.cantidad}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                        
                        <div className="flex flex-col space-y-3 lg:ml-6">
                          <button 
                            className="w-full sm:w-auto bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors font-medium flex items-center justify-center space-x-2"
                            onClick={() => aceptarPedido(pedido.id)}
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            <span>Aceptar</span>
                          </button>
                          <button 
                            className="w-full sm:w-auto bg-red-500 text-white px-6 py-3 rounded-lg hover:bg-red-600 transition-colors font-medium flex items-center justify-center space-x-2"
                            onClick={() => rechazarPedido(pedido.id)}
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                            <span>Rechazar</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          ) : (
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-neutral-100">Gestión de pedidos</h2>
                <div className="text-sm text-neutral-400">
                  Total de pedidos: {pedidosCrud.length}
                </div>
              </div>
              <PedidosCrudGestion pedidos={pedidosCrud} onVerDetalle={verDetalle} />
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {detalleId && detallePedido && (
        <PedidoDetalleModal 
          pedido={detallePedido} 
          onClose={() => setDetalleId(null)} 
          onEstadoChanged={refrescarPedidos}
        />
      )}
    </main>
  );
}

