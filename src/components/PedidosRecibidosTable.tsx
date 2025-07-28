// Tabla de pedidos recibidos para el agricultor
'use client';
import { useEffect, useState } from 'react';
import PedidoDetalleModal from './PedidoDetalleModal';

export interface PedidoItem {
  productoId: string;
  nombre: string;
  cantidad: number;
  precioUnitario: number;
}

export type EstadoPedido =
  | 'pendiente'
  | 'confirmado'
  | 'en_preparacion'
  | 'listo_envio'
  | 'en_camino'
  | 'listo_recoger'
  | 'entregado'
  | 'cancelado'
  | 'no_entregado';

export interface Pedido {
  id: string;
  cliente: {
    id: string;
    nombre: string;
    telefono: string;
    direccion: string;
  };
  estado: EstadoPedido;
  productos: PedidoItem[];
  total: number;
  metodoPago: string;
  metodoEntrega: string;
  fechaPedido: string;
  fechaEntrega?: string;
  historial: {
    estado: EstadoPedido;
    fecha: string;
    usuario: string;
    comentario?: string;
  }[];
}

export default function PedidosRecibidosTable() {
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [selected, setSelected] = useState<Pedido | null>(null);

  useEffect(() => {
    fetch('/api/agricultor/pedidos')
      .then(res => res.json())
      .then(data => setPedidos(data));
  }, []);

  return (
    <div className="bg-white rounded-xl shadow p-4">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b">
            <th># Pedido</th>
            <th>Fecha</th>
            <th>Cliente</th>
            <th>Estado</th>
            <th>Total</th>
            <th>Entrega</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {pedidos.map(p => (
            <tr key={p.id} className="border-b hover:bg-gray-50">
              <td>{p.id.slice(-6)}</td>
              <td>{new Date(p.fechaPedido).toLocaleDateString()}</td>
              <td>{p.cliente.nombre}</td>
              <td>
                <span className={`px-2 py-1 rounded text-xs font-semibold ${getEstadoColor(p.estado)}`}>
                  {estadoLabel(p.estado)}
                </span>
              </td>
              <td>${p.total.toLocaleString()}</td>
              <td>{p.metodoEntrega}</td>
              <td>
                <button
                  className="text-green-700 underline"
                  onClick={() => setSelected(p)}
                >
                  Ver detalles
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {selected && (
        <PedidoDetalleModal pedido={selected} onClose={() => setSelected(null)} />
      )}
    </div>
  );
}

function estadoLabel(estado: string) {
  const map: Record<string, string> = {
    pendiente: 'Pendiente',
    confirmado: 'Confirmado',
    en_preparacion: 'Preparando',
    listo_envio: 'Listo envío',
    en_camino: 'En camino',
    listo_recoger: 'Listo para recoger',
    entregado: 'Entregado',
    cancelado: 'Cancelado',
    no_entregado: 'No entregado',
  };
  return map[estado] || estado;
}

function getEstadoColor(estado: string) {
  switch (estado) {
    case 'pendiente':
      return 'bg-yellow-100 text-yellow-800';
    case 'confirmado':
      return 'bg-blue-100 text-blue-800';
    case 'en_preparacion':
      return 'bg-orange-100 text-orange-800';
    case 'listo_envio':
      return 'bg-cyan-100 text-cyan-800';
    case 'en_camino':
      return 'bg-indigo-100 text-indigo-800';
    case 'listo_recoger':
      return 'bg-purple-100 text-purple-800';
    case 'entregado':
      return 'bg-green-100 text-green-800';
    case 'cancelado':
    case 'no_entregado':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}
