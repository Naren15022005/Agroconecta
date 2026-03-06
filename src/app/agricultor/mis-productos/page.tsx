'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { 
  Package, 
  Plus, 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  X,
  Eye,
  Copy,
  DollarSign,
  MapPin,
  ChevronDown,
  Check,
  Calendar,
  Truck,
  Award,
  Leaf,
  Camera,
  CheckCircle,
  AlertCircle,
  Info
} from 'lucide-react';

import { subcategorias } from './subcategorias-cache';

interface Product {
  id: string;
  name?: string;
  description?: string;
  price: number;
  stock: number;
  reservedStock: number;
  unit: string;
  imageUrl: string;
  status: 'DISPONIBLE' | 'AGOTADO' | 'SUSPENDIDO';
  createdAt: string;
  updatedAt: string;
  categoryId: string;
  subcategoryId?: string;
  // Campos extendidos
  fechaCosecha?: string;
  tiempoEntrega: string;
  stockMinimo: number;
  pesoAproximado?: number;
  certificaciones: string[];
  metodosEntrega: string[];
  horariosDisponibles?: string;
  notasEspeciales?: string;
  municipio?: string;
  vereda?: string;
  tipoCultivo: 'ORGANICO' | 'CONVENCIONAL';
  category: {
    id: string;
    name: string;
  };
}

interface Category {
  id: string;
  name: string;
}

const unidades = [
  { value: 'kg', label: 'Kilogramo (kg)', icon: '⚖️' },
  { value: 'libra', label: 'Libra (lb)', icon: '⚖️' },
  { value: 'gramo', label: 'Gramo (g)', icon: '⚖️' },
  { value: 'bulto', label: 'Bulto', icon: '📦' },
  { value: 'caja', label: 'Caja', icon: '📦' },
  { value: 'canasta', label: 'Canasta', icon: '🧺' },
  { value: 'unidad', label: 'Unidad', icon: '1️⃣' },
  { value: 'docena', label: 'Docena', icon: '🥚' },
  { value: 'litro', label: 'Litro (L)', icon: '🥛' },
  { value: 'galón', label: 'Galón', icon: '🪣' },
  { value: 'manojo', label: 'Manojo', icon: '🌿' },
  { value: 'racimo', label: 'Racimo', icon: '🍇' }
];

const certificacionesDisponibles = [
  'Orgánico certificado',
  'Comercio justo',
  'Rainforest Alliance',
  'UTZ Certified',
  'Global GAP',
  'BPA (Buenas Prácticas Agrícolas)',
  'HACCP',
  'ISO 22000',
  'Libre de pesticidas',
  'Cultivo tradicional'
];

const metodosEntregaDisponibles = [
  { value: 'domicilio', label: 'Entrega a domicilio', icon: '🚚' },
  { value: 'punto', label: 'Punto de encuentro', icon: '📍' },
  { value: 'finca', label: 'Recogida en finca', icon: '🏡' },
  { value: 'mercado', label: 'Entrega en mercado local', icon: '🏪' }
];

