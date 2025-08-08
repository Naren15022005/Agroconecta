import React, { useState } from 'react';
import { Calendar, Filter, Archive, Trash2, RefreshCw } from 'lucide-react';

interface PedidosFiltersProps {
  onFilterChange: (filters: any) => void;
  onArchiveSelected: (pedidoIds: string[]) => void;
  onBulkArchive: (criteria: any) => void;
  selectedPedidos: string[];
  statistics: {
    summary: {
      active: number;
      archived: number;
      total: number;
    };
    maintenance: {
      archiveCandidates: number;
      deleteCandidates: number;
    };
  };
}

export default function PedidosFilters({
  onFilterChange,
  onArchiveSelected,
  onBulkArchive,
  selectedPedidos,
  statistics
}: PedidosFiltersProps) {
  const [filters, setFilters] = useState({
    status: 'TODOS',
    startDate: '',
    endDate: '',
    includeArchived: false,
    page: 1,
    limit: 10
  });

  const [showBulkOptions, setShowBulkOptions] = useState(false);

  const handleFilterChange = (key: string, value: any) => {
    const newFilters = { ...filters, [key]: value, page: 1 }; // Reset page when filters change
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleBulkArchiveOld = () => {
    const confirm = window.confirm(
      `¿Archivar ${statistics.maintenance.archiveCandidates} pedidos completados de más de 6 meses?`
    );
    if (confirm) {
      onBulkArchive({
        olderThanDays: 180,
        statuses: ['ENTREGADO', 'CANCELADO']
      });
    }
  };

  const handleArchiveSelected = () => {
    if (selectedPedidos.length === 0) {
      alert('Selecciona al menos un pedido para archivar');
      return;
    }
    
    const confirm = window.confirm(
      `¿Archivar ${selectedPedidos.length} pedido(s) seleccionado(s)?`
    );
    if (confirm) {
      onArchiveSelected(selectedPedidos);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-6">
      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-50 p-4 rounded-lg">
          <h3 className="text-sm font-medium text-blue-900 mb-1">Pedidos Activos</h3>
          <p className="text-2xl font-bold text-blue-600">{statistics.summary.active}</p>
        </div>
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-sm font-medium text-gray-900 mb-1">Pedidos Archivados</h3>
          <p className="text-2xl font-bold text-gray-600">{statistics.summary.archived}</p>
        </div>
        <div className="bg-yellow-50 p-4 rounded-lg">
          <h3 className="text-sm font-medium text-yellow-900 mb-1">Candidatos a Archivo</h3>
          <p className="text-2xl font-bold text-yellow-600">{statistics.maintenance.archiveCandidates}</p>
        </div>
        <div className="bg-red-50 p-4 rounded-lg">
          <h3 className="text-sm font-medium text-red-900 mb-1">Candidatos a Eliminación</h3>
          <p className="text-2xl font-bold text-red-600">{statistics.maintenance.deleteCandidates}</p>
        </div>
      </div>

      {/* Filtros */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
        {/* Filtro de Estado */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Estado
          </label>
          <select
            value={filters.status}
            onChange={(e) => handleFilterChange('status', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <option value="TODOS">Todos los estados</option>
            <option value="PENDIENTE">Pendiente</option>
            <option value="EN_PREPARACION">En Preparación</option>
            <option value="EN_PUNTO">En Punto</option>
            <option value="EN_CAMINO">En Camino</option>
            <option value="ENTREGADO">Entregado</option>
            <option value="CANCELADO">Cancelado</option>
          </select>
        </div>

        {/* Fecha Inicio */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Fecha Desde
          </label>
          <input
            type="date"
            value={filters.startDate}
            onChange={(e) => handleFilterChange('startDate', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>

        {/* Fecha Fin */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Fecha Hasta
          </label>
          <input
            type="date"
            value={filters.endDate}
            onChange={(e) => handleFilterChange('endDate', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>

        {/* Incluir Archivados */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Ver Archivados
          </label>
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={filters.includeArchived}
              onChange={(e) => handleFilterChange('includeArchived', e.target.checked)}
              className="rounded border-gray-300 text-green-600 focus:ring-green-500"
            />
            <span className="ml-2 text-sm text-gray-700">Incluir archivados</span>
          </label>
        </div>
      </div>

      {/* Acciones de Gestión */}
      <div className="flex flex-wrap gap-4 items-center">
        <button
          onClick={() => setShowBulkOptions(!showBulkOptions)}
          className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
        >
          <Archive className="w-4 h-4 mr-2" />
          Gestión de Archivo
        </button>

        {selectedPedidos.length > 0 && (
          <button
            onClick={handleArchiveSelected}
            className="flex items-center px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 transition-colors"
          >
            <Archive className="w-4 h-4 mr-2" />
            Archivar Seleccionados ({selectedPedidos.length})
          </button>
        )}

        <button
          onClick={() => handleFilterChange('page', 1)}
          className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Actualizar
        </button>
      </div>

      {/* Opciones de Archivo Masivo */}
      {showBulkOptions && (
        <div className="mt-4 p-4 bg-gray-50 rounded-lg border">
          <h4 className="font-medium text-gray-900 mb-3">Opciones de Archivo Masivo</h4>
          <div className="space-y-3">
            <button
              onClick={handleBulkArchiveOld}
              disabled={statistics.maintenance.archiveCandidates === 0}
              className="w-full text-left p-3 bg-white border border-gray-200 rounded-md hover:bg-yellow-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">
                    Archivar pedidos antiguos completados
                  </p>
                  <p className="text-sm text-gray-600">
                    Pedidos entregados o cancelados con más de 6 meses
                  </p>
                </div>
                <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm">
                  {statistics.maintenance.archiveCandidates} candidatos
                </span>
              </div>
            </button>

            <div className="p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-800">
                <strong>Nota:</strong> Los pedidos archivados se ocultan de las vistas normales pero se conservan para auditoría. 
                Solo los administradores pueden ver y desarchivar pedidos.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Filtros Rápidos */}
      <div className="mt-4 flex flex-wrap gap-2">
        <span className="text-sm text-gray-600 mr-2">Filtros rápidos:</span>
        <button
          onClick={() => handleFilterChange('status', 'PENDIENTE')}
          className="px-3 py-1 text-xs bg-orange-100 text-orange-800 rounded-full hover:bg-orange-200"
        >
          Solo Pendientes
        </button>
        <button
          onClick={() => handleFilterChange('status', 'ENTREGADO')}
          className="px-3 py-1 text-xs bg-green-100 text-green-800 rounded-full hover:bg-green-200"
        >
          Solo Entregados
        </button>
        <button
          onClick={() => {
            const today = new Date();
            const lastWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
            handleFilterChange('startDate', lastWeek.toISOString().split('T')[0]);
          }}
          className="px-3 py-1 text-xs bg-blue-100 text-blue-800 rounded-full hover:bg-blue-200"
        >
          Última Semana
        </button>
        <button
          onClick={() => {
            setFilters({
              status: 'TODOS',
              startDate: '',
              endDate: '',
              includeArchived: false,
              page: 1,
              limit: 10
            });
            onFilterChange({
              status: 'TODOS',
              startDate: '',
              endDate: '',
              includeArchived: false,
              page: 1,
              limit: 10
            });
          }}
          className="px-3 py-1 text-xs bg-gray-100 text-gray-800 rounded-full hover:bg-gray-200"
        >
          Limpiar Filtros
        </button>
      </div>
    </div>
  );
}
