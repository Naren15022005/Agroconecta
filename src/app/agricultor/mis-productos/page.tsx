'use client';

import { useState, useEffect } from 'react';
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
  AlertCircle
} from 'lucide-react';

interface Product {
  id: string;
  name: string;
  description: string;
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
  dimensiones?: string;
  condicionesAlmacenamiento?: string;
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
    status: 'DISPONIBLE' as 'DISPONIBLE' | 'AGOTADO' | 'SUSPENDIDO',
    // Campos adicionales para mantener consistencia con publicar
    stockMinimo: '',
    tipoCultivo: 'convencional' as 'organico' | 'convencional',
    municipio: '',
    vereda: '',
    fechaCosecha: '',
    tiempoEntrega: '1',
    pesoAproximado: '',
    dimensiones: '',
    condicionesAlmacenamiento: '',
    certificaciones: [] as string[],
    metodosEntrega: ['domicilio'] as string[],
    horariosDisponibles: '',
    notasEspeciales: ''
  });

  // Cargar productos del agricultor
  useEffect(() => {
    if (session?.user?.id) {
      cargarMisProductos();
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
    const matchEstado = filtroEstado === 'todos' || 
                       (filtroEstado === 'disponible' && producto.status === 'DISPONIBLE') ||
                       (filtroEstado === 'agotado' && producto.status === 'AGOTADO');
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
      name: producto.name,
      description: producto.description || '',
      price: producto.price.toString(),
      stock: producto.stock.toString(),
      unit: producto.unit,
      categoryId: producto.categoryId,
      imageUrl: producto.imageUrl || '',
      status: producto.status,
      // Usar valores reales de la base de datos
      stockMinimo: producto.stockMinimo?.toString() || '10',
      tipoCultivo: producto.tipoCultivo === 'ORGANICO' ? 'organico' : 'convencional',
      municipio: producto.municipio || '',
      vereda: producto.vereda || '',
      fechaCosecha: producto.fechaCosecha ? producto.fechaCosecha.split('T')[0] : '', // Convertir fecha a formato YYYY-MM-DD
      tiempoEntrega: producto.tiempoEntrega || '1',
      pesoAproximado: producto.pesoAproximado?.toString() || '',
      dimensiones: producto.dimensiones || '',
      condicionesAlmacenamiento: producto.condicionesAlmacenamiento || '',
      certificaciones: producto.certificaciones || [],
      metodosEntrega: producto.metodosEntrega || ['domicilio'],
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
        const productoActualizado = await res.json();
        
        // Actualizar la lista de productos
        setProductos(productos.map(p => 
          p.id === selectedProduct.id 
            ? {
                ...productoActualizado,
                category: { 
                  id: productoActualizado.categoryId, 
                  name: categorias.find(c => c.id === productoActualizado.categoryId)?.name || ''
                }
              }
            : p
        ));
        
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
      status: 'DISPONIBLE',
      stockMinimo: '',
      tipoCultivo: 'convencional',
      municipio: '',
      vereda: '',
      fechaCosecha: '',
      tiempoEntrega: '1',
      pesoAproximado: '',
      dimensiones: '',
      condicionesAlmacenamiento: '',
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
                  
                  {/* Custom Dropdown */}
                  <div className="relative">
                    <button
                      onClick={() => setShowFilterDropdown(!showFilterDropdown)}
                      className="inline-flex items-center justify-between w-48 px-4 py-2.5 text-sm font-medium text-gray-900 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200"
                    >
                      <span className="flex items-center">
                        {filtroEstado === 'todos' && (
                          <>
                            <span className="w-2 h-2 bg-gray-400 rounded-full mr-2"></span>
                            Todos los estados
                          </>
                        )}
                        {filtroEstado === 'disponible' && (
                          <>
                            <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                            Disponibles
                          </>
                        )}
                        {filtroEstado === 'agotado' && (
                          <>
                            <span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
                            Agotados
                          </>
                        )}
                      </span>
                      <ChevronDown className={`w-4 h-4 text-gray-600 transition-transform duration-200 ${showFilterDropdown ? 'rotate-180' : ''}`} />
                    </button>

                    {/* Dropdown Menu */}
                    {showFilterDropdown && (
                      <>
                        {/* Overlay para cerrar al hacer click fuera */}
                        <div 
                          className="fixed inset-0 z-10" 
                          onClick={() => setShowFilterDropdown(false)}
                        ></div>
                        
                        <div className="absolute z-20 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden">
                          <div className="py-1">
                            <button
                              onClick={() => {
                                setFiltroEstado('todos');
                                setShowFilterDropdown(false);
                              }}
                              className={`w-full px-4 py-2.5 text-left text-sm flex items-center justify-between hover:bg-gray-50 transition-colors ${
                                filtroEstado === 'todos' ? 'bg-green-50 text-green-900' : 'text-gray-900'
                              }`}
                            >
                              <span className="flex items-center">
                                <span className="w-2 h-2 bg-gray-400 rounded-full mr-3"></span>
                                Todos los estados
                              </span>
                              {filtroEstado === 'todos' && <Check className="w-4 h-4 text-green-600" />}
                            </button>
                            
                            <button
                              onClick={() => {
                                setFiltroEstado('disponible');
                                setShowFilterDropdown(false);
                              }}
                              className={`w-full px-4 py-2.5 text-left text-sm flex items-center justify-between hover:bg-gray-50 transition-colors ${
                                filtroEstado === 'disponible' ? 'bg-green-50 text-green-900' : 'text-gray-900'
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
                              className={`w-full px-4 py-2.5 text-left text-sm flex items-center justify-between hover:bg-gray-50 transition-colors ${
                                filtroEstado === 'agotado' ? 'bg-green-50 text-green-900' : 'text-gray-900'
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
                      </>
                    )}
                  </div>
                </div>
                
                {/* Botón Agregar Producto */}
                <button
                  onClick={() => window.location.href = '/agricultor/publicar'}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Agregar Producto
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
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <div className="mx-auto w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <Package className="h-10 w-10 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {productos.length === 0 ? 'Sin productos publicados' : 'No se encontraron productos'}
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
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
              >
                <Plus className="h-4 w-4 mr-2" />
                Publicar Primer Producto
              </button>
            )}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            
            {/* Tabla de productos */}
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                
                {/* Encabezado */}
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Producto
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Categoría
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Precio
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Stock
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Estado
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Fecha Publicación
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>

                {/* Cuerpo de la tabla */}
                <tbody className="bg-white divide-y divide-gray-100">
                  {productosFiltrados.map((producto, index) => (
                    <tr 
                      key={producto.id} 
                      className={`${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-blue-50 transition-colors duration-150`}
                    >
                      
                      {/* Información del producto */}
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-4">
                          <div className="flex-shrink-0">
                            {producto.imageUrl ? (
                              <img
                                className="h-14 w-14 rounded-lg object-cover border border-gray-200"
                                src={producto.imageUrl}
                                alt={producto.name}
                                onError={(e) => {
                                  e.currentTarget.src = '/placeholder-product.jpg';
                                }}
                              />
                            ) : (
                              <div className="h-14 w-14 rounded-lg bg-gray-100 flex items-center justify-center border border-gray-200">
                                <Package className="h-7 w-7 text-gray-400" />
                              </div>
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <h4 className="text-sm font-semibold text-gray-900 truncate max-w-xs" title={producto.name}>
                              {producto.name}
                            </h4>
                            <p className="text-sm text-gray-500 truncate max-w-xs mt-1" title={producto.description}>
                              {producto.description}
                            </p>
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-700 mt-1" title={`ID completo: ${producto.id}`}>
                              ID: {producto.id}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Categoría */}
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200">
                          {producto.category?.name || 'Sin categoría'}
                        </span>
                      </td>

                      {/* Precio */}
                      <td className="px-6 py-4">
                        <div className="text-sm font-bold text-gray-900">
                          ${Number(producto.price).toLocaleString('es-CO')}
                        </div>
                        <div className="text-xs text-gray-500">
                          por {producto.unit}
                        </div>
                      </td>

                      {/* Stock */}
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <div className="text-sm font-medium text-gray-900">
                            {producto.stock} {producto.unit}
                          </div>
                          
                          {/* Alertas de stock */}
                          {producto.stock === 0 && (
                            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
                              Sin stock
                            </span>
                          )}
                          {producto.stock > 0 && producto.stock <= 5 && (
                            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
                              Stock bajo
                            </span>
                          )}
                          
                          {/* Stock reservado */}
                          {producto.reservedStock > 0 && (
                            <div className="text-xs text-orange-600">
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
                            
                            if (confirm(`¿Confirmas ${accion} el producto "${producto.name}"?`)) {
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
                              : 'bg-gray-100 text-gray-800 border-gray-200 hover:bg-gray-200'
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
                        <div className="text-sm text-gray-900">
                          {new Date(producto.createdAt).toLocaleDateString('es-ES', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric'
                          })}
                        </div>
                        <div className="text-xs text-gray-500">
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
                              const info = `
DETALLES DEL PRODUCTO

📦 ${producto.name}
📝 ${producto.description}
�️ ${producto.category?.name || 'Sin categoría'}

💰 PRECIO: $${Number(producto.price).toLocaleString('es-CO')} por ${producto.unit}
📊 STOCK: ${producto.stock} ${producto.unit}
${producto.reservedStock > 0 ? `🔒 RESERVADO: ${producto.reservedStock} ${producto.unit}` : ''}

📈 ESTADO: ${producto.status === 'DISPONIBLE' ? 'Disponible' : 'Agotado'}

📅 PUBLICADO: ${new Date(producto.createdAt).toLocaleDateString('es-ES')}
🔄 ACTUALIZADO: ${new Date(producto.updatedAt).toLocaleDateString('es-ES')}

🆔 ID: ${producto.id}
                              `;
                              alert(info.trim());
                            }}
                            className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors border border-transparent hover:border-blue-200"
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
            <div className="bg-gray-50 px-6 py-3 border-t border-gray-200">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-700">
                  Mostrando <span className="font-medium">{productosFiltrados.length}</span> de{' '}
                  <span className="font-medium">{productos.length}</span> productos
                </span>
                <span className="text-gray-500">
                  <span className="text-green-600 font-medium">{productos.filter(p => p.status === 'DISPONIBLE').length} disponibles</span> • <span className="text-red-600 font-medium">{productos.filter(p => p.status === 'AGOTADO').length} agotados</span>
                </span>
              </div>
            </div>
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

        {/* Modal de edición - Replicando estructura de publicar */}
        {showEditModal && selectedProduct && (
          <div className="fixed inset-0 bg-gray-300 bg-opacity-40 z-50 flex items-start justify-center p-4">
            <div className="relative w-full max-w-6xl max-h-[90vh] overflow-y-auto bg-white rounded-xl shadow-2xl my-8 scrollbar-hide">
              <style jsx global>{`
                .scrollbar-hide {
                  -ms-overflow-style: none;
                  scrollbar-width: none;
                }
                .scrollbar-hide::-webkit-scrollbar {
                  display: none;
                }
              `}</style>
              
              <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-xl z-10">
                {/* Header del modal */}
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900">Editar Producto</h3>
                    <p className="text-sm text-gray-600 mt-1">
                      Modifica la información de tu producto "{selectedProduct.name}"
                    </p>
                  </div>
                  <button
                    onClick={handleCancelarEdicion}
                    className="text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-full"
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
                    <div className="bg-gray-50 border border-gray-200 rounded-xl p-6">
                      <div className="flex items-center space-x-3 mb-4">
                        <div className="p-2 bg-green-100 rounded-lg">
                          <Package className="w-5 h-5 text-green-600" />
                        </div>
                        <h4 className="text-lg font-semibold text-gray-900">Información del Producto</h4>
                      </div>
                      
                      <div className="space-y-4">
                        {/* Nombre del producto */}
                        <div>
                          <label className="block text-sm font-semibold text-gray-800 mb-2">
                            Nombre del producto *
                          </label>
                          <input
                            type="text"
                            value={editForm.name}
                            onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all bg-white text-gray-900 font-medium"
                            placeholder="Ej: Plátano Hartón Premium"
                          />
                        </div>

                        {/* Descripción */}
                        <div>
                          <label className="block text-sm font-semibold text-gray-800 mb-2">
                            Descripción *
                          </label>
                          <textarea
                            value={editForm.description}
                            onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                            rows={4}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all bg-white resize-none text-gray-900 font-medium"
                            placeholder="Describe tu producto, cómo fue cultivado, características especiales..."
                          />
                        </div>

                        {/* Categoría */}
                        <div>
                          <label className="block text-sm font-semibold text-gray-800 mb-2">
                            Categoría *
                          </label>
                          <select
                            value={editForm.categoryId}
                            onChange={(e) => setEditForm({ ...editForm, categoryId: e.target.value })}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all bg-white text-gray-900 font-medium"
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
                          <label className="block text-sm font-semibold text-gray-800 mb-2">
                            Tipo de cultivo
                          </label>
                          <div className="grid grid-cols-2 gap-3">
                            <button
                              type="button"
                              onClick={() => setEditForm({ ...editForm, tipoCultivo: 'convencional' })}
                              className={`flex items-center justify-center p-3 border rounded-lg transition-all ${
                                editForm.tipoCultivo === 'convencional'
                                  ? 'border-green-500 bg-green-50 text-green-700'
                                  : 'border-gray-300 hover:border-gray-400 bg-white'
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
                                  ? 'border-green-500 bg-green-50 text-green-700'
                                  : 'border-gray-300 hover:border-gray-400 bg-white'
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
                    <div className="bg-gray-50 border border-gray-200 rounded-xl p-6">
                      <div className="flex items-center space-x-3 mb-4">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <DollarSign className="w-5 h-5 text-blue-600" />
                        </div>
                        <h4 className="text-lg font-semibold text-gray-900">Precio y Cantidades</h4>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Precio */}
                        <div>
                          <label className="block text-sm font-semibold text-gray-800 mb-2">
                            Precio *
                          </label>
                          <input
                            type="number"
                            value={editForm.price}
                            onChange={(e) => setEditForm({ ...editForm, price: e.target.value })}
                            min="0"
                            step="100"
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all bg-white text-gray-900 font-medium"
                            placeholder="2500"
                          />
                        </div>

                        {/* Unidad */}
                        <div>
                          <label className="block text-sm font-semibold text-gray-800 mb-2">
                            Unidad de medida *
                          </label>
                          <select
                            value={editForm.unit}
                            onChange={(e) => setEditForm({ ...editForm, unit: e.target.value })}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all bg-white text-gray-900 font-medium"
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
                          <label className="block text-sm font-semibold text-gray-800 mb-2">
                            Stock disponible *
                          </label>
                          <input
                            type="number"
                            value={editForm.stock}
                            onChange={(e) => setEditForm({ ...editForm, stock: e.target.value })}
                            min="0"
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all bg-white text-gray-900 font-medium"
                            placeholder="50"
                          />
                        </div>

                        {/* Stock mínimo */}
                        <div>
                          <label className="block text-sm font-semibold text-gray-800 mb-2">
                            Stock mínimo
                          </label>
                          <input
                            type="number"
                            value={editForm.stockMinimo}
                            onChange={(e) => setEditForm({ ...editForm, stockMinimo: e.target.value })}
                            min="0"
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all bg-white text-gray-900 font-medium"
                            placeholder="10"
                          />
                        </div>

                        {/* Peso aproximado */}
                        <div>
                          <label className="block text-sm font-semibold text-gray-800 mb-2">
                            Peso aproximado (kg)
                          </label>
                          <input
                            type="number"
                            value={editForm.pesoAproximado}
                            onChange={(e) => setEditForm({ ...editForm, pesoAproximado: e.target.value })}
                            min="0"
                            step="0.1"
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all bg-white text-gray-900 font-medium"
                            placeholder="1.5"
                          />
                        </div>

                        {/* Dimensiones */}
                        <div>
                          <label className="block text-sm font-semibold text-gray-800 mb-2">
                            Dimensiones
                          </label>
                          <input
                            type="text"
                            value={editForm.dimensiones}
                            onChange={(e) => setEditForm({ ...editForm, dimensiones: e.target.value })}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all bg-white text-gray-900 font-medium"
                            placeholder="30cm x 20cm x 15cm"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Ubicación y entrega */}
                    <div className="bg-gray-50 border border-gray-200 rounded-xl p-6">
                      <div className="flex items-center space-x-3 mb-4">
                        <div className="p-2 bg-orange-100 rounded-lg">
                          <MapPin className="w-5 h-5 text-orange-600" />
                        </div>
                        <h4 className="text-lg font-semibold text-gray-900">Ubicación y Entrega</h4>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Municipio */}
                        <div>
                          <label className="block text-sm font-semibold text-gray-800 mb-2">
                            Municipio
                          </label>
                          <input
                            type="text"
                            value={editForm.municipio}
                            onChange={(e) => setEditForm({ ...editForm, municipio: e.target.value })}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all bg-white text-gray-900 font-medium"
                            placeholder="Ej: Medellín"
                          />
                        </div>

                        {/* Vereda */}
                        <div>
                          <label className="block text-sm font-semibold text-gray-800 mb-2">
                            Vereda
                          </label>
                          <input
                            type="text"
                            value={editForm.vereda}
                            onChange={(e) => setEditForm({ ...editForm, vereda: e.target.value })}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all bg-white text-gray-900 font-medium"
                            placeholder="Ej: Santa Elena"
                          />
                        </div>

                        {/* Tiempo de entrega */}
                        <div>
                          <label className="block text-sm font-semibold text-gray-800 mb-2">
                            Tiempo de entrega (días)
                          </label>
                          <input
                            type="number"
                            value={editForm.tiempoEntrega}
                            onChange={(e) => setEditForm({ ...editForm, tiempoEntrega: e.target.value })}
                            min="1"
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all bg-white text-gray-900 font-medium"
                            placeholder="1"
                          />
                        </div>

                        {/* Fecha de cosecha */}
                        <div>
                          <label className="block text-sm font-semibold text-gray-800 mb-2">
                            <Calendar className="w-4 h-4 inline mr-2" />
                            Fecha de cosecha
                          </label>
                          <input
                            type="date"
                            value={editForm.fechaCosecha}
                            onChange={(e) => setEditForm({ ...editForm, fechaCosecha: e.target.value })}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all bg-white text-gray-900 font-medium"
                          />
                        </div>

                        {/* Horarios disponibles */}
                        <div>
                          <label className="block text-sm font-semibold text-gray-800 mb-2">
                            Horarios disponibles
                          </label>
                          <input
                            type="text"
                            value={editForm.horariosDisponibles}
                            onChange={(e) => setEditForm({ ...editForm, horariosDisponibles: e.target.value })}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all bg-white text-gray-900 font-medium"
                            placeholder="Lunes a viernes 8:00 AM - 5:00 PM"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Información adicional */}
                    <div className="bg-white rounded-xl shadow-lg p-6 mt-6">
                      <h4 className="text-lg font-semibold text-gray-900 mb-4">Información Adicional</h4>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Condiciones de almacenamiento */}
                        <div>
                          <label className="block text-sm font-semibold text-gray-800 mb-2">
                            <Leaf className="w-4 h-4 inline mr-2" />
                            Condiciones de almacenamiento
                          </label>
                          <textarea
                            value={editForm.condicionesAlmacenamiento}
                            onChange={(e) => setEditForm({ ...editForm, condicionesAlmacenamiento: e.target.value })}
                            rows={3}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all bg-white text-gray-900 font-medium resize-none"
                            placeholder="Lugar fresco y seco, temp. 15-20°C"
                          />
                        </div>

                        {/* Notas especiales */}
                        <div>
                          <label className="block text-sm font-semibold text-gray-800 mb-2">
                            Notas especiales
                          </label>
                          <textarea
                            value={editForm.notasEspeciales}
                            onChange={(e) => setEditForm({ ...editForm, notasEspeciales: e.target.value })}
                            rows={3}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all bg-white text-gray-900 font-medium resize-none"
                            placeholder="Información adicional importante..."
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Columna lateral - Información adicional */}
                  <div className="space-y-6">
                    
                    {/* Estado del producto */}
                    <div className="bg-gray-50 border border-gray-200 rounded-xl p-6">
                      <h4 className="text-lg font-semibold text-gray-900 mb-4">Estado del Producto</h4>
                      <select
                        value={editForm.status}
                        onChange={(e) => setEditForm({ ...editForm, status: e.target.value as 'DISPONIBLE' | 'AGOTADO' })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all bg-white text-gray-900 font-medium"
                      >
                        <option value="DISPONIBLE">✅ Disponible</option>
                        <option value="AGOTADO">❌ Agotado</option>
                      </select>
                    </div>

                    {/* Imagen del producto */}
                    <div className="bg-gray-50 border border-gray-200 rounded-xl p-6">
                      <h4 className="text-lg font-semibold text-gray-900 mb-4">
                        <Camera className="w-5 h-5 inline mr-2" />
                        Imagen del Producto
                      </h4>
                      <div className="space-y-4">
                        {editForm.imageUrl && (
                          <div className="aspect-w-16 aspect-h-9 bg-gray-100 rounded-lg overflow-hidden">
                            <img
                              src={editForm.imageUrl}
                              alt="Vista previa"
                              className="w-full h-32 object-cover rounded-lg"
                            />
                          </div>
                        )}
                        <input
                          type="url"
                          value={editForm.imageUrl}
                          onChange={(e) => setEditForm({ ...editForm, imageUrl: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all bg-white text-gray-900 font-medium"
                          placeholder="https://ejemplo.com/imagen.jpg"
                        />
                      </div>
                    </div>

                    {/* Certificaciones */}
                    <div className="bg-gray-50 border border-gray-200 rounded-xl p-6">
                      <h4 className="text-lg font-semibold text-gray-900 mb-4">
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
                                ? 'border-green-500 bg-green-100 text-green-800 font-semibold'
                                : 'border-gray-200 bg-white text-gray-600 hover:border-green-300 hover:bg-green-50'
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
                    <div className="bg-gray-50 border border-gray-200 rounded-xl p-6">
                      <h4 className="text-lg font-semibold text-gray-900 mb-4">
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
                                ? 'border-green-500 bg-green-100 text-green-800 font-semibold'
                                : 'border-gray-200 bg-white text-gray-600 hover:border-green-300 hover:bg-green-50'
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
                    <div className="bg-gray-50 border border-gray-200 rounded-xl p-6">
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
                          className="w-full px-6 py-3 border border-gray-300 rounded-lg text-sm font-semibold text-gray-800 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 transition-all"
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
          <div className="fixed inset-0 bg-white/30 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-2xl p-6 max-w-md w-full mx-4 border border-gray-200">
              <div className="text-center">
                {/* Icono de pregunta */}
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full mb-4">
                  <div className="bg-blue-100 rounded-full p-3">
                    <Edit className="h-6 w-6 text-blue-600" />
                  </div>
                </div>

                {/* Título */}
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Confirmar Actualización
                </h3>

                {/* Mensaje */}
                <p className="text-sm text-gray-600 mb-6">
                  ¿Estás seguro de que quieres actualizar este producto? Los cambios se guardarán permanentemente.
                </p>

                {/* Botones */}
                <div className="flex space-x-3">
                  <button
                    onClick={() => setShowConfirmUpdateModal(false)}
                    disabled={editLoading}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors disabled:opacity-50"
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
          <div className="fixed inset-0 bg-white/30 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-2xl p-6 max-w-md w-full mx-4 border border-gray-200">
              <div className="text-center">
                {/* Icono según el tipo de mensaje */}
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full mb-4">
                  {messageType === 'success' ? (
                    <div className="bg-green-100 rounded-full p-3">
                      <CheckCircle className="h-6 w-6 text-green-600" />
                    </div>
                  ) : (
                    <div className="bg-red-100 rounded-full p-3">
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
