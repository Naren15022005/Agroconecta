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
        const res = await fetch(`/api/pedidos?buyerId=${buyerId}`);
        
        if (res.ok) {
          const data = await res.json();
          setPedidos(data);
        } else {
          setError('Error al cargar pedidos');
        }
      } catch (err) {
        setError('Error de conexión');
      } finally {
        setLoading(false);
      }
    };

    cargarPedidos();
  }, [session]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PENDIENTE':
        return <Clock className="text-yellow-500" size={20} />;
      case 'CONFIRMADO':
        return <CheckCircle className="text-blue-500" size={20} />;
      case 'EN_PREPARACION':
        return <Package className="text-orange-500" size={20} />;
      case 'EN_CAMINO':
      case 'EN_PUNTO':
        return <Truck className="text-purple-500" size={20} />;
      case 'ENTREGADO':
        return <CheckCircle className="text-green-500" size={20} />;
      case 'CANCELADO':
      case 'NO_ENTREGADO':
        return <XCircle className="text-red-500" size={20} />;
      default:
        return <Clock className="text-gray-500" size={20} />;
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
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Historial de Pedidos</h1>
          <p className="mt-2 text-gray-600">
            Consulta todos tus pedidos realizados, incluyendo cancelados y entregados.
          </p>
          <div className="flex flex-wrap gap-4 mt-4">
            <select value={filtroEstado} onChange={e => setFiltroEstado(e.target.value)} className="border rounded px-2 py-1">
              <option value="">Todos los estados</option>
              <option value="PENDIENTE">Pendiente</option>
              <option value="CONFIRMADO">Confirmado</option>
              <option value="EN_PREPARACION">En Preparación</option>
              <option value="EN_CAMINO">En Camino</option>
              <option value="EN_PUNTO">En Punto</option>
              <option value="ENTREGADO">Entregado</option>
              <option value="CANCELADO">Cancelado</option>
              <option value="NO_ENTREGADO">No Entregado</option>
            </select>
            <input type="date" value={fechaInicio} onChange={e => setFechaInicio(e.target.value)} className="border rounded px-2 py-1" placeholder="Desde" />
            <input type="date" value={fechaFin} onChange={e => setFechaFin(e.target.value)} className="border rounded px-2 py-1" placeholder="Hasta" />
          </div>
        </div>

        {pedidosFiltrados.length === 0 ? (
          <div className="text-center py-12">
            <Package className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No tienes pedidos aún
            </h3>
            <p className="text-gray-500 mb-4">
              Cuando realices un pedido, aparecerá aquí.
            </p>
            <a
              href="/comprador/mercado"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
            >
              Ir al Mercado
            </a>
          </div>
        ) : (
          <div className="space-y-6">
            {pedidosFiltrados.map((pedido) => {
              const statusInfo = getStatusText(pedido.status);
              return (
                <div key={pedido.id} className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
                  {/* Header del pedido */}
                  <div className="bg-gray-50 px-6 py-4 border-b">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        {getStatusIcon(pedido.status)}
                        <div>
                          <h3 className="text-xl font-bold text-green-900 tracking-tight">
                            Pedido #{pedido.id.slice(-8)}
                          </h3>
                          <p className="text-base text-green-700 font-semibold flex items-center gap-1">
                            <span className="inline-block">🚜</span>
                            {pedido.agricultor?.user?.nombre || 'Agricultor'}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${statusInfo.color} shadow-sm`}>
                          {statusInfo.text}
                        </span>
                        <p className="text-sm text-gray-500 mt-1">
                          {formatDate(pedido.createdAt)}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Contenido del pedido */}
                  <div className="px-6 py-4 bg-white">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Productos */}
                      <div>
                        <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                          <Package size={20} className="text-gray-400" /> Productos
                        </h4>
                        <div className="space-y-2">
                          {pedido.items.map((item) => (
                            <div key={item.id} className="flex justify-between items-center bg-gray-50 rounded px-3 py-2">
                              <span className="text-sm text-gray-800 font-medium flex items-center gap-2">
                                🥬 {item.productName} <span className="text-xs text-gray-500">x{item.quantity} {item.unit}</span>
                              </span>
                              <span className="text-sm font-bold text-green-700">
                                ${(item.price * item.quantity).toLocaleString()}
                              </span>
                            </div>
                          ))}
                        </div>
                        <div className="mt-3 pt-3 border-t">
                          <div className="flex justify-between items-center">
                            <span className="text-base font-bold text-gray-900">Total:</span>
                            <span className="text-lg font-bold text-green-700">
                              ${pedido.total.toLocaleString()}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Información de entrega */}
                      <div>
                        <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                          <MapPin size={20} className="text-gray-400" /> Información de Entrega
                        </h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex items-start gap-2">
                            <MapPin size={16} className="text-gray-400 mt-0.5" />
                            <span className="text-gray-600">{pedido.address}</span>
                          </div>
                          <div>
                            <span className="text-base font-bold text-gray-900">Método de entrega:</span>
                            <span className="ml-2 text-gray-700 font-medium">
                              {pedido.deliveryMethod.replace(/_/g, ' ')}
                            </span>
                          </div>
                          <div>
                            <span className="text-base font-bold text-gray-900">Método de pago:</span>
                            <span className="ml-2 text-gray-700 font-medium">
                              {pedido.paymentMethod.replace(/_/g, ' ')}
                            </span>
                          </div>
                          {pedido.notes && (
                            <div>
                              <span className="text-base font-bold text-gray-900">Notas:</span>
                              <p className="text-gray-700 mt-1 font-medium">{pedido.notes}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Footer con acciones */}
                  <div className="bg-gray-50 px-6 py-3 border-t">
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-gray-500">
                        Última actualización: {formatDate(pedido.updatedAt)}
                      </p>
                      <div className="space-x-2">
                        {pedido.status === 'PENDIENTE' && (
                          <button
                            className={`text-sm text-red-600 hover:text-red-800 font-semibold ${cancelingId === pedido.id ? 'opacity-50 cursor-not-allowed' : ''}`}
                            disabled={cancelingId === pedido.id}
                            onClick={() => cancelarPedido(pedido.id)}
                          >
                            {cancelingId === pedido.id ? 'Cancelando...' : 'Cancelar Pedido'}
                          </button>
                        )}
                        <button className="text-sm text-green-700 hover:text-green-900 font-semibold">
                          Contactar Agricultor
                        </button>
                      </div>
                    </div>
                  </div>

                  {successMsg && (
                    <div className="mt-4 px-4 py-2 bg-green-100 text-green-800 rounded shadow">
                      {successMsg}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
