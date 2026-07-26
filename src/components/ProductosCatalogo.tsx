"use client";
import { useState, useEffect } from 'react';
import { Heart, MapPin, User, X, ShoppingCart, Package, Sprout, Sparkles, PackageSearch, CheckCircle2, Plus, Clock } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useCartStore } from '@/store/cart';
import { useRouter } from 'next/navigation';
import ProductoDetalleModal from '@/components/ProductoDetalleModal';

interface PurchaseUnit {
  unit: string;
  equivalencia: number;
}

interface Producto {
  id: string;
  nombre: string;
  descripcion: string;
  precio: number;
  unidad: string;
  purchaseUnits?: PurchaseUnit[];
  categoria: string;
  agricultor: string;
  agricultorId?: string;
  ubicacion: string;
  fecha: string;
  imagen: string;
  stock: number;
  rating: number;
  isFavorite: boolean;
  metodosEntrega?: string;
}

const productosDemo: Producto[] = [
  {
    id: "1",
    nombre: "Plátano Hartón Premium",
    descripcion: "Plátanos frescos y maduros, ideales para cocinar. Cultivados de forma orgánica en las montañas de Antioquia.",
    precio: 2500,
    unidad: "kg",
    purchaseUnits: [{ unit: "Caja", equivalencia: 20 }],
    categoria: "Frutas",
    agricultor: "Carlos Mejía",
    ubicacion: "Medellín, Antioquia",
    fecha: "Hace 2 horas",
    imagen: "https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=500&auto=format&fit=crop&q=80",
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
    purchaseUnits: [{ unit: "Bulto", equivalencia: 50 }],
    categoria: "Tubérculos",
    agricultor: "María Rodríguez",
    ubicacion: "Cali, Valle del Cauca",
    fecha: "Hace 5 horas",
    imagen: "https://images.unsplash.com/photo-1590165482129-1b8b27698780?w=500&auto=format&fit=crop&q=80",
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
    purchaseUnits: [{ unit: "Bolsa 1kg", equivalencia: 2 }],
    categoria: "Café",
    agricultor: "José Herrera",
    ubicacion: "Manizales, Caldas",
    fecha: "Hace 1 día",
    imagen: "https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=500&auto=format&fit=crop&q=80",
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
    purchaseUnits: [{ unit: "Caja", equivalencia: 10 }, { unit: "Canasta", equivalencia: 25 }],
    categoria: "Frutas",
    agricultor: "Ana López",
    ubicacion: "Bogotá, Cundinamarca",
    fecha: "Hace 3 horas",
    imagen: "https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?w=500&auto=format&fit=crop&q=80",
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
    purchaseUnits: [],
    categoria: "Hierbas",
    agricultor: "Pedro Sánchez",
    ubicacion: "Bucaramanga, Santander",
    fecha: "Hace 6 horas",
    imagen: "https://images.unsplash.com/photo-1588879460618-924d55b0a880?w=500&auto=format&fit=crop&q=80",
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
    purchaseUnits: [{ unit: "Docena", equivalencia: 12 }],
    categoria: "Cereales",
    agricultor: "Luis Gómez",
    ubicacion: "Ibagué, Tolima",
    fecha: "Hace 4 horas",
    imagen: "https://images.unsplash.com/photo-1551754655-cd27e38d2076?w=500&auto=format&fit=crop&q=80",
    stock: 99,
    rating: 4.6,
    isFavorite: false
  },
  {
    id: "7",
    nombre: "Tomate Chonto Rojo",
    descripcion: "Tomates rojos y jugosos, seleccionados a mano. Excelente para guisos y ensaladas.",
    precio: 2200,
    unidad: "kg",
    purchaseUnits: [{ unit: "Caja", equivalencia: 15 }],
    categoria: "Verduras",
    agricultor: "Carmen Ortiz",
    ubicacion: "Tunja, Boyacá",
    fecha: "Hace 1 hora",
    imagen: "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=500&auto=format&fit=crop&q=80",
    stock: 99,
    rating: 4.8,
    isFavorite: false
  },
  {
    id: "8",
    nombre: "Queso Campesino Artesanal",
    descripcion: "Queso fresco elaborado con leche pura de vaca. Sabor tradicional y textura suave.",
    precio: 8500,
    unidad: "500g",
    purchaseUnits: [{ unit: "Bloque 1kg", equivalencia: 2 }],
    categoria: "Lácteos",
    agricultor: "Fernando Ruiz",
    ubicacion: "Pastos, Nariño",
    fecha: "Hace 8 horas",
    imagen: "https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?w=500&auto=format&fit=crop&q=80",
    stock: 99,
    rating: 4.9,
    isFavorite: true
  }
];

