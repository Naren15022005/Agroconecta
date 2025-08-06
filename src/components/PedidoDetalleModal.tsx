// Modal de detalle y gestión de pedido recibido
'use client';
import { Pedido } from './PedidosRecibidosTable';

interface Props {
  pedido: Pedido;
  onClose: () => void;
  onEstadoChanged?: () => void; // Callback para notificar cambios de estado
}

import { useState } from 'react';

export default function PedidoDetalleModal({ pedido, onClose, onEstadoChanged }: Props) {
  const [estado, setEstado] = useState(pedido.estado);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(''); // Estado para mensajes de éxito

  // Función para obtener el texto del botón según el método de pago
  const getBotonTexto = () => {
    switch (pedido.metodoPago) {
      case 'CONTRAENTREGA':
        return 'Confirmar contraentrega';
      case 'TRANSFERENCIA':
        return 'Confirmar transferencia recibida';
      case 'NEQUI':
        return 'Confirmar pago Nequi recibido';
      case 'DAVIPLATA':
        return 'Confirmar pago Daviplata recibido';
      case 'PASARELA':
        return 'Confirmar pago procesado';
      default:
        return 'Marcar en preparación';
    }
  };

  // Mapea los estados del frontend al backend
  const estadoMap: Record<string, string> = {
    pendiente: 'PENDIENTE',
    confirmado: 'CONFIRMADO',
    en_preparacion: 'EN_PREPARACION',
    listo_envio: 'EN_PUNTO',
    en_camino: 'EN_CAMINO',
    entregado: 'ENTREGADO',
    cancelado: 'CANCELADO',
  };

  const cambiarEstado = async (nuevo: string) => {
    setLoading(true);
    setError('');
    setSuccess(''); // Limpiar mensaje de éxito anterior
    try {
      let action: string;
      
      // Mapear estados frontend a acciones del backend
      switch (nuevo) {
        case 'confirmado':
          action = 'confirmar';
          break;
        case 'en_preparacion':
          action = 'marcar_pagado';
          break;
        case 'listo_envio':
          action = 'listo_envio';
          break;
        case 'en_camino':
          action = 'en_camino';
          break;
        case 'entregado':
          action = 'entregado';
          break;
        default:
          action = nuevo;
      }

      const res = await fetch(`/api/pedidos`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          id: pedido.id, 
          action: action,
          status: nuevo === 'cancelado' ? 'CANCELADO' : undefined
        }),
      });
      
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || 'Error al cambiar estado');
      } else {
        setEstado(nuevo);
        setError(''); // Limpiar errores
        setSuccess('Estado actualizado correctamente'); // Mostrar mensaje de éxito
        // Notificar al componente padre que hubo un cambio
        if (onEstadoChanged) {
          onEstadoChanged();
        }
        // Limpiar mensaje de éxito después de 3 segundos
        setTimeout(() => setSuccess(''), 3000);
      }
    } catch (e) {
      setError('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-xl shadow-xl max-w-lg w-full p-6 relative">
        <button className="absolute top-2 right-2 text-gray-500 hover:text-black" onClick={onClose}>
          ✕
        </button>
        <h2 className="text-xl font-bold mb-2">Pedido #{pedido.id.slice(-6)}</h2>
        <div className="mb-2 text-sm text-gray-600">{new Date(pedido.fechaPedido).toLocaleString()}</div>
        <div className="mb-2">
          <span className="font-semibold">Cliente:</span> {pedido.cliente.nombre} <br />
          <span className="font-semibold">Tel:</span> {pedido.cliente.telefono} <br />
          <span className="font-semibold">Dirección:</span> {pedido.cliente.direccion}
        </div>
        <div className="mb-2">
          <span className="font-semibold">Estado:</span> <span className="inline-block px-2 py-1 rounded text-xs font-semibold bg-gray-100 text-gray-800">{estado}</span>
        </div>
        <div className="mb-2">
          <span className="font-semibold">Método de entrega:</span> {pedido.metodoEntrega} <br />
          <span className="font-semibold">Método de pago:</span> {pedido.metodoPago}
          
          {/* Información específica del método de pago */}
          {pedido.metodoPago === 'CONTRAENTREGA' && estado === 'confirmado' && (
            <div className="mt-2 p-2 bg-yellow-50 border-l-4 border-yellow-400 text-sm">
              💡 <strong>Contraentrega:</strong> El cliente pagará al recibir el producto.
            </div>
          )}
          {['TRANSFERENCIA', 'NEQUI', 'DAVIPLATA'].includes(pedido.metodoPago) && estado === 'confirmado' && (
            <div className="mt-2 p-2 bg-blue-50 border-l-4 border-blue-400 text-sm">
              💳 <strong>Pago digital:</strong> Confirma cuando recibas el pago del cliente.
            </div>
          )}
          {pedido.metodoPago === 'PASARELA' && estado === 'confirmado' && (
            <div className="mt-2 p-2 bg-green-50 border-l-4 border-green-400 text-sm">
              ✅ <strong>Pago en línea:</strong> El pago se procesa automáticamente.
            </div>
          )}
        </div>
        <div className="mb-4">
          <span className="font-semibold">Productos:</span>
          <ul className="list-disc ml-6 mt-1">
            {pedido.productos.map(item => (
              <li key={item.productoId}>
                {item.nombre} x {item.cantidad} <span className="text-gray-500">@ ${item.precioUnitario.toLocaleString()}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="mb-4 font-bold text-lg">Total: ${pedido.total.toLocaleString()}</div>
        <div className="mb-4">
          <span className="font-semibold">Historial de estados:</span>
          <ol className="list-decimal ml-6 mt-1 text-xs">
            {pedido.historial.map((h, i) => (
              <li key={i}>
                <span className="font-semibold">{h.estado}</span> - {new Date(h.fecha).toLocaleString()} por {h.usuario}
                {h.comentario && <span className="text-gray-500"> — {h.comentario}</span>}
              </li>
            ))}
          </ol>
        </div>
        {error && <div className="text-red-600 mb-2 text-sm">{error}</div>}
        {success && <div className="text-green-600 mb-2 text-sm font-semibold">{success}</div>}
        <div className="flex gap-2 mt-4">
          {estado === 'pendiente' && (
            <>
              <button className="bg-green-600 text-white px-4 py-2 rounded disabled:opacity-50" disabled={loading} onClick={() => cambiarEstado('confirmado')}>Confirmar</button>
              <button className="bg-red-500 text-white px-4 py-2 rounded disabled:opacity-50" disabled={loading} onClick={() => cambiarEstado('cancelado')}>Cancelar</button>
            </>
          )}
          {estado === 'confirmado' && (
            <button className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50" disabled={loading} onClick={() => cambiarEstado('en_preparacion')}>
              {getBotonTexto()}
            </button>
          )}
          {estado === 'en_preparacion' && (
            <button className="bg-cyan-600 text-white px-4 py-2 rounded disabled:opacity-50" disabled={loading} onClick={() => cambiarEstado('listo_envio')}>Listo para envío</button>
          )}
          {estado === 'listo_envio' && (
            <button className="bg-indigo-600 text-white px-4 py-2 rounded disabled:opacity-50" disabled={loading} onClick={() => cambiarEstado('en_camino')}>En camino / Listo para recoger</button>
          )}
          {estado === 'en_camino' && (
            <button className="bg-green-700 text-white px-4 py-2 rounded disabled:opacity-50" disabled={loading} onClick={() => cambiarEstado('entregado')}>Marcar entregado</button>
          )}
        </div>
      </div>
    </div>
  );
}
