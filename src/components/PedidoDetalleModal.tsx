// Modal de detalle y gestión de pedido recibido
'use client';
import { Pedido } from './PedidosRecibidosTable';
import { useState } from 'react';
import Modal from './Modal';

interface Props {
  pedido: Pedido;
  onClose: () => void;
  onEstadoChanged?: () => void; // Callback para notificar cambios de estado
}

export default function PedidoDetalleModal({ pedido, onClose, onEstadoChanged }: Props) {
  const [estado, setEstado] = useState(pedido.estado);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(''); // Estado para mensajes de éxito

  // Función para obtener el texto del botón según el método de pago
  const getBotonTexto = () => {
    const metodo = pedido.metodoPago || metodoPago;
    switch (metodo) {
      case 'CONTRAENTREGA':
        return 'Confirmar contraentrega';
      case 'TRANSFERENCIA':
        return 'Confirmar pedido (pago a plataforma)';
      case 'NEQUI':
        return 'Confirmar pedido (pago a plataforma)';
      case 'DAVIPLATA':
        return 'Confirmar pedido (pago a plataforma)';
      case 'PASARELA':
        return 'Confirmar pago procesado';
      default:
        return 'Marcar en preparación';
    }
  };

  const getEstadoBadgeClasses = (estadoValue: string) => {
    const base = 'px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide border';
    switch (estadoValue) {
      case 'pendiente':
        return `${base} bg-yellow-600/20 text-yellow-300 border-yellow-700/40`;
      case 'confirmado':
        return `${base} bg-neutral-900/40 text-neutral-300 border-neutral-700`;
      case 'en_preparacion':
        return `${base} bg-orange-600/20 text-orange-300 border-orange-700/40`;
      case 'listo_envio':
        return `${base} bg-cyan-600/20 text-cyan-300 border-cyan-700/40`;
      case 'en_camino':
        return `${base} bg-indigo-600/20 text-indigo-300 border-indigo-700/40`;
      case 'entregado':
        return `${base} bg-green-600/15 text-green-300 border-green-700/40`;
      case 'cancelado':
      case 'no_entregado':
        return `${base} bg-red-600/15 text-red-300 border-red-700/40`;
      default:
        return `${base} bg-neutral-900/40 text-neutral-300 border-neutral-700`;
    }
  };

  // Mapea los estados del frontend al backend
  const cambiarEstado = async (nuevoEstado: 'confirmado' | 'en_preparacion' | 'listo_envio' | 'en_camino' | 'entregado' | 'cancelado') => {
    setLoading(true);
    setError('');
    setSuccess(''); // Limpiar mensaje de éxito anterior
    try {
      let action: string;
      
      // Mapear estados frontend a acciones del backend
      switch (nuevoEstado) {
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
          action = nuevoEstado;
      }

      const res = await fetch(`/api/pedidos`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          id: pedido.id, 
          action: action,
          status: nuevoEstado === 'cancelado' ? 'CANCELADO' : undefined
        }),
      });
      
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || 'Error al cambiar estado');
      } else {
        setEstado(nuevoEstado);
        setError(''); // Limpiar errores
        setSuccess('Estado actualizado correctamente'); // Mostrar mensaje de éxito
        // Notificar al componente padre que hubo un cambio
        if (onEstadoChanged) {
          onEstadoChanged();
        }
        // Limpiar mensaje de éxito después de 3 segundos
        setTimeout(() => setSuccess(''), 3000);
      }
    } catch {
      setError('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  const { id, cliente, total, metodoPago, metodoEntrega } = pedido;
  const fechaPedido =
    pedido.fechaPedido ||
    (pedido as unknown as { fechaCreacion?: string }).fechaCreacion ||
    new Date().toISOString();

  const productos =
    pedido.productos ||
    (pedido as unknown as { items?: Pedido['productos'] }).items ||
    ([] as Pedido['productos']);

  return (
    <Modal isOpen={true} onClose={onClose} size="4xl" variant="dark" showCloseButton={false}>
      <div className="flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-neutral-700 bg-neutral-900/60">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <h2 className="text-xl sm:text-2xl font-bold text-neutral-100">
                Detalle del Pedido #{id.slice(-6)}
              </h2>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <span className={getEstadoBadgeClasses(estado)}>{estado.replaceAll('_', ' ')}</span>
                <span className="text-sm text-neutral-400">
                  {new Date(fechaPedido).toLocaleDateString('es-CO', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>
            </div>

            <button
              className="shrink-0 rounded-lg border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm font-medium text-neutral-200 hover:bg-neutral-800"
              onClick={onClose}
              aria-label="Cerrar modal"
            >
              Cerrar
            </button>
          </div>
        </div>

        {/* Contenido */}
        <div className="max-h-[75vh] overflow-y-auto p-6 space-y-6">
          {/* Cliente */}
          <div className="bg-neutral-800 rounded-xl border border-neutral-700 p-5">
            <h3 className="text-lg font-semibold text-neutral-100 mb-4">Cliente</h3>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className="rounded-lg border border-neutral-700 bg-neutral-900/40 p-4">
                <div className="text-xs text-neutral-400">Nombre</div>
                <div className="mt-1 font-semibold text-neutral-100">{cliente?.nombre || 'Sin nombre'}</div>
              </div>
              <div className="rounded-lg border border-neutral-700 bg-neutral-900/40 p-4">
                <div className="text-xs text-neutral-400">Teléfono</div>
                <div className="mt-1 font-semibold text-neutral-100">{cliente?.telefono || 'Sin teléfono'}</div>
              </div>
              <div className="rounded-lg border border-neutral-700 bg-neutral-900/40 p-4">
                <div className="text-xs text-neutral-400">Dirección</div>
                <div className="mt-1 font-semibold text-neutral-100 break-words">{cliente?.direccion || 'Sin dirección'}</div>
              </div>
            </div>
          </div>

          {/* Método de entrega y pago */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-neutral-800 rounded-xl border border-neutral-700 p-5">
              <h4 className="font-semibold text-neutral-100 mb-2">Método de entrega</h4>
              <div className="text-sm text-neutral-200">{metodoEntrega || 'No especificado'}</div>
            </div>
            <div className="bg-neutral-800 rounded-xl border border-neutral-700 p-5">
              <h4 className="font-semibold text-neutral-100 mb-2">Método de pago</h4>
              <div className="text-sm text-neutral-200">{metodoPago || 'No especificado'}</div>
            </div>
          </div>
                
          {/* Información especial según método de pago */}
          {metodoPago === 'CONTRAENTREGA' && (
            <div className="bg-neutral-800 rounded-xl border border-yellow-700/40 p-4">
              <h4 className="font-semibold text-yellow-300">Pago contra entrega</h4>
              <p className="text-yellow-200/90 text-sm mt-1">
                El cliente pagará al momento de recibir el pedido. Total a recaudar:{' '}
                <strong>${total.toLocaleString('es-CO')}</strong>
              </p>
            </div>
          )}

          {['TRANSFERENCIA', 'NEQUI', 'DAVIPLATA'].includes(metodoPago || '') && (
            <div className="bg-neutral-800 rounded-xl border border-blue-700/40 p-4">
              <h4 className="font-semibold text-neutral-100">Pago electrónico</h4>
              <p className="text-neutral-300 text-sm mt-1">
                La plataforma ha confirmado el pago de <strong>${total.toLocaleString('es-CO')}</strong> vía{' '}
                {metodoPago}. Puedes proceder con la preparación del pedido.
              </p>
            </div>
          )}

          {metodoPago === 'PASARELA' && (
            <div className="bg-neutral-800 rounded-xl border border-green-700/40 p-4">
              <h4 className="font-semibold text-green-300">Pago procesado</h4>
              <p className="text-green-200/90 text-sm mt-1">
                El pago ya fue procesado exitosamente por <strong>${total.toLocaleString('es-CO')}</strong>
              </p>
            </div>
          )}

          {/* Productos del pedido */}
          <div className="bg-neutral-800 rounded-xl border border-neutral-700 p-5">
            <h4 className="font-semibold text-neutral-100 mb-4">Productos del pedido</h4>
            <div className="divide-y divide-neutral-700">
              {productos.map((item) => (
                <div key={item.productoId} className="py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <div className="min-w-0">
                    <div className="font-medium text-neutral-100 truncate">{item.nombre}</div>
                    <div className="text-sm text-neutral-400">
                      Precio unitario: ${item.precioUnitario.toLocaleString('es-CO')}
                    </div>
                  </div>
                  <div className="text-sm text-neutral-200 sm:text-right">
                    <div className="font-semibold">Cantidad: {item.cantidad}</div>
                    <div className="text-neutral-400">
                      Subtotal: ${(item.cantidad * item.precioUnitario).toLocaleString('es-CO')}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t border-neutral-700 flex items-center justify-between">
              <span className="text-lg font-semibold text-neutral-100">Total del pedido</span>
              <span className="text-2xl font-bold text-green-400">${total.toLocaleString('es-CO')}</span>
            </div>
          </div>

          {/* Mensajes de estado */}
          {error && (
            <div className="rounded-lg border border-red-700/40 bg-red-600/10 p-4 text-red-200">
              {error}
            </div>
          )}

          {success && (
            <div className="rounded-lg border border-green-700/40 bg-green-600/10 p-4 text-green-200">
              {success}
            </div>
          )}

          {/* Botones de acción */}
          <div className="bg-neutral-800 rounded-xl p-6 border border-neutral-700 space-y-3">
            {estado === 'pendiente' && (
              <button 
                className="w-full bg-green-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2" 
                disabled={loading} 
                onClick={() => cambiarEstado('confirmado')}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Confirmar Pedido</span>
              </button>
            )}
            {estado === 'confirmado' && (
              <button 
                className="w-full bg-green-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2" 
                disabled={loading} 
                onClick={() => cambiarEstado('en_preparacion')}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
                <span>{getBotonTexto()}</span>
              </button>
            )}
            {estado === 'en_preparacion' && (
              <button 
                className="w-full bg-green-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2" 
                disabled={loading} 
                onClick={() => cambiarEstado('listo_envio')}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
                <span>Listo para Envío</span>
              </button>
            )}
            {estado === 'listo_envio' && (
              <button 
                className="w-full bg-green-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2" 
                disabled={loading} 
                onClick={() => cambiarEstado('en_camino')}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <span>En Camino / Listo para Recoger</span>
              </button>
            )}
            {estado === 'en_camino' && (
              <button 
                className="w-full bg-green-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2" 
                disabled={loading} 
                onClick={() => cambiarEstado('entregado')}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Marcar como Entregado</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
}
