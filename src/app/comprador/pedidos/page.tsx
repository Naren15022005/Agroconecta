"use client";

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Package, Clock, CheckCircle, XCircle, Truck, MapPin } from 'lucide-react';

interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  price: number;
  unit: string;
  product?: {
    id: string;
    name: string;
    price: number;
    agricultor: {
      user: {
        nombre: string;
        correo: string;
      };
    };
  };
}

interface Order {
  id: string;
  buyerId: string;
  agricultorId: string;
  status: string;
  total: number;
  address: string;
  deliveryMethod: string;
  paymentMethod: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  items: OrderItem[];
  agricultor: {
    user: {
      nombre: string;
      correo: string;
    };
  };
}

export default function CompradorPedidosPage() {
  const [filtroEstado, setFiltroEstado] = useState<string>('');
  const [fechaInicio, setFechaInicio] = useState<string>('');
  const [fechaFin, setFechaFin] = useState<string>('');
  const { data: session } = useSession();
  const [pedidos, setPedidos] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [cancelingId, setCancelingId] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string>('');

  useEffect(() => {
    const cargarPedidos = async () => {
      if (!session?.user?.id && !session?.user?.email) return;
      
      try {
        const buyerId = session.user.id || session.user.email;
        const response = await fetch(`/api/pedidos?buyerId=${buyerId}`);
        const data = await response.json();
        
        console.log('Response data:', data); // Debug temporal
        
        if (response.ok && data.success) {
          setPedidos(data.data || []);
        } else {
          console.error('API Error:', data); // Debug temporal
          setError(data.error || 'Error al cargar pedidos');
        }
      } catch (err) {
        setError('Error de conexión');
        console.error('Error:', err);
      } finally {
        setLoading(false);
      }
    };

    cargarPedidos();
  }, [session]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PENDIENTE':
        return <Clock className="h-6 w-6 text-yellow-600" />;
      case 'CONFIRMADO':
        return <CheckCircle className="h-6 w-6 text-blue-600" />;
      case 'EN_PREPARACION':
        return <Package className="h-6 w-6 text-orange-600" />;
      case 'EN_CAMINO':
        return <Truck className="h-6 w-6 text-purple-600" />;
      case 'EN_PUNTO':
        return <MapPin className="h-6 w-6 text-purple-600" />;
      case 'ENTREGADO':
        return <CheckCircle className="h-6 w-6 text-green-600" />;
      case 'CANCELADO':
        return <XCircle className="h-6 w-6 text-red-600" />;
      case 'NO_ENTREGADO':
        return <XCircle className="h-6 w-6 text-red-600" />;
      default:
        return <Clock className="h-6 w-6 text-gray-600" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'PENDIENTE':
        return { text: 'Pendiente', color: 'text-yellow-700 bg-yellow-100' };
      case 'CONFIRMADO':
        return { text: 'Confirmado', color: 'text-blue-700 bg-blue-100' };
      case 'EN_PREPARACION':
        return { text: 'En Preparación', color: 'text-orange-700 bg-orange-100' };
      case 'EN_CAMINO':
        return { text: 'En Camino', color: 'text-purple-700 bg-purple-100' };
      case 'EN_PUNTO':
        return { text: 'En Punto de Encuentro', color: 'text-purple-700 bg-purple-100' };
      case 'ENTREGADO':
        return { text: 'Entregado', color: 'text-green-700 bg-green-100' };
      case 'CANCELADO':
        return { text: 'Cancelado', color: 'text-red-700 bg-red-100' };
      case 'NO_ENTREGADO':
        return { text: 'No Entregado', color: 'text-red-700 bg-red-100' };
      default:
        return { text: status, color: 'text-gray-700 bg-gray-100' };
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-CO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const cancelarPedido = async (pedidoId: string) => {
    setCancelingId(pedidoId);
    setSuccessMsg('');
    try {
      const res = await fetch(`/api/pedidos`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: pedidoId, status: 'CANCELADO' })
      });
      if (res.ok) {
        setPedidos((prev) => prev.map(p => p.id === pedidoId ? { ...p, status: 'CANCELADO' } : p));
        setSuccessMsg('Pedido cancelado correctamente.');
      } else {
        setError('No se pudo cancelar el pedido');
      }
    } catch {
      setError('Error de conexión al cancelar');
    } finally {
      setCancelingId(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando pedidos...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  // Filtrar pedidos por estado y fechas
  const pedidosFiltrados = pedidos.filter(p => {
    if (filtroEstado && p.status !== filtroEstado) return false;
    if (fechaInicio && new Date(p.createdAt) < new Date(fechaInicio)) return false;
    if (fechaFin && new Date(p.createdAt) > new Date(fechaFin)) return false;
    return true;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Mensaje de éxito */}
        {successMsg && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3">
            <svg className="w-6 h-6 text-green-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <p className="text-green-800 font-medium">{successMsg}</p>
            </div>
            <button 
              onClick={() => setSuccessMsg('')}
              className="ml-auto text-green-600 hover:text-green-800"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}

        <div className="mb-8">
          <div className="text-center sm:text-left">
            <h1 className="text-3xl font-bold text-gray-900">Historial de Pedidos</h1>
            <p className="mt-2 text-gray-600">
              Consulta todos tus pedidos realizados, incluyendo cancelados y entregados.
            </p>
          </div>
          
          {/* Panel de filtros mejorado */}
          <div className="mt-6 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
              <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.707A1 1 0 013 7V4z" />
              </svg>
              Filtros de búsqueda
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Filtro por estado */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Estado del pedido
                </label>
                <select 
                  value={filtroEstado} 
                  onChange={e => setFiltroEstado(e.target.value)} 
                  className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white text-gray-900 font-medium cursor-pointer hover:border-gray-400 transition-colors"
                >
                  <option value="" className="text-gray-600">Todos los estados</option>
                  <option value="PENDIENTE" className="text-amber-600">Pendiente</option>
                  <option value="CONFIRMADO" className="text-sky-600">Confirmado</option>
                  <option value="EN_PREPARACION" className="text-orange-500">En Preparación</option>
                  <option value="EN_CAMINO" className="text-violet-500">En Camino</option>
                  <option value="EN_PUNTO" className="text-indigo-500">En Punto de Encuentro</option>
                  <option value="ENTREGADO" className="text-emerald-600">Entregado</option>
                  <option value="CANCELADO" className="text-rose-500">Cancelado</option>
                  <option value="NO_ENTREGADO" className="text-red-400">No Entregado</option>
                </select>
              </div>

              {/* Filtro fecha inicio */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Desde
                </label>
                <input 
                  type="date" 
                  value={fechaInicio} 
                  onChange={e => setFechaInicio(e.target.value)} 
                  className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white text-gray-900 font-semibold text-base hover:border-gray-400 transition-colors"
                  style={{
                    colorScheme: 'light',
                    backgroundColor: '#ffffff',
                    color: '#1f2937',
                    fontSize: '16px',
                    fontWeight: '600'
                  }}
                  placeholder="Seleccionar fecha"
                />
              </div>

              {/* Filtro fecha fin */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Hasta
                </label>
                <input 
                  type="date" 
                  value={fechaFin} 
                  onChange={e => setFechaFin(e.target.value)} 
                  className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white text-gray-900 font-semibold text-base hover:border-gray-400 transition-colors"
                  style={{
                    colorScheme: 'light',
                    backgroundColor: '#ffffff',
                    color: '#1f2937',
                    fontSize: '16px',
                    fontWeight: '600'
                  }}
                  placeholder="Seleccionar fecha"
                />
              </div>
            </div>

            {/* Botones de acción */}
            <div className="mt-4 flex flex-wrap gap-2">
              <button
                onClick={() => {
                  setFiltroEstado('');
                  setFechaInicio('');
                  setFechaFin('');
                }}
                className="px-4 py-2 text-sm text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors duration-200 flex items-center gap-1"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Limpiar filtros
              </button>
              
              {(filtroEstado || fechaInicio || fechaFin) && (
                <div className="flex items-center gap-2 px-3 py-2 bg-green-50 text-green-700 rounded-lg text-sm">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Mostrando {pedidosFiltrados.length} de {pedidos.length} pedidos
                </div>
              )}
            </div>
          </div>
        </div>

        {pedidosFiltrados.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow-sm border border-gray-200">
            {pedidos.length === 0 ? (
              // No tiene pedidos en absoluto
              <>
                <Package className="mx-auto h-16 w-16 text-gray-400 mb-4" />
                <h3 className="text-xl font-medium text-gray-900 mb-2">
                  No tienes pedidos aún
                </h3>
                <p className="text-gray-500 mb-6 max-w-sm mx-auto">
                  Cuando realices tu primer pedido, aparecerá aquí para que puedas hacer seguimiento.
                </p>
                <a
                  href="/comprador/mercado"
                  className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-green-600 hover:bg-green-700 transition-colors duration-200 shadow-sm"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                  Explorar Mercado
                </a>
              </>
            ) : (
              // Tiene pedidos pero no coinciden con los filtros
              <>
                <svg className="mx-auto h-16 w-16 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <h3 className="text-xl font-medium text-gray-900 mb-2">
                  No encontramos pedidos
                </h3>
                <p className="text-gray-500 mb-6 max-w-sm mx-auto">
                  No hay pedidos que coincidan con los filtros seleccionados. Prueba ajustando los filtros o quitándolos.
                </p>
                <button
                  onClick={() => {
                    setFiltroEstado('');
                    setFechaInicio('');
                    setFechaFin('');
                  }}
                  className="inline-flex items-center px-6 py-3 border border-gray-300 text-base font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-colors duration-200 shadow-sm"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Limpiar filtros
                </button>
              </>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            {pedidosFiltrados.map((pedido) => {
              const statusInfo = getStatusText(pedido.status);
              return (
                <div key={pedido.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-200">
                  {/* Header del pedido mejorado */}
                  <div className="bg-gradient-to-r from-green-50 to-blue-50 px-6 py-5 border-b border-gray-100">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div className="flex-shrink-0">
                          {getStatusIcon(pedido.status)}
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-gray-900 tracking-tight">
                            Pedido #{pedido.id.slice(-8)}
                          </h3>
                          <p className="text-base text-green-700 font-medium flex items-center gap-2 mt-1">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                            </svg>
                            {pedido.items?.[0]?.product?.agricultor?.user?.nombre || 'Agricultor'}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold ${statusInfo.color} shadow-sm border border-current border-opacity-20`}>
                          {statusInfo.text}
                        </span>
                        <p className="text-sm text-gray-500 mt-2 flex items-center justify-end gap-1">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          {formatDate(pedido.createdAt)}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Contenido del pedido mejorado */}
                  <div className="px-6 py-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                      {/* Productos */}
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                          <Package size={20} className="text-green-600" /> 
                          Productos Pedidos
                        </h4>
                        <div className="space-y-3">
                          {pedido.items.map((item) => (
                            <div key={item.id} className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                              <div className="flex justify-between items-start">
                                <div className="flex-1">
                                  <h5 className="font-medium text-gray-900 capitalize">
                                    {item.productName || item.product?.name || 'Producto'}
                                  </h5>
                                  <p className="text-sm text-gray-600 mt-1">
                                    Cantidad: {item.quantity} {item.unit}
                                  </p>
                                  <p className="text-xs text-gray-500 mt-1">
                                    Precio unitario: ${item.price.toLocaleString()}
                                  </p>
                                </div>
                                <div className="text-right ml-4">
                                  <p className="font-bold text-green-700 text-lg">
                                    ${(item.price * item.quantity).toLocaleString()}
                                  </p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                        <div className="mt-4 pt-4 border-t border-gray-200">
                          <div className="flex justify-between items-center">
                            <span className="text-lg font-bold text-gray-900">Total del Pedido:</span>
                            <span className="text-2xl font-bold text-green-700">
                              ${pedido.total.toLocaleString()}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Información de entrega */}
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                          <Truck size={20} className="text-blue-600" /> 
                          Información de Entrega
                        </h4>
                        <div className="space-y-4">
                          <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
                            <div className="flex items-start gap-3">
                              <MapPin size={16} className="text-blue-600 mt-1 flex-shrink-0" />
                              <div>
                                <p className="font-medium text-gray-900 mb-1">Dirección de entrega</p>
                                <p className="text-gray-700">{pedido.address}</p>
                              </div>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 gap-4">
                            <div className="bg-gray-50 rounded-lg p-4">
                              <div className="flex items-center gap-2 mb-2">
                                <Truck size={16} className="text-gray-600" />
                                <span className="font-medium text-gray-900">Método de entrega</span>
                              </div>
                              <p className="text-gray-700 capitalize">
                                {pedido.deliveryMethod.replace(/_/g, ' ').toLowerCase()}
                              </p>
                            </div>

                            <div className="bg-gray-50 rounded-lg p-4">
                              <div className="flex items-center gap-2 mb-2">
                                <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                                </svg>
                                <span className="font-medium text-gray-900">Método de pago</span>
                              </div>
                              <p className="text-gray-700 capitalize">
                                {pedido.paymentMethod.replace(/_/g, ' ').toLowerCase()}
                              </p>
                            </div>
                          </div>

                          {pedido.notes && (
                            <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-100">
                              <div className="flex items-start gap-2">
                                <svg className="w-4 h-4 text-yellow-600 mt-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                                <div>
                                  <p className="font-medium text-yellow-800 mb-1">Notas especiales</p>
                                  <p className="text-yellow-700 text-sm">{pedido.notes}</p>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Acciones del pedido */}
                    {(pedido.status === 'PENDIENTE' || pedido.status === 'CONFIRMADO') && (
                      <div className="mt-6 pt-6 border-t border-gray-200">
                        <div className="flex flex-col sm:flex-row gap-3 justify-end">
                          <button
                            onClick={() => cancelarPedido(pedido.id)}
                            disabled={cancelingId === pedido.id}
                            className="px-6 py-3 bg-red-50 text-red-700 border border-red-200 rounded-lg hover:bg-red-100 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors duration-200 flex items-center justify-center gap-2"
                          >
                            {cancelingId === pedido.id ? (
                              <>
                                <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Cancelando...
                              </>
                            ) : (
                              <>
                                <XCircle size={16} />
                                Cancelar Pedido
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
