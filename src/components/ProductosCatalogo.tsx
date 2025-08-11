"use client";
import { useState, useEffect } from 'react';
import { Heart, Star, MapPin, Calendar, User, X } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useCartStore } from '@/store/cart';
import { ShoppingCart } from 'lucide-react';

interface Producto {
  id: string; // Cambiar a string para productos reales
  nombre: string;
  descripcion: string;
  precio: number;
  unidad: string;
  categoria: string;
  agricultor: string;
  agricultorId?: string;
  ubicacion: string;
  fecha: string;
  imagen: string;
  stock: number;
  rating: number;
  isFavorite: boolean;
  metodosEntrega?: string; // JSON string con métodos de entrega
}

const productosDemo: Producto[] = [
  {
    id: "1",
    nombre: "Plátano Hartón Premium",
    descripcion: "Plátanos frescos y maduros, ideales para cocinar. Cultivados de forma orgánica en las montañas de Antioquia.",
    precio: 2500,
    unidad: "kg",
    categoria: "Frutas",
    agricultor: "Carlos Mejía",
    ubicacion: "Medellín, Antioquia",
    fecha: "Hace 2 horas",
    imagen: "🍌",
    stock: 99,
    rating: 4.8,
    isFavorite: false
  },
  {
    id: "2",
    nombre: "Yuca Criolla Fresca",
    descripcion: "Yuca recién cosechada, perfecta para preparaciones tradicionales. Sin químicos, cultivo natural.",
    precio: 1800,
    unidad: "kg",
    categoria: "Tubérculos",
    agricultor: "María Rodríguez",
    ubicacion: "Cali, Valle del Cauca",
    fecha: "Hace 5 horas",
    imagen: "🥔",
    stock: 99,
    rating: 4.6,
    isFavorite: true
  },
  {
    id: "3",
    nombre: "Café Especial Arábica",
    descripcion: "Granos de café premium, tostado medio. Aroma intenso y sabor único de la región cafetera.",
    precio: 15000,
    unidad: "500g",
    categoria: "Café",
    agricultor: "José Herrera",
    ubicacion: "Manizales, Caldas",
    fecha: "Hace 1 día",
    imagen: "☕",
    stock: 99,
    rating: 4.9,
    isFavorite: false
  },
  {
    id: "4",
    nombre: "Aguacate Hass Orgánico",
    descripcion: "Aguacates cremosos y nutritivos, cultivados sin pesticidas. Perfectos para guacamole y ensaladas.",
    precio: 3200,
    unidad: "kg",
    categoria: "Frutas",
    agricultor: "Ana López",
    ubicacion: "Bogotá, Cundinamarca",
    fecha: "Hace 3 horas",
    imagen: "🥑",
    stock: 99,
    rating: 4.7,
    isFavorite: true
  },
  {
    id: "5",
    nombre: "Cilantro Fresco",
    descripcion: "Cilantro aromático recién cortado, ideal para sazonar comidas típicas colombianas.",
    precio: 800,
    unidad: "manojo",
    categoria: "Hierbas",
    agricultor: "Pedro Sánchez",
    ubicacion: "Bucaramanga, Santander",
    fecha: "Hace 6 horas",
    imagen: "🌿",
    stock: 99,
    rating: 4.5,
    isFavorite: false
  },
  {
    id: "6",
    nombre: "Maíz Amarillo Tierno",
    descripcion: "Mazorcas de maíz dulce y tierno, perfectas para arepas y sopas tradicionales.",
    precio: 1200,
    unidad: "unidad",
    categoria: "Cereales",
    agricultor: "Luis García",
    ubicacion: "Barranquilla, Atlántico",
    fecha: "Hace 4 horas",
    imagen: "🌽",
    stock: 99,
    rating: 4.4,
    isFavorite: false
  },
  {
    id: "7",
    nombre: "Queso Campesino Fresco",
    descripcion: "Queso artesanal elaborado con leche fresca de vacas criollas. Sabor auténtico y textura cremosa.",
    precio: 8500,
    unidad: "kg",
    categoria: "Lácteos",
    agricultor: "Esperanza Morales",
    ubicacion: "Boyacá, Cundinamarca",
    fecha: "Hace 1 hora",
    imagen: "🧀",
    stock: 99,
    rating: 4.8,
    isFavorite: false
  },
  {
    id: "8",
    nombre: "Leche Fresca de Vaca",
    descripcion: "Leche entera recién ordeñada, sin procesar. Rica en nutrientes y con el sabor tradicional del campo.",
    precio: 3500,
    unidad: "litro",
    categoria: "Lácteos",
    agricultor: "Roberto Jiménez",
    ubicacion: "Ubaté, Cundinamarca",
    fecha: "Hace 30 minutos",
    imagen: "🥛",
    stock: 99,
    rating: 4.9,
    isFavorite: true
  }
];

