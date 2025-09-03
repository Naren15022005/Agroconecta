'use client';
import React, { useEffect, useState } from 'react';
import { Eye, Archive, RotateCcw, CheckSquare, Square } from 'lucide-react';
import PedidosFilters from './PedidosFilters';
import PedidoDetalleModal from '../PedidoDetalleModal';

interface Pedido {
  id: string;
  total: number;
  status: string;
  deliveryMethod: string;
  paymentMethod: string;
  createdAt: string;
  updatedAt: string;
  archived?: boolean;
  archivedAt?: string;
  buyer: {
    id: string;
    nombre: string;
    correo: string;
  };
  items: {
    id: string;
    quantity: number;
    price: number;
    subtotal: number;
    product: {
      id: string;
      name: string;
      price: number;
    };
  }[];
}

interface PaginationInfo {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export default function AdminPedidosTable() {
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [statistics, setStatistics] = useState({
    summary: { active: 0, archived: 0, total: 0 },
    maintenance: { archiveCandidates: 0, deleteCandidates: 0 }
  });
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);
  const [selectedPedidos, setSelectedPedidos] = useState<string[]>([]);
  const [selectedPedido, setSelectedPedido] = useState<Pedido | null>(null);
  const [loading, setLoading] = useState(false);

  // Cargar estadísticas
  const loadStatistics = async () => {
    try {
      const response = await fetch('/api/admin/pedidos');
      if (response.ok) {
        const data = await response.json();
        setStatistics(data);
      }
    } catch (error) {
      console.error('Error cargando estadísticas:', error);
    }
  };

