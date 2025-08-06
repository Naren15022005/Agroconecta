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
    await fetch(`/api/pedidos`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, action: 'confirmar' }),
    });
    setPedidosPorAceptar(pedidosPorAceptar.filter((p: any) => p.id !== id));
  };

  const rechazarPedido = async (id: string) => {
    await fetch(`/api/pedidos`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status: 'CANCELADO' }),
    });
    setPedidosPorAceptar(pedidosPorAceptar.filter((p: any) => p.id !== id));
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
    <main className="max-w-6xl mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-6">Gestión de Pedidos</h1>
      <div className="mb-6 flex gap-4 border-b">
        <button
          className={`px-4 py-2 font-medium border-b-2 transition-colors duration-200 ${tab === 'recibidos' ? 'border-green-600 text-green-700' : 'border-transparent text-gray-500 hover:text-green-600'}`}
          onClick={() => setTab('recibidos')}
        >
          Pedidos Recibidos
        </button>
        <button
          className={`px-4 py-2 font-medium border-b-2 transition-colors duration-200 ${tab === 'gestion' ? 'border-green-600 text-green-700' : 'border-transparent text-gray-500 hover:text-green-600'}`}
          onClick={() => setTab('gestion')}
        >
          Gestión de Pedidos
        </button>
      </div>
      <div>
        {tab === 'recibidos' ? (
          <div>
            <h2 className="text-xl font-bold mb-4">Pedidos por aceptar</h2>
            <div className="flex flex-col gap-4">
              {pedidosPorAceptar.length === 0 ? (
                <div className="text-gray-400">No hay pedidos pendientes por aceptar.</div>
              ) : (
                pedidosPorAceptar.map((pedido: any) => (
                  <div key={pedido.id} className="bg-white rounded-lg shadow flex flex-row items-center p-4 gap-6 border border-gray-100 max-w-2xl">
                    <div className="flex-1">
                      <div className="font-bold text-green-700 text-lg mb-1">Pedido #{pedido.id.slice(-6)}</div>
                      <div className="text-xs text-gray-500 mb-1">{new Date(pedido.fechaPedido).toLocaleString()}</div>
                      <div className="text-sm text-gray-700 mb-1">Cliente: {pedido.cliente?.nombre} ({pedido.cliente?.telefono})</div>
                      <div className="text-xs text-gray-500 mb-1">Total: <span className="font-bold text-green-700">${pedido.total?.toLocaleString()}</span></div>
                      <ul className="text-xs text-gray-600 ml-4 list-disc mb-1">
                        {pedido.productos?.map((prod: any, i: number) => (
                          <li key={i}>{prod.nombre} x {prod.cantidad}</li>
                        ))}
                      </ul>
                    </div>
                    <div className="flex flex-col gap-2 min-w-[120px]">
                      <button className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700" onClick={() => aceptarPedido(pedido.id)}>Aceptar</button>
                      <button className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600" onClick={() => rechazarPedido(pedido.id)}>No aceptar</button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        ) : (
          <div>
            <h2 className="text-xl font-bold mb-4">Gestión de pedidos</h2>
            <PedidosCrudGestion pedidos={pedidosCrud} onVerDetalle={verDetalle} />
          </div>
        )}
      </div>
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

