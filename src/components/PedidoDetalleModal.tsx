// Modal de detalle y gestión de pedido recibido
'use client';
import { Pedido } from './PedidosRecibidosTable';
import { useState } from 'react';

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
    } catch (e) {
      setError('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  const { id, cliente, total, metodoPago, metodoEntrega } = pedido;
  const fechaPedido = pedido.fechaPedido || (pedido as any).fechaCreacion || new Date().toISOString();
  const productos = pedido.productos || (pedido as any).items || [];

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-gray-800 bg-opacity-50 p-4 backdrop-blur-sm animate-in fade-in duration-300"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden relative transform transition-all scale-100 opacity-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header con gradiente mejorado */}
        <div className="bg-gradient-to-r from-green-600 via-green-500 to-emerald-500 px-6 py-4 relative overflow-hidden">
          {/* Patrón decorativo */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 left-0 w-32 h-32 bg-white rounded-full -translate-x-16 -translate-y-16"></div>
            <div className="absolute top-0 right-0 w-24 h-24 bg-white rounded-full translate-x-12 -translate-y-12"></div>
            <div className="absolute bottom-0 left-1/2 w-40 h-40 bg-white rounded-full -translate-x-20 translate-y-20"></div>
          </div>
          
          <div className="flex justify-between items-center relative z-10">
            <h2 className="text-2xl font-bold text-white flex items-center space-x-3">
              <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <span>Detalle del Pedido #{id}</span>
            </h2>
            <button 
              className="text-white/80 hover:text-white hover:bg-white/20 p-2 rounded-lg transition-all duration-200" 
              onClick={onClose}
              aria-label="Cerrar modal"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Contenido principal con scroll personalizado */}
        <div className="max-h-[calc(90vh-100px)] overflow-y-auto custom-scrollbar p-6 space-y-6">
          
          {/* Información del Cliente */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100 shadow-sm">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center mr-3">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-800">Información del Cliente</h3>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Nombre</p>
                    <p className="font-semibold text-gray-900">{cliente?.nombre || 'Sin nombre'}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Teléfono</p>
                    <p className="font-semibold text-gray-900">{cliente?.telefono || 'Sin teléfono'}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 lg:col-span-1">
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-500">Dirección</p>
                    <p className="font-semibold text-gray-900 break-words">{cliente?.direccion || 'Sin dirección'}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Estado del Pedido */}
          <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl p-6 border border-emerald-100 shadow-sm">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center mr-3">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-800">Estado del Pedido</h3>
            </div>
            
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className={`w-16 h-16 rounded-full flex items-center justify-center ${
                    estado === 'pendiente' ? 'bg-yellow-100' :
                    estado === 'confirmado' ? 'bg-blue-100' :
                    estado === 'en_preparacion' ? 'bg-orange-100' :
                    estado === 'listo_envio' ? 'bg-cyan-100' :
                    estado === 'en_camino' ? 'bg-indigo-100' :
                    estado === 'entregado' ? 'bg-green-100' :
                    estado === 'cancelado' ? 'bg-red-100' : 'bg-gray-100'
                  }`}>
                    <svg className={`w-8 h-8 ${
                      estado === 'pendiente' ? 'text-yellow-600' :
                      estado === 'confirmado' ? 'text-blue-600' :
                      estado === 'en_preparacion' ? 'text-orange-600' :
                      estado === 'listo_envio' ? 'text-cyan-600' :
                      estado === 'en_camino' ? 'text-indigo-600' :
                      estado === 'entregado' ? 'text-green-600' :
                      estado === 'cancelado' ? 'text-red-600' : 'text-gray-600'
                    }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 capitalize">
                      {estado.replace('_', ' ')}
                    </h4>
                    <p className="text-gray-600">
                      Fecha de creación: {new Date(fechaPedido).toLocaleDateString('es-CO', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                </div>
                
                <div className={`px-4 py-2 rounded-full text-sm font-semibold ${
                  estado === 'pendiente' ? 'bg-yellow-200 text-yellow-800' :
                  estado === 'confirmado' ? 'bg-blue-200 text-blue-800' :
                  estado === 'en_preparacion' ? 'bg-orange-200 text-orange-800' :
                  estado === 'listo_envio' ? 'bg-cyan-200 text-cyan-800' :
                  estado === 'en_camino' ? 'bg-indigo-200 text-indigo-800' :
                  estado === 'entregado' ? 'bg-green-200 text-green-800' :
                  estado === 'cancelado' ? 'bg-red-200 text-red-800' : 'bg-gray-200 text-gray-800'
                }`}>
                  {estado === 'pendiente' ? 'Pendiente de confirmación' :
                   estado === 'confirmado' ? 'Confirmado' :
                   estado === 'en_preparacion' ? 'En preparación' :
                   estado === 'listo_envio' ? 'Listo para envío' :
                   estado === 'en_camino' ? 'En camino' :
                   estado === 'entregado' ? 'Entregado' :
                   estado === 'cancelado' ? 'Cancelado' : 'Estado desconocido'}
                </div>
              </div>
            </div>
          </div>

          {/* Método de entrega y pago */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-purple-50 rounded-xl p-5">
              <h4 className="font-semibold text-purple-800 mb-2 flex items-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2M4 13h2m0 0V9a2 2 0 012-2h2m0 0V6a2 2 0 012-2h2a2 2 0 012 2v1m0 0v2a2 2 0 002 2h2m0 0v1" />
                </svg>
                Método de Entrega
              </h4>
              <div className="text-sm text-gray-900 font-medium">{metodoEntrega || 'No especificado'}</div>
            </div>

            <div className="bg-green-50 rounded-xl p-5">
              <h4 className="font-semibold text-green-800 mb-2 flex items-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
                Método de Pago
              </h4>
              <div className="text-sm text-gray-900 font-medium">{metodoPago || 'No especificado'}</div>
            </div>
          </div>

          {/* Información especial según método de pago */}
          {metodoPago === 'CONTRAENTREGA' && (
            <div className="bg-yellow-50 border-l-4 border-yellow-400 rounded-r-xl p-4">
              <div className="flex items-start">
                <div className="text-yellow-600 mr-3">💡</div>
                <div>
                  <h4 className="font-semibold text-yellow-800">Pago contra entrega</h4>
                  <p className="text-yellow-700 text-sm">El cliente pagará al momento de recibir el pedido. Total a recaudar: <strong>${total.toLocaleString('es-CO')}</strong></p>
                </div>
              </div>
            </div>
          )}

          {['TRANSFERENCIA', 'NEQUI', 'DAVIPLATA'].includes(metodoPago || '') && (
            <div className="bg-blue-50 border-l-4 border-blue-400 rounded-r-xl p-4">
              <div className="flex items-start">
                <div className="text-blue-600 mr-3">💳</div>
                <div>
                  <h4 className="font-semibold text-blue-800">Pago electrónico</h4>
                  <p className="text-blue-700 text-sm">Confirma cuando hayas recibido el pago de <strong>${total.toLocaleString('es-CO')}</strong> vía {metodoPago}</p>
                </div>
              </div>
            </div>
          )}

          {metodoPago === 'PASARELA' && (
            <div className="bg-green-50 border-l-4 border-green-400 rounded-r-xl p-4">
              <div className="flex items-start">
                <div className="text-green-600 mr-3">✅</div>
                <div>
                  <h4 className="font-semibold text-green-800">Pago procesado</h4>
                  <p className="text-green-700 text-sm">El pago ya fue procesado exitosamente por <strong>${total.toLocaleString('es-CO')}</strong></p>
                </div>
              </div>
            </div>
          )}

          {/* Productos del pedido */}
          <div className="bg-gray-50 rounded-xl p-5">
            <h4 className="font-semibold text-gray-800 mb-4 flex items-center">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              Productos del Pedido
            </h4>
            <div className="space-y-3">
              {productos.map((item: any) => (
                <div key={item.productoId} className="bg-white rounded-lg p-3 flex justify-between items-center">
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">{item.nombre}</div>
                    <div className="text-sm text-gray-500">Precio unitario: ${item.precioUnitario.toLocaleString('es-CO')}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-gray-900">Cantidad: {item.cantidad}</div>
                    <div className="text-sm text-gray-600">Subtotal: ${(item.cantidad * item.precioUnitario).toLocaleString('es-CO')}</div>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex justify-between items-center">
                <span className="text-lg font-semibold text-gray-900">Total del Pedido:</span>
                <span className="text-2xl font-bold text-green-600">${total.toLocaleString('es-CO')}</span>
              </div>
            </div>
          </div>

          {/* Mensajes de estado */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center">
                <svg className="w-5 h-5 text-red-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-red-700">{error}</p>
              </div>
            </div>
          )}

          {success && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center">
                <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-green-700">{success}</p>
              </div>
            </div>
          )}

          {/* Botones de acción */}
          <div className="bg-white rounded-xl p-6 border border-gray-200 space-y-3">
            {estado === 'pendiente' && (
              <button 
                className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2" 
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
                className="w-full bg-orange-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-orange-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2" 
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
                className="w-full bg-cyan-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-cyan-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2" 
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
                className="w-full bg-indigo-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2" 
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
                className="w-full bg-green-700 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2" 
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
    </div>
  );
}