export default function ProductosCatalogo({ 
  viewMode = 'grid', 
  filtroCategoria = "Todos",
  ordenPor = "recientes",
  busqueda = ""
}: { 
  viewMode?: 'grid' | 'list';
  filtroCategoria?: string;
  ordenPor?: string;
  busqueda?: string;
}) {
  const { data: session } = useSession();
  const [productos, setProductos] = useState<Producto[]>([]);
  const [loading, setLoading] = useState(true);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastColor, setToastColor] = useState("");
  const [toastIcon, setToastIcon] = useState("");
  const cart = useCartStore();
  const [miniCartOpen, setMiniCartOpen] = useState(false);
  const [apiError, setApiError] = useState(false);

  // Cargar productos desde la API
  useEffect(() => {
    const cargarProductos = async () => {
      try {
        const res = await fetch('/api/productos');
        if (res.ok) {
          const productosAPI = await res.json();
          console.log('API productos:', productosAPI);
          const productosFormateados = productosAPI.map((p: any) => ({
            id: p.id,
            nombre: p.name,
            descripcion: p.description,
            precio: p.price,
            unidad: p.unit,
            categoria: p.category?.name || 'Sin categoría',
            agricultor: p.agricultor?.user?.nombre || 'Agricultor desconocido',
            agricultorId: p.agricultorId || '',
            ubicacion: 'Colombia',
            fecha: 'Hace unas horas',
            imagen: p.imageUrl || '🌿',
            stock: p.stock ?? 0,
            rating: 4.5,
            isFavorite: false,
            metodosEntrega: p.metodosEntrega || null // Agregar métodos de entrega
          }));
          console.log('Productos formateados:', productosFormateados);
          setProductos(productosFormateados);
          setApiError(false);
        } else {
          setApiError(true);
          setProductos([]);
          console.error('Error al cargar productos desde la API, usando productos demo');
        }
      } catch (error) {
        setApiError(true);
        setProductos([]);
        console.error('Error al cargar productos desde la API:', error);
      } finally {
        setLoading(false);
      }
    };
    cargarProductos();
  }, []);
  const [prevOrdenPor, setPrevOrdenPor] = useState(ordenPor);
  const [prevFiltroCategoria, setPrevFiltroCategoria] = useState(filtroCategoria);
  const [prevBusqueda, setPrevBusqueda] = useState(busqueda);

  // Colores suaves y discretos para el mensaje
  const coloresPasteles = [
    "bg-gray-50 border-gray-200 text-gray-600",
    "bg-blue-50 border-blue-200 text-blue-600", 
    "bg-green-50 border-green-200 text-green-600",
    "bg-purple-50 border-purple-200 text-purple-600",
    "bg-amber-50 border-amber-200 text-amber-600",
    "bg-indigo-50 border-indigo-200 text-indigo-600",
    "bg-rose-50 border-rose-200 text-rose-600",
    "bg-cyan-50 border-cyan-200 text-cyan-600",
    "bg-orange-50 border-orange-200 text-orange-600",
    "bg-lime-50 border-lime-200 text-lime-600",
    "bg-red-50 border-red-200 text-red-600",
    "bg-teal-50 border-teal-200 text-teal-600",
    "bg-violet-50 border-violet-200 text-violet-600",
    "bg-sky-50 border-sky-200 text-sky-600",
    "bg-emerald-50 border-emerald-200 text-emerald-600"
  ];

  // Detectar cambios en ordenPor (sin toast automático)
  useEffect(() => {
    if (prevOrdenPor !== ordenPor) {
      setPrevOrdenPor(ordenPor);
    }
  }, [ordenPor, prevOrdenPor]);

  // Detectar cambios en filtro de categoría (sin toast automático)
  useEffect(() => {
    if (prevFiltroCategoria !== filtroCategoria) {
      setPrevFiltroCategoria(filtroCategoria);
    }
  }, [filtroCategoria, prevFiltroCategoria]);

  // Detectar cambios en búsqueda (solo mostrar toast al limpiar)
  useEffect(() => {
    if (prevBusqueda !== busqueda && busqueda !== "") {
      setPrevBusqueda(busqueda);
    } else if (prevBusqueda !== "" && busqueda === "") {
      const colorAleatorio = coloresPasteles[Math.floor(Math.random() * coloresPasteles.length)];
      mostrarToast("Búsqueda limpiada", colorAleatorio, "✨");
      setPrevBusqueda(busqueda);
    }
  }, [busqueda, prevBusqueda]);

  // Función para mostrar toast
  const mostrarToast = (mensaje: string, color: string, icono: string) => {
    const resultadosCount = productosFiltrados.length;
    const mensajeCompleto = `${mensaje} • ${resultadosCount} resultado${resultadosCount !== 1 ? 's' : ''}`;
    
    setToastMessage(mensajeCompleto);
    setToastColor(color);
    setToastIcon(icono);
    setShowToast(true);

    // Auto-ocultar después de 3 segundos
    setTimeout(() => {
      setShowToast(false);
    }, 3000);
  };

  const toggleFavorite = (id: string) => {
    setProductos(prev =>
      prev.map(producto =>
        producto.id === id ? { ...producto, isFavorite: !producto.isFavorite } : producto
      )
    );
  };

  // Función para agregar producto al carrito
  const handleAddToCart = (producto: any) => {
    if (apiError) {
      mostrarToast('No se puede agregar productos demo al carrito. Intenta recargar la página cuando la conexión se restablezca.', 'bg-red-50 border-red-200 text-red-600', '⚠️');
      return;
    }
    // Validar stock real
    const existing = cart.items.find(item => item.id === producto.id);
    if (existing && existing.quantity >= producto.stock) {
      mostrarToast(`Solo quedan ${producto.stock} unidades disponibles de este producto`, 'bg-red-50 border-red-200 text-red-600', '⚠️');
      return;
    }
    cart.addItem({
      id: producto.id,
      name: producto.nombre,
      price: producto.precio,
      stock: producto.stock, // Stock real
      unit: producto.unidad,
      campesinoId: producto.agricultorId || 'desconocido',
      campesinoName: producto.agricultor || 'desconocido',
      imageUrl: producto.imagen,
      metodosEntrega: producto.metodosEntrega || null // Incluir métodos de entrega
    });
    setMiniCartOpen(true);
    mostrarToast('Producto agregado al carrito', 'bg-green-50 border-green-200 text-green-600', '🛒');
  };

  const productosFiltrados = productos
    .filter(producto => {
      // Filtro por categoría
      const coincideCategoria = filtroCategoria === "Todos" || producto.categoria === filtroCategoria;
      
      // Filtro por búsqueda
      const coincideBusqueda = busqueda === "" || 
        producto.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
        producto.descripcion.toLowerCase().includes(busqueda.toLowerCase()) ||
        producto.agricultor.toLowerCase().includes(busqueda.toLowerCase()) ||
        producto.ubicacion.toLowerCase().includes(busqueda.toLowerCase());
      
      return coincideCategoria && coincideBusqueda;
    })
    .sort((a, b) => {
      switch (ordenPor) {
        case "precio-asc":
          return a.precio - b.precio;
        case "precio-desc":
          return b.precio - a.precio;
        case "rating":
          return b.rating - a.rating;
        default:
          return 0;
      }
    });

  const formatearPrecio = (precio: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(precio);
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${
          i < Math.floor(rating) 
            ? 'fill-yellow-400 text-yellow-400' 
            : 'text-gray-300'
        }`}
      />
    ));
  };

  return (
    <div className="space-y-4 relative">
      {/* Estado de carga */}
      {loading && (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando productos...</p>
        </div>
      )}

      {/* Contenido principal (solo se muestra cuando no está cargando) */}
      {!loading && (
        <>
      {/* Mensaje de estado sutil */}
      {showToast && (
        <div className={`${toastColor} border rounded-lg transition-all duration-300 ease-out ${showToast ? 'opacity-100' : 'opacity-0'}`}>
          <div className="px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <span className="text-lg">{toastIcon}</span>
                <div>
                  <span className="text-sm font-medium">
                    {toastMessage.split(' • ')[0]}
                  </span>
                  <span className="text-xs text-current opacity-70 ml-2">
                    {toastMessage.split(' • ')[1]}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setShowToast(false)}
                className="ml-3 p-1 rounded hover:bg-current hover:bg-opacity-10 transition-colors duration-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Grid/Lista de productos */}
      {/* Grid/Lista de productos */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4 xl:gap-5">
          {productosFiltrados.map((producto) => {
            // Determinar si el usuario autenticado es agricultor y dueño del producto
            const isOwnerAgricultor = session?.user?.role === 'CAMPESINO' && session?.user?.name === producto.agricultor;
            return (
            <div
              key={producto.id}
              className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 border border-gray-200 hover:border-green-400 overflow-hidden group w-full ring-1 ring-gray-50 hover:ring-green-100"
              style={{ minWidth: '0', maxWidth: '100%' }}
            >
              {/* Imagen del producto */}
              <div className="relative bg-gradient-to-br from-green-50 to-amber-50 pt-0 pb-0 px-0 text-center">
                {producto.imagen && (producto.imagen.startsWith('http') || producto.imagen.startsWith('/')) ? (
                  <img
                    src={producto.imagen.startsWith('http') ? producto.imagen : `${typeof window !== 'undefined' ? window.location.origin : ''}${producto.imagen}`}
                    alt={producto.nombre}
                    className="w-full h-36 object-cover rounded-t-2xl hover:scale-105 transition-transform duration-300 cursor-pointer border-b border-gray-100 bg-white mx-auto shadow-sm"
                    style={{ objectPosition: 'center' }}
                    onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
                  />
                ) : (
                  <div className="text-5xl flex items-center justify-center w-full h-36 bg-gradient-to-br from-green-50 to-amber-50 rounded-t-2xl">
                    {producto.imagen}
                  </div>
                )}
                <button
                  onClick={() => toggleFavorite(producto.id)}
                  className={`absolute top-3 right-3 p-2 rounded-full transition-all duration-300 hover:scale-110 active:scale-95 ${
                    producto.isFavorite
                      ? 'bg-red-500 text-white shadow-lg hover:bg-red-600'
                      : 'bg-white text-gray-400 hover:text-red-500 hover:bg-red-50 shadow-md'
                  }`}
                >
                  <Heart className={`w-5 h-5 ${producto.isFavorite ? 'fill-current' : ''}`} />
                </button>
              </div>

              {/* Contenido del producto */}
              <div className="p-4 space-y-3">
                {/* Header con nombre y precio */}
                <div className="flex justify-between items-start gap-2">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1 hover:text-green-600 transition-colors duration-200 cursor-pointer truncate">
                      {producto.nombre}
                    </h3>
                    <div className="flex items-center space-x-1 mb-1">
                      {renderStars(producto.rating)}
                      <span className="text-xs text-gray-500 ml-1">({producto.rating})</span>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="text-xl font-bold text-green-600 hover:text-green-700 transition-colors duration-200">
                      {formatearPrecio(producto.precio)}
                    </div>
                    <div className="text-xs text-gray-400">por {producto.unidad}</div>
                  </div>
                </div>

                {/* Descripción */}
                <p className="text-gray-500 text-xs leading-relaxed line-clamp-2 mb-1">
                  {producto.descripcion}
                </p>

                {/* Información del agricultor */}
                <div className="space-y-1 pt-2 border-t border-gray-100">
                  <div className="flex items-center space-x-2 text-xs text-gray-500">
                    <User className="w-4 h-4 text-green-500" />
                    <span className="font-medium truncate">{producto.agricultor}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-xs text-gray-500">
                    <MapPin className="w-4 h-4 text-orange-500" />
                    <span className="truncate">{producto.ubicacion}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-xs text-gray-400">
                    <Calendar className="w-4 h-4 text-blue-500" />
                    <span>{producto.fecha}</span>
                  </div>
                </div>

                {/* Botón de acción */}
                <div className="pt-3">
                  {!isOwnerAgricultor && (
                    <button
                      className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold py-2 px-3 rounded-xl transition-colors duration-200 shadow-md hover:shadow-lg text-sm flex items-center justify-center gap-2"
                      onClick={() => handleAddToCart(producto)}
                    >
                      <ShoppingCart className="w-4 h-4 mr-1" /> Comprar Ahora
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
          })}
        </div>
      ) : (
        <div className="space-y-4">
          {productosFiltrados.map((producto) => {
            const isOwnerAgricultor = session?.user?.role === 'CAMPESINO' && session?.user?.name === producto.agricultor;
            return (
            <div
              key={producto.id}
              className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 overflow-hidden"
            >
              <div className="flex flex-col md:flex-row">
                {/* Imagen en vista lista */}
                <div className="relative bg-gradient-to-br from-green-50 to-orange-50 pt-0 pb-0 px-0 md:w-44 min-w-[140px] max-w-[180px] flex items-stretch justify-center">
                  {producto.imagen && (producto.imagen.startsWith('http') || producto.imagen.startsWith('/')) ? (
                    <img
                      src={producto.imagen.startsWith('http') ? producto.imagen : `${typeof window !== 'undefined' ? window.location.origin : ''}${producto.imagen}`}
                      alt={producto.nombre}
                      className="w-full h-full min-h-[120px] min-w-[120px] object-cover rounded-l-2xl rounded-tr-none rounded-br-none hover:scale-105 transition-transform duration-300 cursor-pointer border border-gray-100 bg-white shadow-sm"
                      style={{ objectPosition: 'center', aspectRatio: '1/1' }}
                      onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
                    />
                  ) : (
                    <div className="text-4xl flex items-center justify-center w-full h-full min-h-[120px] min-w-[120px] bg-white rounded-l-2xl rounded-tr-none rounded-br-none">
                      {producto.imagen}
                    </div>
                  )}
                  <button
                    onClick={() => toggleFavorite(producto.id)}
                    className={`absolute top-3 right-3 p-2 rounded-full transition-all duration-300 hover:scale-110 active:scale-95 ${
                      producto.isFavorite
                        ? 'bg-red-500 text-white shadow-lg hover:bg-red-600'
                        : 'bg-white text-gray-400 hover:text-red-500 hover:bg-red-50 shadow-md'
                    }`}
                  >
                    <Heart className={`w-4 h-4 ${producto.isFavorite ? 'fill-current' : ''}`} />
                  </button>
                </div>

                {/* Contenido en vista lista */}
                <div className="flex-1 p-4">
                  <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-4">
                    {/* Información principal */}
                    <div className="flex-1">
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 mb-3">
                        <h3 className="text-xl font-bold text-gray-900 hover:text-green-600 transition-colors duration-200 cursor-pointer">
                          {producto.nombre}
                        </h3>
                        <div className="text-right">
                          <div className="text-xl font-bold text-green-600">
                            {formatearPrecio(producto.precio)}
                          </div>
                          <div className="text-sm text-gray-500">por {producto.unidad}</div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-1 mb-3">
                        {renderStars(producto.rating)}
                        <span className="text-sm text-gray-600 ml-2">({producto.rating})</span>
                      </div>

                      <p className="text-gray-600 text-sm leading-relaxed mb-4 line-clamp-2">
                        {producto.descripcion}
                      </p>

                      {/* Información del agricultor en línea */}
                      <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-4">
                        <div className="flex items-center space-x-1">
                          <User className="w-4 h-4 text-green-500" />
                          <span className="font-medium">{producto.agricultor}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <MapPin className="w-4 h-4 text-orange-500" />
                          <span>{producto.ubicacion}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Calendar className="w-4 h-4 text-blue-500" />
                          <span>{producto.fecha}</span>
                        </div>
                      </div>
                    </div>

                    {/* Botón de acción */}
                    <div className="lg:ml-6">
                      {!isOwnerAgricultor && (
                        <button
                          className="w-full lg:w-auto bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold py-3 px-6 rounded-xl transition-colors duration-200 shadow-lg hover:shadow-xl whitespace-nowrap flex items-center justify-center gap-2"
                          onClick={() => handleAddToCart(producto)}
                        >
                          <ShoppingCart className="w-4 h-4 mr-1" /> Comprar Ahora
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
          })}
        </div>
      )}

      {/* Mensaje cuando no hay productos */}
      {productosFiltrados.length === 0 && (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-100">
          <div className="text-6xl mb-4">🔍</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No se encontraron productos</h3>
          <p className="text-gray-600 mb-6">
            {busqueda ? `No hay productos que coincidan con "${busqueda}"` : 
             filtroCategoria !== "Todos" ? `No hay productos en la categoría "${filtroCategoria}"` :
             "No hay productos disponibles en este momento"}
          </p>
          <div className="space-y-2 text-sm text-gray-500">
            <p>• Intenta con otros términos de búsqueda</p>
            <p>• Cambia los filtros aplicados</p>
            <p>• Explora otras categorías</p>
          </div>
        </div>
      )}

      {/* Mostrar mensaje si la API falla */}
      {apiError && (
        <div className="bg-red-100 border border-red-300 text-red-700 rounded-lg p-4 mb-6 text-center">
          Error al cargar productos desde el servidor. No es posible comprar productos demo. Intenta recargar la página.<br />
          <span className="font-bold">No podrás agregar productos al carrito hasta que la conexión se restablezca.</span>
        </div>
      )}
        </>
      )}
    </div>
  );
}