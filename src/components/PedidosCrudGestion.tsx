import React from 'react';

interface PedidoCrud {
  id: string;
  estado: string;
  cliente: { nombre: string };
  total: number;
  fechaPedido: string;
}

interface Props {
  pedidos: PedidoCrud[];
  onVerDetalle: (id: string) => void;
}

export default function PedidosCrudGestion({ pedidos, onVerDetalle }: Props) {
  return (
    <table className="min-w-full bg-white rounded shadow text-sm">
      <thead>
        <tr className="bg-gray-100">
          <th className="p-2 text-left">#</th>
          <th className="p-2 text-left">Fecha</th>
          <th className="p-2 text-left">Cliente</th>
          <th className="p-2 text-left">Estado</th>
          <th className="p-2 text-left">Total</th>
          <th className="p-2 text-left">Acciones</th>
        </tr>
      </thead>
      <tbody>
        {pedidos.length === 0 ? (
          <tr>
            <td colSpan={6} className="p-4 text-center text-gray-400">No hay pedidos para mostrar.</td>
          </tr>
        ) : (
          pedidos.map((pedido) => (
            <tr key={pedido.id} className="border-b hover:bg-gray-50">
              <td className="p-2 font-mono">{pedido.id.slice(-6)}</td>
              <td className="p-2">{new Date(pedido.fechaPedido).toLocaleString()}</td>
              <td className="p-2">{pedido.cliente.nombre}</td>
              <td className="p-2">
                <span className="px-2 py-1 rounded text-xs font-semibold bg-gray-100 text-gray-800">{pedido.estado}</span>
              </td>
              <td className="p-2 font-bold text-green-700">${pedido.total.toLocaleString()}</td>
              <td className="p-2">
                <button className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700" onClick={() => onVerDetalle(pedido.id)}>
                  Ver detalle
                </button>
              </td>
            </tr>
          ))
        )}
      </tbody>
    </table>
  );
}
