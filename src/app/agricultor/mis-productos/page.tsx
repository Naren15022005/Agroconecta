'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Plus, Search, Filter, Edit, Trash2, Package } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  reservedStock: number;
  unit: string;
  imageUrl: string;
  status: 'DISPONIBLE' | 'AGOTADO';
  createdAt: string;
  updatedAt: string;
  category: {
    id: string;
    name: string;
  };
}

export default function MisProductosPage() {
  const { data: session } = useSession();
  const [productos, setProductos] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busqueda, setBusqueda] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('todos');
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Cargar productos del agricultor
  useEffect(() => {
    if (session?.user?.id) {
      cargarMisProductos();
    }
  }, [session]);

  const cargarMisProductos = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/agricultor/productos?userId=${session?.user?.id}`);
      
      if (res.ok) {
        const data = await res.json();
        setProductos(data);
      } else {
        setError('Error al cargar productos');
      }
    } catch (err) {
      setError('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  // Filtrar productos
  const productosFiltrados = productos.filter(producto => {
    const matchBusqueda = producto.name.toLowerCase().includes(busqueda.toLowerCase()) ||
                         producto.description.toLowerCase().includes(busqueda.toLowerCase());
    const matchEstado = filtroEstado === 'todos' || producto.status.toLowerCase() === filtroEstado;
    return matchBusqueda && matchEstado;
  });

  const handleEliminar = async (productId: string) => {
    try {
      const res = await fetch(`/api/productos/${productId}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        setProductos(productos.filter(p => p.id !== productId));
        setShowDeleteModal(false);
        setSelectedProduct(null);
      } else {
        alert('Error al eliminar producto');
      }
    } catch (err) {
      alert('Error de conexión');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando productos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Header */}
        <div className="mb-8">
          <div className="sm:flex sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Mis Productos</h1>
              <p className="mt-2 text-gray-600">Gestiona y administra todos tus productos publicados</p>
            </div>
            <div className="mt-4 sm:mt-0">
              <button
                onClick={() => window.location.href = '/agricultor/publicar'}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                <Plus className="h-4 w-4 mr-2" />
                Agregar Producto
              </button>
            </div>
          </div>
        </div>

        {/* Barra de herramientas */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="p-6">
            <div className="sm:flex sm:items-center sm:justify-between space-y-4 sm:space-y-0">
              {/* Búsqueda */}
              <div className="flex-1 max-w-lg">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    value={busqueda}
                    onChange={(e) => setBusqueda(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-green-500 focus:border-green-500"
                    placeholder="Buscar productos..."
                  />
                </div>
              </div>

              {/* Filtros */}
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Filter className="h-5 w-5 text-gray-400" />
                  <select
                    value={filtroEstado}
                    onChange={(e) => setFiltroEstado(e.target.value)}
                    className="border border-gray-300 rounded-md px-3 py-2 bg-white text-sm focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500"
                  >
                    <option value="todos">Todos los estados</option>
                    <option value="disponible">Disponibles</option>
                    <option value="agotado">Agotados</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Grid de productos */}
        {error ? (
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <p className="text-red-600">{error}</p>
          </div>
        ) : productosFiltrados.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {productos.length === 0 ? 'No tienes productos publicados' : 'No se encontraron productos'}
            </h3>
            <p className="text-gray-500 mb-6">
              {productos.length === 0 
                ? 'Comienza publicando tu primer producto para gestionar tu catálogo'
                : 'Intenta ajustar los filtros de búsqueda'
              }
            </p>
            {productos.length === 0 && (
              <button
                onClick={() => window.location.href = '/agricultor/publicar'}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Publicar Primer Producto
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {productosFiltrados.map((producto) => (
              <div key={producto.id} className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200">
                
                {/* Imagen del producto */}
                <div className="aspect-w-16 aspect-h-9 bg-gray-100 rounded-t-lg overflow-hidden">
                  {producto.imageUrl ? (
                    <img
                      src={producto.imageUrl}
                      alt={producto.name}
                      className="w-full h-48 object-cover"
                    />
                  ) : (
                    <div className="w-full h-48 bg-gray-100 flex items-center justify-center">
                      <Package className="h-12 w-12 text-gray-400" />
                    </div>
                  )}
                </div>

                {/* Contenido de la tarjeta */}
                <div className="p-5">
                  
                  {/* Header con estado y categoría */}
                  <div className="flex items-center justify-between mb-3">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      producto.status === 'DISPONIBLE' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {producto.status === 'DISPONIBLE' ? 'Disponible' : 'Agotado'}
                    </span>
                    <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded">
                      {producto.category.name}
                    </span>
                  </div>

                  {/* Nombre del producto */}
                  <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-1">
                    {producto.name}
                  </h3>

                  {/* Descripción */}
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                    {producto.description}
                  </p>

                  {/* Precio y stock */}
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <span className="text-xl font-bold text-gray-900">
                        ${Number(producto.price).toLocaleString()}
                      </span>
                      <span className="text-sm text-gray-500 ml-1">/{producto.unit}</span>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-700">Stock: {producto.stock}</p>
                      {producto.reservedStock > 0 && (
                        <p className="text-xs text-orange-600">Reservado: {producto.reservedStock}</p>
                      )}
                    </div>
                  </div>

                  {/* Botones de acción */}
                  <div className="flex items-center space-x-3 mb-4">
                    <button
                      onClick={() => {
                        setSelectedProduct(producto);
                        setShowEditModal(true);
                      }}
                      className="flex-1 inline-flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Editar
                    </button>
                    <button
                      onClick={() => {
                        setSelectedProduct(producto);
                        setShowDeleteModal(true);
                      }}
                      className="px-4 py-2 border border-red-300 rounded-md text-sm font-medium text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>

                  {/* Fecha de creación */}
                  <div className="pt-3 border-t border-gray-200">
                    <p className="text-xs text-gray-500">
                      Publicado el {new Date(producto.createdAt).toLocaleDateString('es-ES', {
                        day: '2-digit',
                        month: '2-digit', 
                        year: 'numeric'
                      })}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modal de confirmación de eliminación */}
        {showDeleteModal && selectedProduct && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
              <div className="mt-3 text-center">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                  <Trash2 className="h-6 w-6 text-red-600" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mt-4">Eliminar Producto</h3>
                <div className="mt-2 px-4 py-3 bg-gray-50 rounded-md">
                  <p className="text-sm font-medium text-gray-900">{selectedProduct.name}</p>
                  <p className="text-sm text-gray-500">Esta acción no se puede deshacer</p>
                </div>
                <div className="flex justify-center space-x-4 mt-6">
                  <button
                    onClick={() => {
                      setShowDeleteModal(false);
                      setSelectedProduct(null);
                    }}
                    className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={() => handleEliminar(selectedProduct.id)}
                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal de edición */}
        {showEditModal && selectedProduct && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-10 mx-auto p-5 border w-full max-w-md shadow-lg rounded-md bg-white">
              <div className="text-center">
                <h3 className="text-lg font-medium text-gray-900">Editar Producto</h3>
                <div className="mt-2 px-4 py-3 bg-gray-50 rounded-md">
                  <p className="text-sm font-medium text-gray-900">{selectedProduct.name}</p>
                  <p className="text-sm text-gray-500">Funcionalidad de edición próximamente</p>
                </div>
                <button
                  onClick={() => {
                    setShowEditModal(false);
                    setSelectedProduct(null);
                  }}
                  className="mt-4 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