interface ProductosCatalogoProps {
  viewMode?: 'grid' | 'list';
  filtroCategoria?: string;
  ordenPor?: string;
  busqueda?: string;
  filtroCiudad?: string;
  onLoaded?: () => void;
}

export default function ProductosCatalogo({
  viewMode = 'grid',
  filtroCategoria = 'Todos',
  ordenPor = 'recientes',
  busqueda = '',
  filtroCiudad = 'Todas',
  onLoaded
}: ProductosCatalogoProps) {
  const { data: session } = useSession();
  const [productos, setProductos] = useState<Producto[]>([]);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Producto | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [toastMessage, setToastMessage] = useState<string>('');
  const [showToast, setShowToast] = useState<boolean>(false);
  const [toastColor, setToastColor] = useState<string>('');

  const [prevFiltroCategoria, setPrevFiltroCategoria] = useState(filtroCategoria);
  const [prevBusqueda, setPrevBusqueda] = useState(busqueda);
  const [miAgricultorId, setMiAgricultorId] = useState<string | undefined>(undefined);

  const cart = useCartStore();
  const router = useRouter();

  useEffect(() => {
    const fetchMiAgricultor = async () => {
      if (session?.user?.role === 'CAMPESINO') {
        try {
          const res = await fetch('/api/agricultor/billetera');
          if (res.ok) {
            const data = await res.json();
            if (data.agricultor?.id) setMiAgricultorId(data.agricultor.id);
          }
        } catch (e) {
          // ignore
        }
      }
    };
    fetchMiAgricultor();
  }, [session]);

  const loadFavorites = async () => {
    if (!session?.user) return;
    try {
      const res = await fetch('/api/comprador/favoritos');
      if (res.ok) {
        const favs = await res.json();
        const favIds = new Set(favs.map((f: any) => f.productId));
        setProductos(prev => prev.map(p => ({ ...p, isFavorite: favIds.has(p.id) })));
      }
    } catch (_) {
      // ignore
    }
  };

  useEffect(() => {
    loadFavorites();

    const cargarProductos = async () => {
      try {
        const res = await fetch('/api/productos');
        if (res.ok) {
          const productosAPI = await res.json();
          const productosFormateados = productosAPI.map((p: any) => ({
            id: p.id,
            nombre: p.name,
            descripcion: p.description,
            precio: p.price,
            unidad: p.unit,
            purchaseUnits: (() => {
              try {
                if (!p.purchaseUnits) return undefined;
                if (Array.isArray(p.purchaseUnits)) return p.purchaseUnits;
                return JSON.parse(p.purchaseUnits);
              } catch (_) {
                return typeof p.purchaseUnits === 'string' ? [p.purchaseUnits] : undefined;
              }
            })(),
            categoria: p.category?.name || 'Sin categoría',
            agricultor: p.agricultor?.user?.nombre || 'Agricultor desconocido',
            agricultorId: p.agricultorId || p.agricultor?.id || '',
            ubicacion: p.municipio || 'Colombia',
            fecha: 'Hace unas horas',
            imagen: (() => {
              if (p.imageUrl && typeof p.imageUrl === 'string' && p.imageUrl.trim() !== '') {
                return p.imageUrl;
              }
              if (p.imagenes) {
                try {
                  const parsed = typeof p.imagenes === 'string' ? JSON.parse(p.imagenes) : p.imagenes;
                  if (Array.isArray(parsed) && parsed.length > 0 && typeof parsed[0] === 'string') {
                    return parsed[0];
                  }
                  if (typeof parsed === 'string') return parsed;
                } catch (_) {
                  if (typeof p.imagenes === 'string') return p.imagenes;
                }
              }
              return '';
            })(),
            stock: p.stock ?? 0,
            rating: 4.5,
            isFavorite: false,
            metodosEntrega: p.metodosEntrega || null
          }));
          setProductos(productosFormateados);
          setApiError(false);
        } else {
          setProductos([]);
          setApiError(true);
        }
      } catch (error) {
        setProductos([]);
        setApiError(true);
      } finally {
        setLoading(false);
        try { if (typeof onLoaded === 'function') onLoaded(); } catch(e) { /* ignore */ }
      }
    };
    cargarProductos();
  }, []);

  const formatearPrecio = (precio: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(precio);
  };

  const productosFiltrados = productos.filter(producto => {
    const cumpleCategoria = filtroCategoria === "Todos" || producto.categoria.toLowerCase() === filtroCategoria.toLowerCase();
    const cumpleBusqueda = busqueda === "" || 
      producto.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      producto.descripcion.toLowerCase().includes(busqueda.toLowerCase()) ||
      producto.agricultor.toLowerCase().includes(busqueda.toLowerCase());

    const cumpleCiudad = filtroCiudad === "Todas" || 
      producto.ubicacion.toLowerCase().includes(filtroCiudad.toLowerCase());

    return cumpleCategoria && cumpleBusqueda && cumpleCiudad;
  }).sort((a, b) => {
    switch (ordenPor) {
      case "precio-asc": return a.precio - b.precio;
      case "precio-desc": return b.precio - a.precio;
      case "rating": return b.rating - a.rating;
      case "recientes": default: return 0;
    }
  });

  const mostrarToast = (mensaje: string, color: string) => {
    const resultadosCount = productosFiltrados.length;
    const mensajeCompleto = `${mensaje} • ${resultadosCount} resultado${resultadosCount !== 1 ? 's' : ''}`;
    
    setToastMessage(mensajeCompleto);
    setToastColor(color);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const toggleFavorite = (id: string) => {
    (async () => {
      const producto = productos.find(p => p.id === id);
      if (!producto) return;
      try {
        if (producto.isFavorite) {
          const res = await fetch(`/api/comprador/favoritos?productId=${encodeURIComponent(id)}`, { method: 'DELETE' });
          if (res.ok) {
            setProductos(prev => prev.map(p => p.id === id ? { ...p, isFavorite: false } : p));
            mostrarToast('Eliminado de favoritos', 'bg-neutral-800 border-neutral-700 text-neutral-200');
          }
        } else {
          const res = await fetch('/api/comprador/favoritos', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ productId: id })
          });
          if (res.ok) {
            setProductos(prev => prev.map(p => p.id === id ? { ...p, isFavorite: true } : p));
            mostrarToast('Añadido a favoritos', 'bg-neutral-800 border-neutral-700 text-lime-400');
          }
        }
      } catch (err) {
        console.error('Error toggling favorite:', err);
      }
    })();
  };

  const abrirDetalle = (producto: Producto) => {
    router.push(`/mercado/producto/${producto.id}`);
  };

  const handleAddToCart = (producto: Producto) => {
    cart.addItem({
      id: producto.id,
      nombre: producto.nombre,
      precio: producto.precio,
      unidad: producto.unidad,
      imagen: producto.imagen,
      agricultor: producto.agricultor
    });
    
    mostrarToast(`Agregado al carrito: ${producto.nombre}`, 'bg-lime-950/80 border-lime-600/50 text-lime-400');
  };

  return (
    <div className="w-full">
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="w-10 h-10 border-3 border-neutral-700 border-t-lime-500 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-neutral-400 text-sm font-medium">Cargando catálogo agrícola…</p>
          </div>
        </div>
      ) : (
        <>
          {showToast && (
            <div className="fixed bottom-6 right-6 z-50 animate-in fade-in slide-in-from-bottom-4 duration-300">
              <div className={`px-4 py-3 rounded-xl border shadow-2xl backdrop-blur-md ${toastColor}`}>
                <div className="flex items-center gap-3">
                  <Sparkles className="w-4 h-4 text-lime-400 flex-shrink-0" />
                  <span className="text-sm font-medium">{toastMessage}</span>
                  <button onClick={() => setShowToast(false)} className="ml-2 text-neutral-400 hover:text-white">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {viewMode === 'grid' ? (
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5 gap-2.5 sm:gap-5 lg:gap-6">
              {productosFiltrados.map((producto) => {
                const isOwnerAgricultor = session?.user?.role === 'CAMPESINO' && !!miAgricultorId && !!producto.agricultorId && String(miAgricultorId) === String(producto.agricultorId);
                const hasValidImage = Boolean(
                  producto.imagen && 
                  typeof producto.imagen === 'string' && 
                  (producto.imagen.startsWith('http') || producto.imagen.startsWith('/') || producto.imagen.startsWith('data:'))
                );

                const imageSrc = producto.imagen && (producto.imagen.startsWith('http') || producto.imagen.startsWith('data:'))
                  ? producto.imagen
                  : `${typeof window !== 'undefined' ? window.location.origin : ''}${producto.imagen && producto.imagen.startsWith('/') ? '' : '/'}${producto.imagen || ''}`;

                return (
                  <div
                    key={producto.id}
                    className="bg-neutral-900 hover:bg-neutral-800/80 rounded-xl border border-neutral-800/60 hover:border-neutral-700/60 transition-all duration-300 overflow-hidden group flex flex-col justify-between shadow-lg cursor-pointer"
                    onClick={() => abrirDetalle(producto)}
                  >
                    <div>
                      {/* Imagen con fallback limpio vectorizado */}
                      <div className="relative bg-neutral-900 overflow-hidden">
                        {hasValidImage ? (
                          <img
                            src={imageSrc}
                            alt={producto.nombre}
                            className="w-full h-32 sm:h-40 md:h-44 object-cover transition-transform duration-500 group-hover:scale-105 border-b border-neutral-800"
                            onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
                          />
                        ) : (
                          <div className="w-full h-32 sm:h-40 md:h-44 bg-gradient-to-br from-neutral-900 to-neutral-800 flex flex-col items-center justify-center border-b border-neutral-800">
                            <div className="p-2 sm:p-3 rounded-xl bg-lime-500/10 border border-lime-500/20 text-lime-400 mb-1">
                              <Sprout className="w-5 h-5 sm:w-7 sm:h-7" />
                            </div>
                            <span className="text-[9px] sm:text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">Producto Agrícola</span>
                          </div>
                        )}

                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); toggleFavorite(producto.id); }}
                          className={`absolute top-2 right-2 p-1.5 rounded-full transition-all shadow-md ${
                            producto.isFavorite
                              ? 'bg-red-600 text-white hover:bg-red-700'
                              : 'bg-neutral-900/80 backdrop-blur-md text-neutral-300 hover:text-red-400 border border-neutral-700/60'
                          }`}
                        >
                          <Heart className={`w-3.5 h-3.5 ${producto.isFavorite ? 'fill-current' : ''}`} />
                        </button>
                      </div>

                      {/* Contenido del Producto */}
                      <div className="p-3 space-y-1.5">
                        {/* Insignia de Unidad (Pill) */}
                        <div>
                          <span className="inline-block bg-lime-500/10 border border-lime-500/20 text-lime-400 font-bold text-[10px] sm:text-xs px-2 py-0.5 rounded-md uppercase tracking-wide">
                            {producto.unidad}
                          </span>
                        </div>

                        {/* Nombre del Producto */}
                        <h3 
                          className="text-xs sm:text-sm font-bold text-white group-hover:text-lime-400 transition-colors line-clamp-1"
                          title={producto.nombre}
                        >
                          {producto.nombre}
                        </h3>

                      </div>
                    </div>

                    {/* Fila Inferior: Precio + Botón Agregar (+) */}
                    <div className="p-3 pt-0 flex items-center justify-between gap-2 mt-1">
                      <div>
                        <span className="text-sm sm:text-base font-extrabold text-lime-400 block leading-none">
                          {formatearPrecio(producto.precio)}
                        </span>
                        <span className="text-[9px] sm:text-[10px] text-neutral-400 font-medium">por {producto.unidad}</span>
                      </div>

                      {!(session?.user?.role === 'CAMPESINO' && miAgricultorId === undefined) && !isOwnerAgricultor && (
                        <button
                          type="button"
                          className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-lime-500 hover:bg-lime-400 text-neutral-950 font-black flex items-center justify-center transition-all shadow-md shadow-lime-950/40 cursor-pointer flex-shrink-0 active:scale-95"
                          onClick={(e) => { e.stopPropagation(); handleAddToCart(producto); }}
                          title="Agregar al carrito"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-neutral-950" viewBox="0 0 24 24">
                            <g fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2">
                              <path d="M1 2h4l3 12.4a2 2 0 0 0 2 1.6h9a2 2 0 0 0 2-1.6L23 6H6"/>
                              <circle cx="9" cy="21" r="1"/>
                              <circle cx="20" cy="21" r="1"/>
                            </g>
                          </svg>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* Vista Lista */
            <div className="space-y-4">
              {productosFiltrados.map((producto) => {
                const isOwnerAgricultor = session?.user?.role === 'CAMPESINO' && !!miAgricultorId && !!producto.agricultorId && String(miAgricultorId) === String(producto.agricultorId);
                const hasValidImage = Boolean(
                  producto.imagen && 
                  typeof producto.imagen === 'string' && 
                  (producto.imagen.startsWith('http') || producto.imagen.startsWith('/') || producto.imagen.startsWith('data:'))
                );

                const imageSrc = producto.imagen && (producto.imagen.startsWith('http') || producto.imagen.startsWith('data:'))
                  ? producto.imagen
                  : `${typeof window !== 'undefined' ? window.location.origin : ''}${producto.imagen && producto.imagen.startsWith('/') ? '' : '/'}${producto.imagen || ''}`;

                return (
                  <div
                    key={producto.id}
                    className="bg-neutral-900 hover:bg-neutral-800/80 rounded-xl border border-neutral-800/60 transition-colors overflow-hidden p-4 flex flex-col md:flex-row gap-4 cursor-pointer"
                    onClick={() => abrirDetalle(producto)}
                  >
                    <div className="relative w-full md:w-48 h-40 flex-shrink-0 rounded-xl overflow-hidden bg-neutral-850">
                      {hasValidImage ? (
                        <img
                          src={imageSrc}
                          alt={producto.nombre}
                          className="w-full h-full object-cover cursor-pointer"
                          onClick={() => abrirDetalle(producto)}
                        />
                      ) : (
                        <div 
                          className="w-full h-full bg-gradient-to-br from-neutral-800 to-neutral-750 flex flex-col items-center justify-center cursor-pointer"
                          onClick={() => abrirDetalle(producto)}
                        >
                          <Sprout className="w-8 h-8 text-lime-400 mb-1" />
                          <span className="text-[11px] font-semibold text-neutral-400">Producto Agrícola</span>
                        </div>
                      )}
                      <button
                        onClick={() => toggleFavorite(producto.id)}
                        className={`absolute top-2 right-2 p-2 rounded-lg transition-all ${
                          producto.isFavorite ? 'bg-red-600 text-white' : 'bg-neutral-900/80 text-neutral-300'
                        }`}
                      >
                        <Heart className={`w-4 h-4 ${producto.isFavorite ? 'fill-current' : ''}`} />
                      </button>
                    </div>

                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between items-start gap-4 mb-2">
                          <h3 className="text-lg font-bold text-white hover:text-lime-400 transition-colors cursor-pointer" onClick={() => abrirDetalle(producto)}>
                            {producto.nombre}
                          </h3>
                          <div className="text-right">
                            <div className="text-xl font-extrabold text-lime-400">{formatearPrecio(producto.precio)}</div>
                            <div className="text-xs text-neutral-400">por {producto.unidad}</div>
                          </div>
                        </div>
                        <p className="text-neutral-300 text-sm leading-relaxed mb-3 line-clamp-2">{producto.descripcion}</p>

                        <div className="flex flex-wrap gap-4 text-xs text-neutral-400">
                          <div className="flex items-center gap-1.5">
                            <User className="w-3.5 h-3.5 text-lime-500" />
                            <span className="text-neutral-200 font-medium">{producto.agricultor}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <MapPin className="w-3.5 h-3.5 text-orange-400" />
                            <span>{producto.ubicacion}</span>
                          </div>
                        </div>
                      </div>

                      <div className="pt-4 flex items-center justify-between">
                        {producto.purchaseUnits && producto.purchaseUnits.length > 0 ? (
                          <span className="inline-flex items-center gap-1.5 text-xs bg-lime-500/10 text-lime-400 border border-lime-500/20 px-2.5 py-1 rounded-full font-medium">
                            <Package className="w-3.5 h-3.5" />
                            <span>{producto.purchaseUnits.length + 1} presentaciones disponibles</span>
                          </span>
                        ) : <div />}

                        {!(session?.user?.role === 'CAMPESINO' && miAgricultorId === undefined) && !isOwnerAgricultor && (
                          <button
                            className="bg-gradient-to-r from-lime-600 to-lime-500 hover:from-lime-500 hover:to-lime-600 text-white font-bold py-2 px-5 rounded-xl transition-all shadow-md flex items-center gap-2 text-sm"
                            onClick={() => handleAddToCart(producto)}
                          >
                            <ShoppingCart className="w-4 h-4" />
                            <span>Comprar Ahora</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Estado Vacío Limpio Vectorizado */}
          {productosFiltrados.length === 0 && (
            <div className="text-center py-16 bg-neutral-900/90 rounded-2xl border border-neutral-800 shadow-xl max-w-2xl mx-auto my-8 p-8">
              <div className="inline-flex items-center justify-center p-4 bg-neutral-800/80 border border-neutral-700 rounded-2xl text-lime-400 mb-4 shadow-inner">
                <PackageSearch className="w-10 h-10" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">No se encontraron productos</h3>
              <p className="text-neutral-400 text-sm max-w-md mx-auto mb-6">
                {busqueda ? `No hay productos que coincidan con "${busqueda}"` : 
                 filtroCategoria !== "Todos" ? `No hay productos en la categoría "${filtroCategoria}"` :
                 "No hay productos disponibles en este momento en la base de datos."}
              </p>
              <div className="inline-flex flex-col sm:flex-row gap-3 text-xs text-neutral-400 bg-neutral-850 p-3 rounded-xl border border-neutral-800">
                <span>• Intenta con otros términos</span>
                <span className="hidden sm:inline">•</span>
                <span>• Cambia los filtros de categoría</span>
                <span className="hidden sm:inline">•</span>
                <span>• Explora otras ciudades</span>
              </div>
            </div>
          )}

          {apiError && (
            <div className="bg-neutral-900 border border-red-500/60 text-red-400 rounded-xl p-4 my-6 text-center text-sm shadow-xl">
              No fue posible conectar con el servidor de productos.<br />
              <span className="font-semibold text-xs opacity-80">Por favor verifica tu conexión e intenta recargar la página.</span>
            </div>
          )}
        </>
      )}
    </div>
  );
}