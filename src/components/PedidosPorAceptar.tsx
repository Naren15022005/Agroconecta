import React from 'react';

interface PedidoPorAceptar {
  id: string;
  cliente: { nombre: string; telefono: string };
  productos: { nombre: string; cantidad: number }[];
  total: number;
  fechaPedido: string;
}

interface Props {
  pedidos: PedidoPorAceptar[];
  onAceptar: (id: string) => void;
  onRechazar: (id: string) => void;
}

export default function PedidosPorAceptar({ pedidos, onAceptar, onRechazar }: Props) {
  if (pedidos.length === 0) {
    return <div className="text-gray-500">No hay pedidos pendientes por aceptar.</div>;
  }
  return (
    <div className="grid grid-cols-1 gap-4">
      {pedidos.map((pedido) => (
        <div key={pedido.id} className="bg-white rounded-lg shadow p-4 flex flex-col gap-2 border border-gray-100">
          <div className="flex justify-between items-center">
            <div>
              <div className="font-bold">Pedido #{pedido.id.slice(-6)}</div>
              <div className="text-xs text-gray-500">{new Date(pedido.fechaPedido).toLocaleString()}</div>
            </div>
            <div className="text-green-700 font-bold text-lg">${pedido.total.toLocaleString()}</div>
          </div>
          <div className="text-sm text-gray-700">Cliente: {pedido.cliente.nombre} ({pedido.cliente.telefono})</div>
          <ul className="text-xs text-gray-600 ml-4 list-disc">
            {pedido.productos.map((prod, i) => (
              <li key={i}>{prod.nombre} x {prod.cantidad}</li>
            ))}
          </ul>
          <div className="flex gap-2 mt-2">
            <button className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700" onClick={() => onAceptar(pedido.id)}>Aceptar</button>
            <button className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600" onClick={() => onRechazar(pedido.id)}>No aceptar</button>
          </div>
        </div>
      ))}
    </div>
  );
}