export default function MisProductosPage() {
  const { data: session } = useSession();
  const [productos, setProductos] = useState<Product[]>([]);
  // Modal de previsualización de producto
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [categorias, setCategorias] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busqueda, setBusqueda] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('todos');
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [editLoading, setEditLoading] = useState(false);
  const [switchingStates, setSwitchingStates] = useState<Set<string>>(new Set());
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  
  // Estados para modales de mensaje
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [messageType, setMessageType] = useState<'success' | 'error'>('success');
  const [messageText, setMessageText] = useState('');
  const [showConfirmUpdateModal, setShowConfirmUpdateModal] = useState(false);

  // Función helper para mostrar mensajes
  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessageType(type);
    setMessageText(text);
    setShowMessageModal(true);
  };

  // Función para iniciar el proceso de actualización
  const handleConfirmUpdate = () => {
    if (!selectedProduct) return;

    // Validaciones básicas
    if (!editForm.name || !editForm.price || !editForm.stock || !editForm.unit || !editForm.categoryId) {
      showMessage('error', 'Por favor completa todos los campos requeridos');
      return;
    }

    // Mostrar modal de confirmación
    setShowConfirmUpdateModal(true);
  };
  
  // Estados del formulario de edición - usando la misma estructura que publicar
  const [editForm, setEditForm] = useState({
    name: '',
    description: '',
    price: '',
    stock: '',
    unit: '',
    categoryId: '',
    imageUrl: '',
    imagePreview: '',
    status: 'DISPONIBLE' as 'DISPONIBLE' | 'AGOTADO' | 'SUSPENDIDO',
    // Campos adicionales para mantener consistencia con publicar
    stockMinimo: '',
    tipoCultivo: 'convencional' as 'organico' | 'convencional',
    municipio: '',
    vereda: '',
    fechaCosecha: '',
    tiempoEntrega: '1',
    pesoAproximado: '',
    certificaciones: [] as string[],
    metodosEntrega: [] as string[],
    horariosDisponibles: '',
    notasEspeciales: ''
  });

  // Cargar productos del agricultor

  // Nuevo estado para el id del agricultor
  const [agricultorId, setAgricultorId] = useState<string | null>(null);

  useEffect(() => {
    if (session?.user?.id) {
      // Primero obtener el id del agricultor usando el user_id
      fetch(`/api/agricultor/por-user?userId=${session.user.id}`)
        .then(res => res.json())
        .then(data => {
          if (data && data.id) {
            setAgricultorId(data.id);
            cargarMisProductos(data.id);
          } else {
            setError('No se encontró el perfil de agricultor');
          }
        })
        .catch(() => setError('Error al buscar agricultor'));
      cargarCategorias();
    }
  }, [session]);

  const cargarCategorias = async () => {
    try {
      const res = await fetch('/api/categorias');
      if (res.ok) {
        const data = await res.json();
        setCategorias(data);
      }
    } catch (err) {
      console.error('Error al cargar categorías:', err);
    }
  };

  const cargarMisProductos = async (agricultorIdParam: string) => {
    try {
      setLoading(true);
      const res = await fetch(`/api/agricultor/productos?agricultorId=${agricultorIdParam}`);
      const data = await res.json();
      if (Array.isArray(data)) {
        setProductos(data);
        setError('');
      } else if (data && data.error) {
        // Solo mostrar error si el backend retorna un campo error explícito
        setError(data.error);
      } else {
        setProductos([]);
        setError('');
      }
    } catch (err) {
      setError('Error de conexión');
    } finally {
      setLoading(false);
    }
  };


  // Filtrar productos
  const productosFiltrados = productos.filter(producto => {
    const matchBusqueda = (producto.name?.toLowerCase() || '').includes(busqueda.toLowerCase()) ||
                         (producto.description?.toLowerCase() || '').includes(busqueda.toLowerCase());
    const matchEstado = filtroEstado === 'todos' || 
                       (filtroEstado === 'disponible' && producto.status === 'DISPONIBLE') ||
                       (filtroEstado === 'agotado' && producto.status === 'AGOTADO');
    return matchBusqueda && matchEstado;
  });

  // Si no hay productos y no hay error, mostrar mensaje amigable
  const mostrarSinProductos = !loading && !error && productos.length === 0;

  const handleEliminar = async (productId: string) => {
    try {
      const res = await fetch(`/api/productos/${productId}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        setProductos(productos.filter(p => p.id !== productId));
        setShowDeleteModal(false);
        setSelectedProduct(null);
        showMessage('success', '¡Producto eliminado exitosamente!');
      } else {
        showMessage('error', 'Error al eliminar producto');
      }
    } catch (err) {
      showMessage('error', 'Error de conexión. Inténtalo de nuevo.');
    }
  };

  const handleEditarProducto = (producto: Product) => {
    setSelectedProduct(producto);
    setEditForm({
      name: producto.name || '',
      description: producto.description || '',
      price: producto.price.toString(),
      stock: producto.stock.toString(),
      unit: producto.unit,
      categoryId: producto.categoryId,
      imageUrl: producto.imageUrl || '',
      imagePreview: producto.imageUrl || '',
      status: producto.status,
      stockMinimo: producto.stockMinimo?.toString() || '10',
      tipoCultivo: producto.tipoCultivo === 'ORGANICO' ? 'organico' : 'convencional',
      municipio: producto.municipio || '',
      vereda: producto.vereda || '',
      fechaCosecha: producto.fechaCosecha ? producto.fechaCosecha.split('T')[0] : '',
      tiempoEntrega: producto.tiempoEntrega || '1',
      pesoAproximado: producto.pesoAproximado?.toString() || '',
      certificaciones: producto.certificaciones || [],
      metodosEntrega: producto.metodosEntrega || [],
      horariosDisponibles: producto.horariosDisponibles || '',
      notasEspeciales: producto.notasEspeciales || ''
    });
    setShowEditModal(true);
  };

  const handleActualizarProducto = async () => {
    if (!selectedProduct) return;

    try {
      setEditLoading(true);
      setShowConfirmUpdateModal(false); // Cerrar modal de confirmación
      
      const res = await fetch(`/api/productos/${selectedProduct.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editForm),
      });

      if (res.ok) {
        const data = await res.json();
        const productoActualizado = data.producto; // Acceder al objeto producto dentro de la respuesta
        
        console.log('Producto actualizado recibido:', productoActualizado);
        
        // Actualizar la lista de productos
        const nuevosProductos = productos.map(p => {
          if (p.id === selectedProduct.id) {
            // Crear el producto actualizado manteniendo todos los campos necesarios
            return {
              ...p, // Mantener todos los campos existentes
              ...productoActualizado, // Sobrescribir con los nuevos datos del API
              // Asegurar que la categoría esté correcta
              category: productoActualizado.category || {
                id: productoActualizado.categoryId,
                name: categorias.find(c => c.id === productoActualizado.categoryId)?.name || p.category?.name || ''
              },
              // Asegurar que los métodos de entrega estén parseados correctamente
              metodosEntrega: (() => {
                if (Array.isArray(productoActualizado.metodosEntrega)) {
                  return productoActualizado.metodosEntrega;
                }
                if (typeof productoActualizado.metodosEntrega === 'string') {
                  try {
                    return JSON.parse(productoActualizado.metodosEntrega);
                  } catch {
                    return [];
                  }
                }
                return p.metodosEntrega || [];
              })(),
              // Asegurar que las certificaciones estén parseadas correctamente
              certificaciones: (() => {
                if (Array.isArray(productoActualizado.certificaciones)) {
                  return productoActualizado.certificaciones;
                }
                if (typeof productoActualizado.certificaciones === 'string') {
                  try {
                    return JSON.parse(productoActualizado.certificaciones);
                  } catch {
                    return [];
                  }
                }
                return p.certificaciones || [];
              })()
            };
          }
          return p;
        });
        
        console.log('Productos después de mapear:', nuevosProductos.length);
        setProductos(nuevosProductos);
        
        setShowEditModal(false);
        setSelectedProduct(null);
        showMessage('success', '¡Producto actualizado exitosamente!');
      } else {
        const error = await res.json();
        showMessage('error', error.error || 'Error al actualizar producto');
      }
    } catch (err) {
      showMessage('error', 'Error de conexión. Inténtalo de nuevo.');
    } finally {
      setEditLoading(false);
    }
  };

  const handleCancelarEdicion = () => {
    setShowEditModal(false);
    setSelectedProduct(null);
    setEditForm({
      name: '',
      description: '',
      price: '',
      stock: '',
      unit: '',
      categoryId: '',
      imageUrl: '',
      imagePreview: '',
      status: 'DISPONIBLE',
      stockMinimo: '',
      tipoCultivo: 'convencional',
      municipio: '',
      vereda: '',
      fechaCosecha: '',
      tiempoEntrega: '1',
      pesoAproximado: '',
      certificaciones: [],
      metodosEntrega: ['domicilio'],
      horariosDisponibles: '',
      notasEspeciales: ''
    });
  };

  // Función para manejar certificaciones
  const toggleCertificacion = (cert: string) => {
    const currentCerts = editForm.certificaciones;
    if (currentCerts.includes(cert)) {
      setEditForm({ ...editForm, certificaciones: currentCerts.filter(c => c !== cert) });
    } else {
      setEditForm({ ...editForm, certificaciones: [...currentCerts, cert] });
    }
  };

  // Función para manejar métodos de entrega
  const toggleMetodoEntrega = (metodo: string) => {
    const currentMetodos = editForm.metodosEntrega;
    if (currentMetodos.includes(metodo)) {
      if (currentMetodos.length > 1) { // Mantener al menos uno
        setEditForm({ ...editForm, metodosEntrega: currentMetodos.filter(m => m !== metodo) });
      }
    } else {
      setEditForm({ ...editForm, metodosEntrega: [...currentMetodos, metodo] });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-900 flex items-center justify-center text-neutral-200">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-neutral-400">Cargando productos...</p>
        </div>
      </div>
    );
  }

  return (
    <div key="mis-productos-page" className="min-h-screen bg-neutral-900 text-neutral-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Header */}
        <div className="mb-8">
          <div className="sm:flex sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-neutral-100">Mis Productos</h1>
              <p className="mt-2 text-neutral-400">Gestiona y administra todos tus productos publicados</p>
            </div>
          </div>
        </div>

        {/* Barra de herramientas */}
        <div className="bg-neutral-800 rounded-lg shadow mb-6">
          <div className="p-6">
            <div className="sm:flex sm:items-center sm:justify-between space-y-4 sm:space-y-0">
              {/* Búsqueda */}
              <div className="flex-1 max-w-lg">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-neutral-400" />
                  </div>
                  <input
                    type="text"
                    value={busqueda}
                    onChange={(e) => setBusqueda(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2 border border-neutral-700 rounded-md leading-5 bg-neutral-800 placeholder-neutral-500 focus:outline-none focus:placeholder-neutral-400 focus:ring-1 focus:ring-green-600 focus:border-green-600 text-neutral-100"
                    placeholder="Buscar productos..."
                  />
                </div>
              </div>

              {/* Filtros */}
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  
                  {/* Custom Dropdown */}
                  <div className="relative">
                    <button
                      onClick={() => setShowFilterDropdown(!showFilterDropdown)}
                      className="inline-flex items-center justify-between w-48 px-4 py-2.5 text-sm font-medium text-neutral-100 bg-neutral-800 border border-neutral-700 rounded-lg shadow-sm hover:bg-neutral-700 hover:border-neutral-600 focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-green-600 transition-all duration-200"
                    >
                      <span className="flex items-center">
                        {filtroEstado === 'todos' && (
                          <React.Fragment key="filter-todos">
                            <span className="w-2 h-2 bg-neutral-600 rounded-full mr-2"></span>
                            Todos los estados
                          </React.Fragment>
                        )}
                        {filtroEstado === 'disponible' && (
                          <React.Fragment key="filter-disponible">
                            <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                            Disponibles
                          </React.Fragment>
                        )}
                        {filtroEstado === 'agotado' && (
                          <React.Fragment key="filter-agotado">
                            <span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
                            Agotados
                          </React.Fragment>
                        )}
                      </span>
                      <ChevronDown className={`w-4 h-4 text-neutral-400 transition-transform duration-200 ${showFilterDropdown ? 'rotate-180' : ''}`} />
                    </button>

                    {/* Dropdown Menu */}
                    {showFilterDropdown && (
                      <React.Fragment key="filter-dropdown">
                        {/* Overlay para cerrar al hacer click fuera */}
                        <div 
                          className="fixed inset-0 z-10" 
                          onClick={() => setShowFilterDropdown(false)}
                        ></div>
                        
                        <div className="absolute z-20 w-full mt-1 bg-neutral-800 border border-neutral-700 rounded-lg shadow-lg overflow-hidden">
                          <div className="py-1">
                            <button
                              onClick={() => {
                                setFiltroEstado('todos');
                                setShowFilterDropdown(false);
                              }}
                              className={`w-full px-4 py-2.5 text-left text-sm flex items-center justify-between hover:bg-neutral-700 transition-colors ${
                                filtroEstado === 'todos' ? 'bg-green-700 text-white' : 'text-neutral-100'
                              }`}
                            >
                              <span className="flex items-center">
                                <span className="w-2 h-2 bg-neutral-600 rounded-full mr-3"></span>
                                Todos los estados
                              </span>
                              {filtroEstado === 'todos' && <Check className="w-4 h-4 text-green-600" />}
                            </button>
                            
                            <button
                              onClick={() => {
                                setFiltroEstado('disponible');
                                setShowFilterDropdown(false);
                              }}
                              className={`w-full px-4 py-2.5 text-left text-sm flex items-center justify-between hover:bg-neutral-700 transition-colors ${
                                filtroEstado === 'disponible' ? 'bg-green-700 text-white' : 'text-neutral-100'
                              }`}
                            >
                              <span className="flex items-center">
                                <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
                                Disponibles
                              </span>
                              {filtroEstado === 'disponible' && <Check className="w-4 h-4 text-green-600" />}
                            </button>
                            
                            <button
                              onClick={() => {
                                setFiltroEstado('agotado');
                                setShowFilterDropdown(false);
                              }}
                              className={`w-full px-4 py-2.5 text-left text-sm flex items-center justify-between hover:bg-neutral-700 transition-colors ${
                                filtroEstado === 'agotado' ? 'bg-green-700 text-white' : 'text-neutral-100'
                              }`}
                            >
                              <span className="flex items-center">
                                <span className="w-2 h-2 bg-red-500 rounded-full mr-3"></span>
                                Agotados
                              </span>
                              {filtroEstado === 'agotado' && <Check className="w-4 h-4 text-green-600" />}
                            </button>
                          </div>
                        </div>
                      </React.Fragment>
                    )}
                  </div>
                </div>
                
                {/* Botón Agregar Producto */}
                <button
                  onClick={() => window.location.href = '/agricultor/publicar'}
                  className="inline-flex items-center px-3 py-2 sm:px-4 sm:py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors whitespace-nowrap"
                >
                  <Plus className="h-4 w-4 sm:mr-2 mr-0" />
                  <span className="hidden sm:inline">Producto</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* CRUD de productos del agricultor */}
        {error ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center">
              <X className="h-5 w-5 text-red-400 mr-2" />
              <p className="text-red-700 font-medium">{error}</p>
            </div>
          </div>
        ) : productosFiltrados.length === 0 ? (
          <div className="bg-neutral-800 rounded-lg shadow-sm border border-neutral-700 p-12 text-center">
            <div className="mx-auto w-20 h-20 bg-neutral-700 rounded-full flex items-center justify-center mb-4">
              <Package className="h-10 w-10 text-neutral-400" />
            </div>
            <h3 className="text-lg font-semibold text-neutral-100 mb-2">
              {productos.length === 0 ? 'Sin productos publicados' : 'No se encontraron productos'}
            </h3>
            <p className="text-neutral-400 mb-6">
              {productos.length === 0 
                ? 'Comienza publicando tu primer producto para gestionar tu catálogo'
                : 'Intenta ajustar los filtros de búsqueda'
              }
            </p>
            {productos.length === 0 && (
              <button
                onClick={() => window.location.href = '/agricultor/publicar'}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
              >
                <Plus className="h-4 w-4 mr-2" />
                Publicar Primer Producto
              </button>
            )}
          </div>
        ) : (
          <div className="bg-neutral-800 rounded-lg shadow-sm border border-neutral-700 overflow-hidden">
            
            {/* Tabla de productos */}
            <div className="overflow-x-auto">
              <table key={`productos-table-${productos.length}`} className="min-w-full divide-y divide-neutral-700">
                
                {/* Encabezado */}
                <thead className="bg-neutral-800">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-neutral-400 uppercase tracking-wider">
                      Producto
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-neutral-400 uppercase tracking-wider">
                      Categoría
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-neutral-400 uppercase tracking-wider">
                      Precio
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-neutral-400 uppercase tracking-wider">
                      Stock
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-neutral-400 uppercase tracking-wider">
                      Estado
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-neutral-400 uppercase tracking-wider">
                      Fecha Publicación
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-semibold text-neutral-400 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>

                {/* Cuerpo de la tabla */}
                <tbody className="bg-neutral-800 divide-y divide-neutral-700">
                  {productosFiltrados.map((producto, index) => (
                    <tr 
                      key={producto.id} 
                      className={`bg-neutral-800 hover:bg-neutral-700 transition-colors duration-150`}
                    >
                      
                      {/* Información del producto */}
                      <td className="px-4 pr-8 py-4 sm:px-6">
                        <div className="flex items-center space-x-4">
                          <div className="flex-shrink-0">
                            {producto.imageUrl ? (
                              <img
                                className="h-14 w-14 rounded-lg object-cover border border-neutral-700"
                                src={producto.imageUrl}
                                alt={producto.name || 'Producto'}
                                onError={(e) => {
                                  e.currentTarget.src = '/placeholder-product.jpg';
                                }}
                              />
                            ) : (
                              <div className="h-14 w-14 rounded-lg bg-neutral-700 flex items-center justify-center border border-neutral-700">
                                <Package className="h-7 w-7 text-neutral-400" />
                              </div>
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <h4 className="text-sm font-semibold text-neutral-100 truncate max-w-xs" title={producto.name || 'Sin nombre'}>
                              {producto.name || 'Sin nombre'}
                            </h4>
                            <p className="text-sm text-neutral-400 truncate max-w-xs mt-1" title={producto.description || 'Sin descripción'}>
                              {producto.description || 'Sin descripción'}
                            </p>
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-neutral-700 text-neutral-300 mt-1" title={`ID completo: ${producto.id}`}>
                              ID: {producto.id}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Categoría */}
                      <td className="pl-6 pr-4 py-4 sm:px-6">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-white text-blue-700 border border-neutral-200">
                          {producto.category?.name || 'Sin categoría'}
                        </span>
                      </td>

                      {/* Precio */}
                      <td className="px-6 py-4">
                        <div className="text-sm font-bold text-neutral-100">
                          ${Number(producto.price).toLocaleString('es-CO')}
                        </div>
                        <div className="text-xs text-neutral-400">
                          por {producto.unit}
                        </div>
                      </td>

                      {/* Stock */}
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <div className="text-sm font-medium text-neutral-100">
                            {producto.stock} {producto.unit}
                          </div>
                          
                          {/* Alertas de stock */}
                          {producto.stock === 0 ? (
                            <span key={`alert-no-stock-${producto.id}`} className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
                              Sin stock
                            </span>
                          ) : producto.stock > 0 && producto.stock <= 5 ? (
                            <span key={`alert-low-stock-${producto.id}`} className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
                              Stock bajo
                            </span>
                          ) : null}
                          
                          {/* Stock reservado */}
                          {producto.reservedStock > 0 && (
                            <div key={`reserved-${producto.id}`} className="text-xs text-orange-600">
                              Reservado: {producto.reservedStock}
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Estado - Badge con click */}
                      <td className="px-6 py-4">
                        <button
                          onClick={async () => {
                            const nuevoEstado = producto.status === 'DISPONIBLE' ? 'AGOTADO' : 'DISPONIBLE';
                            const accion = nuevoEstado === 'DISPONIBLE' ? 'hacer disponible' : 'marcar como agotado';
                            
                            if (confirm(`¿Confirmas ${accion} el producto "${producto.name || 'Sin nombre'}"?`)) {
                              // Activar animación
                              setSwitchingStates(prev => new Set([...prev, producto.id]));
                              
                              try {
                                const res = await fetch(`/api/productos/${producto.id}`, {
                                  method: 'PUT',
                                  headers: { 'Content-Type': 'application/json' },
                                  body: JSON.stringify({ ...producto, status: nuevoEstado })
                                });

                                if (res.ok) {
                                  // Esperar un poco para mostrar la animación antes de recargar
                                  setTimeout(() => {
                                    window.location.reload();
                                  }, 300);
                                } else {
                                  setSwitchingStates(prev => {
                                    const newSet = new Set(prev);
                                    newSet.delete(producto.id);
                                    return newSet;
                                  });
                                  alert('Error al cambiar el estado');
                                }
                              } catch (error) {
                                setSwitchingStates(prev => {
                                  const newSet = new Set(prev);
                                  newSet.delete(producto.id);
                                  return newSet;
                                });
                                alert('Error de conexión');
                              }
                            }
                          }}
                          className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border transition-all duration-200 hover:scale-105 ${
                              switchingStates.has(producto.id) 
                                ? 'animate-pulse opacity-70'
                                : producto.status === 'DISPONIBLE'
                                ? 'bg-green-100 text-green-800 border-green-200 hover:bg-green-200'
                                : producto.status === 'AGOTADO'
                                ? 'bg-red-100 text-red-800 border-red-200 hover:bg-red-200'
                                : 'bg-neutral-800 text-neutral-100 border-neutral-700 hover:bg-neutral-700'
                          }`}
                          title={`Click para cambiar estado - Actualmente: ${
                            producto.status === 'DISPONIBLE' ? 'Disponible' : 
                            producto.status === 'AGOTADO' ? 'No Disponible' : 
                            'Suspendido'
                          }`}
                        >
                          {producto.status === 'DISPONIBLE' ? 'Disponible' : 
                           producto.status === 'AGOTADO' ? 'No Disponible' : 
                           'Suspendido'}
                        </button>
                      </td>

                      {/* Fecha de publicación */}
                      <td className="px-6 py-4">
                        <div className="text-sm text-neutral-100">
                          {new Date(producto.createdAt).toLocaleDateString('es-ES', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric'
                          })}
                        </div>
                        <div className="text-xs text-neutral-400">
                          {new Date(producto.createdAt).toLocaleTimeString('es-ES', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </div>
                      </td>

                      {/* Acciones */}
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center space-x-2">
                          
                          {/* Ver detalles */}
                          <button
                            onClick={() => {
                              setSelectedProduct(producto);
                              setShowPreviewModal(true);
                            }}
                            className="p-2 text-white hover:text-green-400 hover:bg-neutral-700 rounded-lg transition-colors duration-150 border border-transparent hover:border-neutral-600"
                            title="Ver detalles completos"
                          >
                            <Eye className="h-4 w-4" />
                          </button>

                          {/* Editar */}
                          <button
                            onClick={() => handleEditarProducto(producto)}
                            className="p-2 text-green-600 hover:text-green-800 hover:bg-green-50 rounded-lg transition-colors border border-transparent hover:border-green-200"
                            title="Editar producto"
                          >
                            <Edit className="h-4 w-4" />
                          </button>

                          {/* Eliminar */}
                          <button
                            onClick={() => {
                              setSelectedProduct(producto);
                              setShowDeleteModal(true);
                            }}
                            className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-200"
                            title="Eliminar producto"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Footer con información básica */}
            <div className="bg-neutral-900 px-6 py-3 border-t border-neutral-700">
              <div className="flex items-center justify-between text-sm">
                <span className="text-neutral-300">
                  Mostrando <span className="font-medium">{productosFiltrados.length}</span> de{' '}
                  <span className="font-medium">{productos.length}</span> productos
                </span>
                <span className="text-neutral-400">
                  <span className="text-neutral-300 font-medium">{productos.filter(p => p.status === 'DISPONIBLE').length} disponibles</span> • <span className="text-neutral-300 font-medium">{productos.filter(p => p.status === 'AGOTADO').length} agotados</span>
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Modal de confirmación de eliminación */}
        {showDeleteModal && selectedProduct && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-all">
            <div className="bg-neutral-800 rounded-xl max-w-md w-full shadow-xl flex flex-col items-center p-10">
              <div className="mb-4">
                <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100">
                  <Trash2 className="h-8 w-8 text-red-600" />
                </div>
              </div>
              <h2 className="text-xl font-bold text-red-500 mb-2 text-center">¿Eliminar producto?</h2>
              <p className="text-neutral-300 text-center mb-2">¿Estás seguro de que deseas eliminar <span className='font-semibold'>{selectedProduct.name}</span>? Esta acción no se puede deshacer.</p>
              <div className="flex gap-4 mt-4 w-full">
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setSelectedProduct(null);
                  }}
                  className="flex-1 px-4 py-2 bg-neutral-700 text-neutral-200 rounded-lg font-semibold hover:bg-neutral-600 transition-all"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => handleEliminar(selectedProduct.id)}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-all"
                >
                  Eliminar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal de previsualización de producto */}
        {showPreviewModal && selectedProduct && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-all">
            <div className="bg-neutral-800 rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto scrollbar-hide">
              <div className="flex items-center justify-between p-6 border-b border-neutral-700">
                <h3 className="text-xl font-semibold text-neutral-100">Vista Previa del Producto</h3>
                <button
                  onClick={() => setShowPreviewModal(false)}
                  className="text-neutral-400 hover:text-neutral-200 transition-colors"
                >
                  <Info className="w-6 h-6" />
                </button>
              </div>
              <div className="p-6 flex flex-col items-center">
                {/* Card extendida con todos los datos del producto */}
                <div className="bg-neutral-800 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden w-full">
                  {/* Imagen del producto */}
                  <div className="h-48 bg-neutral-700 relative">
                    {selectedProduct.imageUrl ? (
                      <img
                        src={selectedProduct.imageUrl}
                        alt={selectedProduct.name || 'Producto'}
                        className="w-full h-full object-cover"
                        onError={e => { e.currentTarget.src = '/placeholder-product.jpg'; }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-neutral-400">
                        <span className="text-4xl">🥬</span>
                      </div>
                    )}
                  </div>
                  {/* Contenido de la tarjeta */}
                  <div className="p-4">
                    <h3 className="text-lg font-semibold text-neutral-100 mb-2 line-clamp-1">
                      {selectedProduct.name || 'Nombre del producto'}
                    </h3>
                    {/* Etiquetas de categoría y subcategoría debajo del nombre */}
                    <div className="flex flex-wrap gap-2 mb-2">
                      {selectedProduct.category?.name && (
                        <span key={`category-${selectedProduct.id}`} className="bg-white text-blue-700 text-xs px-2 py-1 rounded-full border border-neutral-200">
                          {selectedProduct.category.name}
                        </span>
                      )}
                      {selectedProduct.subcategoryId && (
                        <span key={`subcategory-${selectedProduct.id}`} className="bg-white text-blue-700 text-xs px-2 py-1 rounded-full border border-neutral-200">
                          {subcategorias.find(s => s.id === selectedProduct.subcategoryId)?.name || 'Subcategoría'}
                        </span>
                      )}
                    </div>
                    <p className="text-neutral-300 text-sm mb-3 line-clamp-2">
                      {selectedProduct.description || 'Sin descripción.'}
                    </p>
                    {/* Precio y stock */}
                    <div className="flex items-center justify-between mb-3">
                      <div className="text-2xl font-bold text-green-600">
                        {selectedProduct.price ? `$${Number(selectedProduct.price).toLocaleString()}` : '$0'}
                        <span className="text-sm font-normal text-neutral-400">
                          /{selectedProduct.unit || 'unidad'}
                        </span>
                      </div>
                        <div className="text-sm text-neutral-400">
                        Stock: {selectedProduct.stock || 0}
                      </div>
                    </div>
                    {/* Agricultor (simulado) */}
                    <div className="text-xs text-neutral-400 mb-1">
                      Por: Tú (previsualización)
                    </div>
                    {/* Ubicación */}
                    <div className="flex items-center gap-2 text-xs text-neutral-400 mb-1">
                      <MapPin className="w-4 h-4" />
                      <span>{selectedProduct.municipio || 'Municipio'}</span>
                      {selectedProduct.vereda && <span key={`vereda-${selectedProduct.id}`}>- {selectedProduct.vereda}</span>}
                    </div>
                    {/* Certificaciones */}
                    {Array.isArray(selectedProduct.certificaciones) && selectedProduct.certificaciones.length > 0 && (
                      <div key={`certs-${selectedProduct.id}`} className="flex flex-wrap gap-2 mb-2">
                        {selectedProduct.certificaciones.map((cert: string) => (
                          <span key={cert} className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-medium border border-green-200">{cert}</span>
                        ))}
                      </div>
                    )}
                    {/* Tipo de cultivo, fecha de cosecha, peso, dimensiones */}
                      <div className="grid grid-cols-2 gap-2 text-xs text-neutral-400 mb-2">
                      <div><span className="font-semibold">Cultivo:</span> {selectedProduct.tipoCultivo || 'N/A'}</div>
                      <div><span className="font-semibold">Cosecha:</span> {selectedProduct.fechaCosecha || 'N/A'}</div>
                      <div><span className="font-semibold">Peso:</span> {selectedProduct.pesoAproximado || 'N/A'} kg</div>
                    </div>
                    {/* Condiciones de almacenamiento removed */}
                    {/* Métodos de entrega */}
                    {Array.isArray(selectedProduct.metodosEntrega) && selectedProduct.metodosEntrega.length > 0 && (
                      <div key={`delivery-${selectedProduct.id}`} className="flex flex-wrap gap-2 mb-2">
                        {selectedProduct.metodosEntrega.map((metodo: string) => (
                          <span key={metodo} className="bg-white text-blue-700 px-2 py-1 rounded text-xs font-medium border border-neutral-200">
                            {metodo}
                          </span>
                        ))}
                      </div>
                    )}
                    {/* Notas especiales */}
                    {selectedProduct.notasEspeciales && (
                      <div key={`notes-${selectedProduct.id}`} className="text-xs text-neutral-400 mb-2">
                        <span className="font-semibold">Notas:</span> {selectedProduct.notasEspeciales}
                      </div>
                    )}
                    {/* Botón de acción (deshabilitado en preview) */}
                    <button className="w-full bg-green-600 text-white py-2 px-4 rounded-lg opacity-60 cursor-not-allowed font-medium mt-2" disabled>
                      Agregar al Carrito
                    </button>
                  </div>
                </div>
                <div className="mt-4 p-3 bg-blue-50 rounded-lg w-full">
                  <div className="flex items-start">
                    <Info className="w-5 h-5 text-blue-600 mr-2 flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-blue-800">
                      <p className="font-medium">Vista previa</p>
                      <p>Así es como los compradores verán tu producto en el marketplace.</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between p-6 border-t border-neutral-700 bg-neutral-900">
                <button
                  onClick={() => setShowPreviewModal(false)}
                  className="px-4 py-2 text-neutral-300 hover:text-neutral-100 transition-colors"
                >
                  Cerrar Vista Previa
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal de edición - Replicando estructura de publicar */}
        {showEditModal && selectedProduct && (
          <div className="fixed inset-0 bg-black/40 z-50 flex items-start justify-center p-4">
            <div className="relative w-full max-w-6xl max-h-[90vh] overflow-y-auto bg-neutral-800 rounded-xl shadow-2xl my-8 scrollbar-hide">
              <style jsx global>{`
                .scrollbar-hide {
                  -ms-overflow-style: none;
                  scrollbar-width: none;
                }
                .scrollbar-hide::-webkit-scrollbar {
                  display: none;
                }
              `}</style>
              
                    <div className="sticky top-0 bg-neutral-800 border-b border-neutral-700 px-6 py-4 rounded-t-xl z-10">
                {/* Header del modal */}
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-2xl font-bold text-neutral-100">Editar Producto</h3>
                    <p className="text-sm text-neutral-300 mt-1">
                      Modifica la información de tu producto &quot;{selectedProduct.name}&quot;
                    </p>
                  </div>
                  <button
                    onClick={handleCancelarEdicion}
                    className="text-neutral-400 hover:text-neutral-200 transition-colors p-2 hover:bg-neutral-700 rounded-full"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>
              </div>

              <div className="p-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  
                  {/* Columna principal - Información básica */}
                  <div className="lg:col-span-2 space-y-6">
                    
                    {/* Información del producto */}
                    <div className="bg-neutral-900 border border-neutral-700 rounded-xl p-6">
                      <div className="flex items-center space-x-3 mb-4">
                        <div className="p-2 bg-green-100 rounded-lg">
                          <Package className="w-5 h-5 text-green-600" />
                        </div>
                        <h4 className="text-lg font-semibold text-neutral-100">Información del Producto</h4>
                      </div>
                      
                      <div className="space-y-4">
                        {/* Nombre del producto */}
                        <div>
                          <label className="block text-sm font-semibold text-neutral-200 mb-2">
                            Nombre del producto *
                          </label>
                          <input
                            type="text"
                            value={editForm.name}
                            onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                            className="w-full px-4 py-3 border border-neutral-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-green-600 transition-all bg-neutral-800 text-neutral-100 font-medium"
                            placeholder="Ej: Plátano Hartón Premium"
                          />
                        </div>

                        {/* Descripción */}
                        <div>
                          <label className="block text-sm font-semibold text-neutral-200 mb-2">
                            Descripción *
                          </label>
                          <textarea
                            value={editForm.description}
                            onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                            rows={4}
                            className="w-full px-4 py-3 border border-neutral-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-green-600 transition-all bg-neutral-800 resize-none text-neutral-100 font-medium"
                            placeholder="Describe tu producto, cómo fue cultivado, características especiales..."
                          />
                        </div>

                        {/* Categoría */}
                        <div>
                          <label className="block text-sm font-semibold text-neutral-200 mb-2">
                            Categoría *
                          </label>
                          <select
                            value={editForm.categoryId}
                            onChange={(e) => setEditForm({ ...editForm, categoryId: e.target.value })}
                            className="w-full border border-green-200 rounded-lg px-4 py-2 bg-neutral-800 text-neutral-100 focus:border-green-400 transition-all"
                          >
                            <option value="">Seleccionar categoría</option>
                            {categorias.map((categoria) => (
                              <option key={categoria.id} value={categoria.id}>
                                {categoria.name}
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Tipo de cultivo */}
                        <div>
                          <label className="block text-sm font-semibold text-neutral-200 mb-2">
                            Tipo de cultivo
                          </label>
                          <div className="grid grid-cols-2 gap-3">
                            <button
                              type="button"
                              onClick={() => setEditForm({ ...editForm, tipoCultivo: 'convencional' })}
                              className={`flex items-center justify-center p-3 border rounded-lg transition-all ${
                                  editForm.tipoCultivo === 'convencional'
                                    ? 'border-green-500 bg-green-700 text-white'
                                    : 'border-neutral-700 hover:border-neutral-600 bg-neutral-800 text-neutral-100'
                                }`}
                            >
                              <span className="mr-2">🌾</span>
                              Convencional
                            </button>
                            <button
                              type="button"
                              onClick={() => setEditForm({ ...editForm, tipoCultivo: 'organico' })}
                              className={`flex items-center justify-center p-3 border rounded-lg transition-all ${
                                  editForm.tipoCultivo === 'organico'
                                    ? 'border-green-500 bg-green-700 text-white'
                                    : 'border-neutral-700 hover:border-neutral-600 bg-neutral-800 text-neutral-100'
                                }`}
                            >
                              <span className="mr-2">🍃</span>
                              Orgánico
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Precio y cantidades */}
                    <div className="bg-neutral-900 border border-neutral-700 rounded-xl p-6">
                      <div className="flex items-center space-x-3 mb-4">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <DollarSign className="w-5 h-5 text-blue-600" />
                        </div>
                        <h4 className="text-lg font-semibold text-neutral-100">Precio y Cantidades</h4>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Precio */}
                        <div>
                          <label className="block text-sm font-semibold text-neutral-200 mb-2">
                            Precio *
                          </label>
                          <input
                            type="number"
                            value={editForm.price}
                            onChange={(e) => setEditForm({ ...editForm, price: e.target.value })}
                            min="0"
                            step="100"
                            className="w-full px-4 py-3 border border-neutral-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-green-600 transition-all bg-neutral-800 text-neutral-100 font-medium"
                            placeholder="2500"
                          />
                        </div>

                        {/* Unidad */}
                        <div>
                          <label className="block text-sm font-semibold text-neutral-200 mb-2">
                            Unidad de medida *
                          </label>
                          <select
                            value={editForm.unit}
                            onChange={(e) => setEditForm({ ...editForm, unit: e.target.value })}
                            className="w-full border border-green-200 rounded-lg px-4 py-2 bg-neutral-800 text-neutral-100 focus:border-green-400 transition-all"
                          >
                            <option value="">Seleccionar unidad</option>
                            {unidades.map((unidad) => (
                              <option key={unidad.value} value={unidad.value}>
                                {unidad.icon} {unidad.label}
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Stock disponible */}
                        <div>
                          <label className="block text-sm font-semibold text-neutral-200 mb-2">
                            Stock disponible *
                          </label>
                          <input
                            type="number"
                            value={editForm.stock}
                            onChange={(e) => setEditForm({ ...editForm, stock: e.target.value })}
                            min="0"
                            className="w-full px-4 py-3 border border-neutral-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-green-600 transition-all bg-neutral-800 text-neutral-100 font-medium"
                            placeholder="50"
                          />
                        </div>

                        {/* Stock mínimo */}
                        <div>
                          <label className="block text-sm font-semibold text-neutral-200 mb-2">
                            Stock mínimo
                          </label>
                          <input
                            type="number"
                            value={editForm.stockMinimo}
                            onChange={(e) => setEditForm({ ...editForm, stockMinimo: e.target.value })}
                            min="0"
                            className="w-full px-4 py-3 border border-neutral-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-green-600 transition-all bg-neutral-800 text-neutral-100 font-medium"
                            placeholder="10"
                          />
                        </div>

                        {/* Peso aproximado */}
                        <div>
                          <label className="block text-sm font-semibold text-neutral-200 mb-2">
                            Peso aproximado (kg)
                          </label>
                          <input
                            type="number"
                            value={editForm.pesoAproximado}
                            onChange={(e) => setEditForm({ ...editForm, pesoAproximado: e.target.value })}
                            min="0"
                            step="0.1"
                            className="w-full px-4 py-3 border border-neutral-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-green-600 transition-all bg-neutral-800 text-neutral-100 font-medium"
                            placeholder="1.5"
                          />
                        </div>

                        
                      </div>
                    </div>

                    {/* Ubicación y entrega */}
                    <div className="bg-neutral-900 border border-neutral-700 rounded-xl p-6">
                      <div className="flex items-center space-x-3 mb-4">
                        <div className="p-2 bg-orange-100 rounded-lg">
                          <MapPin className="w-5 h-5 text-orange-600" />
                        </div>
                        <h4 className="text-lg font-semibold text-neutral-100">Ubicación y Entrega</h4>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Municipio */}
                        <div>
                          <label className="block text-sm font-semibold text-neutral-200 mb-2">
                            Municipio
                          </label>
                          <input
                            type="text"
                            value={editForm.municipio}
                            onChange={(e) => setEditForm({ ...editForm, municipio: e.target.value })}
                            className="w-full px-4 py-3 border border-neutral-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-green-600 transition-all bg-neutral-800 text-neutral-100 font-medium"
                            placeholder="Ej: Medellín"
                          />
                        </div>

                        {/* Vereda */}
                        <div>
                          <label className="block text-sm font-semibold text-neutral-200 mb-2">
                            Vereda
                          </label>
                          <input
                            type="text"
                            value={editForm.vereda}
                            onChange={(e) => setEditForm({ ...editForm, vereda: e.target.value })}
                            className="w-full px-4 py-3 border border-neutral-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-green-600 transition-all bg-neutral-800 text-neutral-100 font-medium"
                            placeholder="Ej: Santa Elena"
                          />
                        </div>

                        {/* Tiempo de entrega */}
                        <div>
                          <label className="block text-sm font-semibold text-neutral-200 mb-2">
                            Tiempo de entrega (días)
                          </label>
                          <input
                            type="number"
                            value={editForm.tiempoEntrega}
                            onChange={(e) => setEditForm({ ...editForm, tiempoEntrega: e.target.value })}
                            min="1"
                            className="w-full px-4 py-3 border border-neutral-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-green-600 transition-all bg-neutral-800 text-neutral-100 font-medium"
                            placeholder="1"
                          />
                        </div>

                        {/* Fecha de cosecha */}
                        <div>
                          <label className="block text-sm font-semibold text-neutral-200 mb-2">
                            <Calendar className="w-4 h-4 inline mr-2" />
                            Fecha de cosecha
                          </label>
                          <input
                            type="date"
                            value={editForm.fechaCosecha}
                            onChange={(e) => setEditForm({ ...editForm, fechaCosecha: e.target.value })}
                            className="w-full px-4 py-3 border border-neutral-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-green-600 transition-all bg-neutral-800 text-neutral-100 font-medium"
                          />
                        </div>

                        {/* Horarios disponibles */}
                        <div>
                          <label className="block text-sm font-semibold text-neutral-200 mb-2">
                            Horarios disponibles
                          </label>
                          <input
                            type="text"
                            value={editForm.horariosDisponibles}
                            onChange={(e) => setEditForm({ ...editForm, horariosDisponibles: e.target.value })}
                            className="w-full px-4 py-3 border border-neutral-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-green-600 transition-all bg-neutral-800 text-neutral-100 font-medium"
                            placeholder="Lunes a viernes 8:00 AM - 5:00 PM"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Información adicional */}
                    <div className="bg-neutral-800 rounded-xl shadow-lg p-6 mt-6">
                      <h4 className="text-lg font-semibold text-neutral-100 mb-4">Información Adicional</h4>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        
                        {/* Notas especiales */}
                        <div>
                          <label className="block text-sm font-semibold text-neutral-200 mb-2">
                            Notas especiales
                          </label>
                          <textarea
                            value={editForm.notasEspeciales}
                            onChange={(e) => setEditForm({ ...editForm, notasEspeciales: e.target.value })}
                            rows={3}
                            className="w-full px-4 py-3 border border-neutral-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-green-600 transition-all bg-neutral-800 text-neutral-100 font-medium resize-none"
                            placeholder="Información adicional importante..."
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Columna lateral - Información adicional */}
                  <div className="space-y-6">
                    
                    {/* Estado del producto */}
                    <div className="bg-neutral-900 border border-neutral-700 rounded-xl p-6">
                      <h4 className="text-lg font-semibold text-neutral-100 mb-4">Estado del Producto</h4>
                      <select
                        value={editForm.status}
                        onChange={(e) => setEditForm({ ...editForm, status: e.target.value as 'DISPONIBLE' | 'AGOTADO' })}
                        className="w-full border border-green-200 rounded-lg px-4 py-2 bg-neutral-800 text-neutral-100 focus:border-green-400 transition-all"
                      >
                        <option value="DISPONIBLE">✅ Disponible</option>
                        <option value="AGOTADO">❌ Agotado</option>
                      </select>
                    </div>

                    {/* Imagen del producto */}
                    <div className="bg-neutral-900 border border-neutral-700 rounded-xl p-6">
                      <h4 className="text-lg font-semibold text-neutral-100 mb-4">
                        <Camera className="w-5 h-5 inline mr-2" />
                        Imagen del Producto
                      </h4>
                      <div className="space-y-4">
                        {editForm.imagePreview && (
                          <div className="aspect-w-16 aspect-h-9 bg-neutral-700 rounded-lg overflow-hidden">
                            <img
                              src={editForm.imagePreview}
                              alt="Vista previa"
                              className="w-full h-32 object-cover rounded-lg"
                            />
                          </div>
                        )}
                        <input
                          type="file"
                          accept="image/*"
                          onChange={e => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const reader = new FileReader();
                              reader.onloadend = () => {
                                setEditForm(f => ({ ...f, imagePreview: reader.result as string, imageUrl: '' }));
                              };
                              reader.readAsDataURL(file);
                            }
                          }}
                          className="w-full px-4 py-3 border border-neutral-700 rounded-lg bg-neutral-800 text-neutral-100 font-medium"
                        />
                        <input
                          type="url"
                          value={editForm.imageUrl}
                          onChange={e => setEditForm(f => ({ ...f, imageUrl: e.target.value, imagePreview: e.target.value }))}
                          className="w-full px-4 py-3 border border-neutral-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-green-600 transition-all bg-neutral-800 text-neutral-100 font-medium"
                          placeholder="https://ejemplo.com/imagen.jpg"
                        />
                      </div>
                    </div>

                    {/* Certificaciones */}
                    <div className="bg-neutral-900 border border-neutral-700 rounded-xl p-6">
                      <h4 className="text-lg font-semibold text-neutral-100 mb-4">
                        <Award className="w-5 h-5 inline mr-2" />
                        Certificaciones
                      </h4>
                      <div className="grid grid-cols-1 gap-2">
                        {certificacionesDisponibles.map((cert) => (
                          <button
                            key={cert}
                            type="button"
                            onClick={() => toggleCertificacion(cert)}
                            className={`px-3 py-2 rounded-lg border-2 text-left transition-colors ${
                              editForm.certificaciones.includes(cert)
                                ? 'border-green-500 bg-green-700 text-white font-semibold'
                                : 'border-neutral-700 bg-neutral-800 text-neutral-300 hover:border-green-300 hover:bg-neutral-700'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-sm">{cert}</span>
                              {editForm.certificaciones.includes(cert) && (
                                <Check className="w-4 h-4 text-green-600 font-bold" />
                              )}
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Métodos de entrega */}
                    <div className="bg-neutral-900 border border-neutral-700 rounded-xl p-6">
                      <h4 className="text-lg font-semibold text-neutral-100 mb-4">
                        <Truck className="w-5 h-5 inline mr-2" />
                        Métodos de entrega
                      </h4>
                      <div className="grid grid-cols-1 gap-2">
                        {metodosEntregaDisponibles.map((metodo) => (
                          <button
                            key={metodo.value}
                            type="button"
                            onClick={() => toggleMetodoEntrega(metodo.value)}
                            className={`px-3 py-2 rounded-lg border-2 text-left transition-colors ${
                              editForm.metodosEntrega.includes(metodo.value)
                                ? 'border-green-500 bg-green-700 text-white font-semibold'
                                : 'border-neutral-700 bg-neutral-800 text-neutral-300 hover:border-green-300 hover:bg-neutral-700'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-sm">
                                {metodo.icon} {metodo.label}
                              </span>
                              {editForm.metodosEntrega.includes(metodo.value) && (
                                <Check className="w-4 h-4 text-green-600 font-bold" />
                              )}
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Botones de acción */}
                    <div className="bg-neutral-900 border border-neutral-700 rounded-xl p-6">
                      <div className="space-y-3">
                        <button
                          onClick={handleConfirmUpdate}
                          disabled={editLoading}
                          className="w-full px-6 py-3 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                        >
                          {editLoading ? (
                            <div className="flex items-center justify-center">
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                              Actualizando...
                            </div>
                          ) : (
                            'Actualizar Producto'
                          )}
                        </button>
                        
                        <button
                          onClick={handleCancelarEdicion}
                          disabled={editLoading}
                          className="w-full px-6 py-3 border border-neutral-700 rounded-lg text-sm font-semibold text-neutral-100 bg-neutral-800 hover:bg-neutral-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 transition-all"
                        >
                          Cancelar
                        </button>
                      </div>
                    </div>

                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal de Confirmación de Actualización */}
        {showConfirmUpdateModal && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-neutral-800 rounded-xl shadow-2xl p-6 max-w-md w-full mx-4 border border-neutral-700">
              <div className="text-center">
                {/* Icono de pregunta */}
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full mb-4">
                  <div className="bg-blue-100 rounded-full p-3">
                    <Edit className="h-6 w-6 text-blue-600" />
                  </div>
                </div>

                {/* Título */}

                <h3 className="text-lg font-medium text-neutral-100 mb-2">
                  Confirmar Actualización
                </h3>

                {/* Mensaje */}
                <p className="text-sm text-neutral-300 mb-6">
                  ¿Estás seguro de que quieres actualizar este producto? Los cambios se guardarán permanentemente.
                </p>

                {/* Botones */}
                <div className="flex space-x-3">
                  <button
                    onClick={() => setShowConfirmUpdateModal(false)}
                    disabled={editLoading}
                    className="flex-1 px-4 py-2 border border-neutral-700 text-neutral-200 rounded-lg font-medium hover:bg-neutral-700 transition-colors disabled:opacity-50"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleActualizarProducto}
                    disabled={editLoading}
                    className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {editLoading ? (
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Actualizando...
                      </div>
                    ) : (
                      'Sí, Actualizar'
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal de Mensaje (Confirmación/Error) */}
        {showMessageModal && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-neutral-800 rounded-xl shadow-2xl p-6 max-w-md w-full mx-4 border border-neutral-700">
              <div className="text-center">
                {/* Icono según el tipo de mensaje */}
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full mb-4">
                  {messageType === 'success' ? (
                    <div key="success-icon" className="bg-green-100 rounded-full p-3">
                      <CheckCircle className="h-6 w-6 text-green-600" />
                    </div>
                  ) : (
                    <div key="error-icon" className="bg-red-100 rounded-full p-3">
                      <AlertCircle className="h-6 w-6 text-red-600" />
                    </div>
                  )}
                </div>

                {/* Título */}
                <h3 className={`text-lg font-medium mb-2 ${
                  messageType === 'success' ? 'text-green-900' : 'text-red-900'
                }`}>
                  {messageType === 'success' ? '¡Éxito!' : 'Error'}
                </h3>

                {/* Mensaje */}
                <p className={`text-sm mb-6 ${
                  messageType === 'success' ? 'text-green-700' : 'text-red-700'
                }`}>
                  {messageText}
                </p>

                {/* Botón de cerrar */}
                <button
                  onClick={() => setShowMessageModal(false)}
                  className={`w-full px-4 py-2 rounded-lg font-medium transition-colors ${
                    messageType === 'success' 
                      ? 'bg-green-600 text-white hover:bg-green-700' 
                      : 'bg-red-600 text-white hover:bg-red-700'
                  }`}
                >
                  Entendido
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