  // Cargar pedidos con filtros
  const loadPedidos = async (filters: any) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== '' && value !== null && value !== undefined) {
          params.append(key, String(value));
        }
      });

      const response = await fetch(`/api/pedidos?${params.toString()}`);
      if (response.ok) {
        const data = await response.json();
        
        if (data.pedidos) {
          setPedidos(data.pedidos);
          setPagination(data.pagination);
        } else {
          setPedidos(data);
          setPagination(null);
        }
      }
    } catch (error) {
      console.error('Error cargando pedidos:', error);
      setPedidos([]);
    } finally {
      setLoading(false);
    }
  };

  // Archivar pedidos seleccionados
  const handleArchiveSelected = async (pedidoIds: string[]) => {
    try {
      const response = await fetch('/api/admin/pedidos', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'archive',
          pedidoIds
        })
      });

      if (response.ok) {
        const result = await response.json();
        alert(result.message);
        setSelectedPedidos([]);
        await loadStatistics();
        await loadPedidos({ includeArchived: false });
      } else {
        const error = await response.json();
        alert(`Error: ${error.error}`);
      }
    } catch (error) {
      console.error('Error archivando pedidos:', error);
      alert('Error al archivar pedidos');
    }
  };

  // Archivo masivo por criterios
  const handleBulkArchive = async (criteria: any) => {
    try {
      const response = await fetch('/api/admin/pedidos', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'archive_by_criteria',
          filters: criteria
        })
      });

      if (response.ok) {
        const result = await response.json();
        alert(result.message);
        await loadStatistics();
        await loadPedidos({ includeArchived: false });
      } else {
        const error = await response.json();
        alert(`Error: ${error.error}`);
      }
    } catch (error) {
      console.error('Error en archivo masivo:', error);
      alert('Error en archivo masivo');
    }
  };

  // Desarchivar pedido
  const handleUnarchive = async (pedidoId: string) => {
    const confirm = window.confirm('¿Desarchivar este pedido?');
    if (!confirm) return;

    try {
      const response = await fetch('/api/admin/pedidos', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'unarchive',
          pedidoIds: [pedidoId]
        })
      });

      if (response.ok) {
        const result = await response.json();
        alert(result.message);
        await loadStatistics();
        await loadPedidos({ includeArchived: true });
      } else {
        const error = await response.json();
        alert(`Error: ${error.error}`);
      }
    } catch (error) {
      console.error('Error desarchivando:', error);
      alert('Error al desarchivar pedido');
    }
  };

  // Selección de pedidos
  const toggleSelection = (pedidoId: string) => {
    setSelectedPedidos(prev => 
      prev.includes(pedidoId) 
        ? prev.filter(id => id !== pedidoId)
        : [...prev, pedidoId]
    );
  };

  const toggleSelectAll = () => {
    if (selectedPedidos.length === pedidos.length) {
      setSelectedPedidos([]);
    } else {
      setSelectedPedidos(pedidos.map(p => p.id));
    }
  };

  // Estados del pedido con colores
  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      'PENDIENTE': 'bg-yellow-100 text-yellow-800',
  'EN_PREPARACION': 'bg-gray-100 text-gray-800',
      'EN_PUNTO': 'bg-cyan-100 text-cyan-800',
  'EN_CAMINO': 'bg-gray-200 text-gray-700',
      'ENTREGADO': 'bg-green-100 text-green-800',
      'CANCELADO': 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      'PENDIENTE': 'Pendiente',
      'EN_PREPARACION': 'En Preparación',
      'EN_PUNTO': 'En Punto',
      'EN_CAMINO': 'En Camino',
      'ENTREGADO': 'Entregado',
      'CANCELADO': 'Cancelado'
    };
    return labels[status] || status;
  };

  useEffect(() => {
    loadStatistics();
    loadPedidos({ includeArchived: false });
  }, []);

  // Convertir pedido para el modal
  const convertPedidoForModal = (pedido: Pedido) => {
    return {
      id: pedido.id,
      cliente: {
        id: pedido.buyer.id,
        nombre: pedido.buyer.nombre,
        telefono: '', // No disponible en esta estructura
        direccion: '' // No disponible en esta estructura
      },
      estado: pedido.status.toLowerCase().replace('_', '_') as any,
      productos: pedido.items.map(item => ({
        productoId: item.product.id,
        nombre: item.product.name,
        cantidad: item.quantity,
        precioUnitario: Number(item.price)
      })),
      total: Number(pedido.total),
      metodoPago: pedido.paymentMethod,
      metodoEntrega: pedido.deliveryMethod,
      fechaPedido: pedido.createdAt,
      fechaEntrega: pedido.updatedAt,
      historial: [] // No disponible en esta estructura
    };
  };

  return (
  <div className="space-y-6">
      {/* Filtros y Gestión */}
      <PedidosFilters
        onFilterChange={loadPedidos}
        onArchiveSelected={handleArchiveSelected}
        onBulkArchive={handleBulkArchive}
        selectedPedidos={selectedPedidos}
        statistics={statistics}
      />

      {/* Tabla de Pedidos */}
  <div className="rounded-lg shadow overflow-hidden" style={{ background: 'var(--card)', color: '#fff' }}>
        <div className="px-6 py-4 border-b" style={{ borderColor: 'var(--glass)' }}>
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium" style={{ color: 'var(--accent-2)' }}>
              Gestión de Pedidos
            </h3>
            {selectedPedidos.length > 0 && (
              <span className="text-sm" style={{ color: 'var(--muted)' }}>
                {selectedPedidos.length} pedido(s) seleccionado(s)
              </span>
            )}
          </div>
        </div>

        {loading ? (
          <div className="p-8 text-center">
            <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-green-600"></div>
            <p className="mt-2 text-gray-600">Cargando pedidos...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y" style={{ background: 'var(--card)', color: '#fff' }}>
              <thead style={{ background: 'var(--bg)' }}>
                <tr>
                  <th className="px-6 py-3 text-left">
                    <button
                      onClick={toggleSelectAll}
                      style={{ color: 'var(--muted)' }}
                    >
                      {selectedPedidos.length === pedidos.length && pedidos.length > 0 ? (
                        <CheckSquare className="w-4 h-4" />
                      ) : (
                        <Square className="w-4 h-4" />
                      )}
                    </button>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--accent-2)' }}>
                    Pedido #
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--accent-2)' }}>
                    Fecha
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--accent-2)' }}>
                    Cliente
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--accent-2)' }}>
                    Estado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--accent-2)' }}>
                    Total
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--accent-2)' }}>
                    Entrega
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--accent-2)' }}>
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody style={{ background: 'var(--card)' }}>
                {pedidos.map((pedido) => (
                  <tr 
                    key={pedido.id} 
                    className={`hover:bg-gray-50 ${pedido.archived ? 'bg-gray-100' : ''}`}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => toggleSelection(pedido.id)}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        {selectedPedidos.includes(pedido.id) ? (
                          <CheckSquare className="w-4 h-4 text-green-600" />
                        ) : (
                          <Square className="w-4 h-4" />
                        )}
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      #{pedido.id.slice(-8)}
                      {pedido.archived && (
                        <span className="ml-2 px-2 py-1 text-xs bg-gray-200 text-gray-700 rounded">
                          Archivado
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(pedido.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {pedido.buyer.nombre}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(pedido.status)}`}>
                        {getStatusLabel(pedido.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ${Number(pedido.total).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {pedido.deliveryMethod}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <button
                        onClick={() => setSelectedPedido(pedido)}
                        className="text-green-600 hover:text-green-900 inline-flex items-center"
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        Ver
                      </button>
                      {pedido.archived ? (
                        <button
                          onClick={() => handleUnarchive(pedido.id)}
                          className="text-gray-700 hover:text-gray-900 inline-flex items-center"
                        >
                          <RotateCcw className="w-4 h-4 mr-1" />
                          Desarchivar
                        </button>
                      ) : (
                        <button
                          onClick={() => handleArchiveSelected([pedido.id])}
                          className="text-yellow-600 hover:text-yellow-900 inline-flex items-center"
                        >
                          <Archive className="w-4 h-4 mr-1" />
                          Archivar
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {pedidos.length === 0 && (
              <div className="p-8 text-center text-gray-500">
                No se encontraron pedidos con los filtros aplicados
              </div>
            )}
          </div>
        )}

        {/* Paginación */}
        {pagination && (
          <div className="bg-white px-4 py-3 border-t border-gray-200 sm:px-6">
            <div className="flex items-center justify-between">
              <div className="flex-1 flex justify-between sm:hidden">
                <button
                  disabled={!pagination.hasPrev}
                  className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                >
                  Anterior
                </button>
                <button
                  disabled={!pagination.hasNext}
                  className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                >
                  Siguiente
                </button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Mostrando página <span className="font-medium">{pagination.page}</span> de{' '}
                    <span className="font-medium">{pagination.totalPages}</span> ({pagination.total} total)
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                    <button
                      disabled={!pagination.hasPrev}
                      className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                    >
                      Anterior
                    </button>
                    <button
                      disabled={!pagination.hasNext}
                      className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                    >
                      Siguiente
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modal de Detalle */}
      {selectedPedido && (
        <PedidoDetalleModal
          pedido={convertPedidoForModal(selectedPedido)}
          onClose={() => setSelectedPedido(null)}
        />
      )}
    </div>
  );
}
