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
  const getEstadoBadge = (estado: string) => {
    const baseClasses = "px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide border";
    switch (estado.toLowerCase()) {
      case 'pendiente':
        return `${baseClasses} bg-yellow-600/20 text-yellow-300 border-yellow-700/40`;
      case 'confirmado':
        return `${baseClasses} bg-neutral-900/40 text-neutral-300 border-neutral-700`;
      case 'enviado':
        return `${baseClasses} bg-purple-600/20 text-purple-300 border-purple-700/40`;
      case 'entregado':
        return `${baseClasses} bg-green-600/15 text-green-300 border-green-700/40`;
      case 'cancelado':
        return `${baseClasses} bg-red-600/15 text-red-300 border-red-700/40`;
      default:
        return `${baseClasses} bg-neutral-900/40 text-neutral-300 border-neutral-700`;
    }
  };

  return (
    <div className="bg-neutral-800 rounded-xl shadow-sm border border-neutral-700 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm text-neutral-200">
          <thead>
            <tr className="bg-neutral-900 border-b border-neutral-700">
              <th className="px-4 sm:px-6 py-4 text-left text-xs font-semibold text-neutral-300 uppercase tracking-wider">
                Pedido #
              </th>
              <th className="px-4 sm:px-6 py-4 text-left text-xs font-semibold text-neutral-300 uppercase tracking-wider">
                Fecha
              </th>
              <th className="px-4 sm:px-6 py-4 text-left text-xs font-semibold text-neutral-300 uppercase tracking-wider">
                Cliente
              </th>
              <th className="px-4 sm:px-6 py-4 text-left text-xs font-semibold text-neutral-300 uppercase tracking-wider">
                Estado
              </th>
              <th className="px-4 sm:px-6 py-4 text-left text-xs font-semibold text-neutral-300 uppercase tracking-wider">
                Total
              </th>
              <th className="px-4 sm:px-6 py-4 text-left text-xs font-semibold text-neutral-300 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-700">
            {pedidos.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center">
                  <div className="flex flex-col items-center justify-center">
                    <div className="w-16 h-16 bg-neutral-900 border border-neutral-700 rounded-full flex items-center justify-center mb-4">
                      <svg className="w-8 h-8 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <p className="text-neutral-300 text-lg font-medium">No hay pedidos para mostrar</p>
                    <p className="text-neutral-400 text-sm mt-1">Los pedidos aparecerán aquí cuando los recibas</p>
                  </div>
                </td>
              </tr>
            ) : (
              pedidos.map((pedido, index) => (
                <tr key={pedido.id} className={`hover:bg-neutral-900 transition-colors duration-150 ${index % 2 === 0 ? 'bg-neutral-800' : 'bg-neutral-800/70'}`}>
                  <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                    <div className="font-mono text-sm font-semibold text-neutral-100">
                      #{pedido.id.slice(-6)}
                    </div>
                  </td>
                  <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-neutral-200">
                      {new Date(pedido.fechaPedido).toLocaleDateString('es-CO', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </div>
                    <div className="text-xs text-neutral-400">
                      {new Date(pedido.fechaPedido).toLocaleTimeString('es-CO', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>
                  </td>
                  <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-neutral-200">
                      {pedido.cliente.nombre}
                    </div>
                  </td>
                  <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                    <span className={getEstadoBadge(pedido.estado)}>
                      {pedido.estado}
                    </span>
                  </td>
                  <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                    <div className="text-lg font-bold text-green-400">
                      ${pedido.total.toLocaleString('es-CO')}
                    </div>
                  </td>
                  <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                    <button 
                      className="inline-flex items-center px-4 py-2 border border-neutral-700 text-sm font-medium rounded-lg text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-600/40 transition-all duration-150"
                      onClick={() => onVerDetalle(pedido.id)}
                    >
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      Ver detalle
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
