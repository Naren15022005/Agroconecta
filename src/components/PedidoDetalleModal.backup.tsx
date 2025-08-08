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
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900 bg-opacity-75 p-4 backdrop-blur-sm animate-in fade-in duration-300"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[95vh] overflow-hidden animate-in slide-in-from-bottom-4 duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header con gradiente mejorado */}
        <div className="bg-gradient-to-br from-green-600 via-green-500 to-emerald-500 text-white p-8 relative overflow-hidden">
          {/* Patrón de fondo sutil */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 left-0 w-32 h-32 rounded-full bg-white transform -translate-x-16 -translate-y-16"></div>
            <div className="absolute bottom-0 right-0 w-24 h-24 rounded-full bg-white transform translate-x-12 translate-y-12"></div>
          </div>
          
          <button 
            className="absolute top-6 right-6 text-white hover:text-gray-200 transition-all duration-200 w-10 h-10 flex items-center justify-center rounded-full hover:bg-white hover:bg-opacity-20 focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50" 
            onClick={onClose}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          
          <div className="relative z-10">
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div>
                <h2 className="text-3xl font-bold">Pedido #{pedido.id.slice(-6)}</h2>
                <p className="text-green-100 text-lg">
                  {new Date(pedido.fechaPedido).toLocaleDateString('es-CO', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Contenido con scroll personalizado */}
        <div className="max-h-[calc(95vh-200px)] overflow-y-auto custom-scrollbar">
          <div className="p-8 space-y-8">
            {/* Cliente Info mejorado */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100 shadow-sm">
              <h3 className="font-bold text-gray-900 mb-4 flex items-center text-lg">
                <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center mr-3">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                Información del Cliente
              </h3>
              
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">Nombre</p>
                      <p className="text-gray-900 font-semibold">{pedido.cliente.nombre}</p>
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
                      <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">Teléfono</p>
                      <p className="text-gray-900 font-semibold">{pedido.cliente.telefono}</p>
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
                      <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">Dirección</p>
                      <p className="text-gray-900 font-semibold text-sm leading-relaxed">{pedido.cliente.direccion}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Estado Actual mejorado */}
            <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl p-6 border border-emerald-100 shadow-sm">
              <h3 className="font-bold text-gray-900 mb-4 flex items-center text-lg">
                <div className="w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center mr-3">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                Estado del Pedido
              </h3>
              
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className={`w-16 h-16 rounded-full flex items-center justify-center ${
                      estado === 'pendiente' ? 'bg-yellow-100' :
                      estado === 'confirmado' ? 'bg-blue-100' :
                      estado === 'en_preparacion' ? 'bg-purple-100' :
                      estado === 'entregado' ? 'bg-green-100' :
                      'bg-gray-100'
                    }`}>
                      <svg className={`w-8 h-8 ${
                        estado === 'pendiente' ? 'text-yellow-600' :
                        estado === 'confirmado' ? 'text-blue-600' :
                        estado === 'en_preparacion' ? 'text-purple-600' :
                        estado === 'entregado' ? 'text-green-600' :
                        'text-gray-600'
                      }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        {estado === 'pendiente' && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />}
                        {estado === 'confirmado' && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />}
                        {estado === 'en_preparacion' && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />}
                        {estado === 'entregado' && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />}
                      </svg>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">Estado Actual</p>
                      <p className={`text-2xl font-bold ${
                        estado === 'pendiente' ? 'text-yellow-600' :
                        estado === 'confirmado' ? 'text-blue-600' :
                        estado === 'en_preparacion' ? 'text-purple-600' :
                        estado === 'entregado' ? 'text-green-600' :
                        'text-gray-600'
                      }`}>
                        {estado.toUpperCase().replace('_', ' ')}
                      </p>
                    </div>
                  </div>
                  
                  <div className={`px-4 py-2 rounded-full text-sm font-semibold ${
                    estado === 'pendiente' ? 'bg-yellow-100 text-yellow-800 border border-yellow-200' :
                    estado === 'confirmado' ? 'bg-blue-100 text-blue-800 border border-blue-200' :
                    estado === 'en_preparacion' ? 'bg-purple-100 text-purple-800 border border-purple-200' :
                    estado === 'entregado' ? 'bg-green-100 text-green-800 border border-green-200' :
                    'bg-gray-100 text-gray-800 border border-gray-200'
                  }`}>
                    {estado === 'pendiente' && '⏳ Por Confirmar'}
                    {estado === 'confirmado' && '✅ Confirmado'}
                    {estado === 'en_preparacion' && '👨‍🍳 En Preparación'}
                    {estado === 'entregado' && '🚚 Entregado'}
                  </div>
                </div>
              </div>
            </div>

          {/* Métodos de Entrega y Pago */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-purple-50 rounded-xl p-5">
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                <svg className="w-5 h-5 mr-2 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
                Entrega
              </h3>
              <div className="text-sm text-gray-900 font-medium">{pedido.metodoEntrega}</div>
            </div>
            
            <div className="bg-green-50 rounded-xl p-5">
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                <svg className="w-5 h-5 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
                Pago
              </h3>
              <div className="text-sm text-gray-900 font-medium">{pedido.metodoPago}</div>
            </div>
          </div>

          {/* Información específica del método de pago */}
          {pedido.metodoPago === 'CONTRAENTREGA' && estado === 'confirmado' && (
            <div className="bg-yellow-50 border-l-4 border-yellow-400 rounded-r-xl p-4">
              <div className="flex items-start">
                <div className="text-yellow-600 mr-3">💡</div>
                <div>
                  <h4 className="text-sm font-semibold text-yellow-800">Contraentrega</h4>
                  <p className="text-sm text-yellow-700 mt-1">El cliente pagará al recibir el producto.</p>
                </div>
              </div>
            </div>
          )}
          
          {['TRANSFERENCIA', 'NEQUI', 'DAVIPLATA'].includes(pedido.metodoPago) && estado === 'confirmado' && (
            <div className="bg-blue-50 border-l-4 border-blue-400 rounded-r-xl p-4">
              <div className="flex items-start">
                <div className="text-blue-600 mr-3">💳</div>
                <div>
                  <h4 className="text-sm font-semibold text-blue-800">Pago Digital</h4>
                  <p className="text-sm text-blue-700 mt-1">Confirma cuando recibas el pago del cliente.</p>
                </div>
              </div>
            </div>
          )}
          
          {pedido.metodoPago === 'PASARELA' && estado === 'confirmado' && (
            <div className="bg-green-50 border-l-4 border-green-400 rounded-r-xl p-4">
              <div className="flex items-start">
                <div className="text-green-600 mr-3">✅</div>
                <div>
                  <h4 className="text-sm font-semibold text-green-800">Pago en Línea</h4>
                  <p className="text-sm text-green-700 mt-1">El pago se procesa automáticamente.</p>
                </div>
              </div>
            </div>
          )}

          {/* Productos */}
          <div className="bg-gray-50 rounded-xl p-5">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
              <svg className="w-5 h-5 mr-2 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
              Productos Solicitados
            </h3>
            <div className="space-y-3">
              {pedido.productos.map(item => (
                <div key={item.productoId} className="bg-white rounded-lg p-3 flex justify-between items-center">
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">{item.nombre}</div>
                    <div className="text-sm text-gray-500">Precio unitario: ${item.precioUnitario.toLocaleString('es-CO')}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-gray-900">x {item.cantidad}</div>
                    <div className="text-sm text-green-600 font-medium">
                      ${(item.precioUnitario * item.cantidad).toLocaleString('es-CO')}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Total */}
          <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-5 border border-green-200">
            <div className="flex justify-between items-center">
              <span className="text-lg font-semibold text-gray-900">Total del Pedido:</span>
              <span className="text-2xl font-bold text-green-600">${pedido.total.toLocaleString('es-CO')}</span>
            </div>
          </div>

          {/* Historial */}
          <div className="bg-gray-50 rounded-xl p-5">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
              <svg className="w-5 h-5 mr-2 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Historial de Estados
            </h3>
            <div className="space-y-2">
              {pedido.historial.map((h, i) => (
                <div key={i} className="bg-white rounded-lg p-3 border-l-4 border-blue-400">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="font-semibold text-gray-900">{h.estado}</span>
                      <span className="text-gray-600 ml-2">por {h.usuario}</span>
                      {h.comentario && <div className="text-sm text-gray-500 mt-1">{h.comentario}</div>}
                    </div>
                    <span className="text-xs text-gray-500">{new Date(h.fecha).toLocaleString('es-CO')}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Messages */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4">
              <div className="flex items-center">
                <svg className="w-5 h-5 text-red-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-red-700 font-medium">{error}</span>
              </div>
            </div>
          )}
          
          {success && (
            <div className="bg-green-50 border border-green-200 rounded-xl p-4">
              <div className="flex items-center">
                <svg className="w-5 h-5 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-green-700 font-medium">{success}</span>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3 pt-4 border-t border-gray-200">
            {estado === 'pendiente' && (
              <>
                <button 
                  className="flex-1 bg-green-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2" 
                  disabled={loading} 
                  onClick={() => cambiarEstado('confirmado')}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Confirmar Pedido</span>
                </button>
                <button 
                  className="flex-1 bg-red-500 text-white px-6 py-3 rounded-lg font-medium hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2" 
                  disabled={loading} 
                  onClick={() => cambiarEstado('cancelado')}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  <span>Cancelar</span>
                </button>
              </>
            )}
            {estado === 'confirmado' && (
              <button 
                className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2" 
                disabled={loading} 
                onClick={() => cambiarEstado('en_preparacion')}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
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
