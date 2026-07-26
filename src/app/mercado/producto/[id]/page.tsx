"use client";

import { useEffect, useMemo, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { MapPin, User, ArrowLeft, ShoppingCart, ChevronLeft, ChevronRight, Heart, ShieldCheck, Sprout, Package, Clock, CheckCircle2 } from "lucide-react";
import { useCartStore } from "@/store/cart";
import { useSession } from "next-auth/react";

interface ProductoDetalle {
  id: string;
  name: string;
  description: string;
  price: number;
  unit: string;
  purchaseUnits?: Array<{ unit: string; equivalencia: number; price?: number }> | string | null;
  category?: { id?: string; name: string } | null;
  agricultor?: { id: string; user?: { nombre?: string | null } | null; user_id?: string } | null;
  agricultorId?: string | null;
  imageUrl?: string | null;
  imagenes?: string[] | null;
  stock: number;
  metodosEntrega?: string[] | null;
  municipio?: string | null;
  vereda?: string | null;
  tipoCultivo?: string | null;
  pesoAproximado?: number | null;
  certificaciones?: any;
}

export default function ProductoDetallePage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { data: session } = useSession();
  const cart = useCartStore();

  const [producto, setProducto] = useState<ProductoDetalle | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPurchaseUnit, setSelectedPurchaseUnit] = useState<{ unit: string; equivalencia: number; price?: number } | null>(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [productosSimilares, setProductosSimilares] = useState<any[]>([]);

  const carouselRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const load = async () => {
      try {
        if (!params?.id) return;
        const res = await fetch(`/api/productos/${encodeURIComponent(params.id as string)}`);
        if (!res.ok) {
          setError("Producto no encontrado");
          return;
        }
        const p = await res.json();
        if (!p || !p.id) {
          setError("Producto no encontrado");
          return;
        }
        // Normalize purchaseUnits
        if (p && p.purchaseUnits) {
          try {
            if (typeof p.purchaseUnits === 'string') {
              p.purchaseUnits = JSON.parse(p.purchaseUnits);
            }
          } catch (_) {
            p.purchaseUnits = [];
          }
        }
        // Normalize imagenes
        if (p && p.imagenes) {
          try {
            if (typeof p.imagenes === 'string') {
              p.imagenes = JSON.parse(p.imagenes);
            }
          } catch (_) {
            p.imagenes = [];
          }
        }
        // Normalize metodosEntrega
        if (p && p.metodosEntrega) {
          try {
            if (typeof p.metodosEntrega === 'string') {
              p.metodosEntrega = JSON.parse(p.metodosEntrega);
            }
          } catch (_) {
            p.metodosEntrega = [];
          }
        }
        setProducto(p);
        setSelectedPurchaseUnit(null);
      } catch (e) {
        setError("No se pudo cargar el producto");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [params?.id]);

  // Cargar productos similares
  useEffect(() => {
    const fetchSimilares = async () => {
      try {
        const res = await fetch('/api/productos');
        if (!res.ok) return;
        const data = await res.json();
        if (Array.isArray(data)) {
          // Filtrar el producto actual
          const list = data.filter((p: any) => String(p.id) !== String(params?.id));
          setProductosSimilares(list);
        }
      } catch (err) {
        console.error('Error al cargar productos similares:', err);
      }
    };
    if (params?.id) fetchSimilares();
  }, [params?.id]);

  // Cargar estado de favoritos
  useEffect(() => {
    const checkFavorite = async () => {
      if (!session?.user?.id || !params?.id) return;
      try {
        const res = await fetch('/api/comprador/favoritos');
        if (!res.ok) return;
        const favs = await res.json();
        const exists = favs.some((f: any) => String(f.product?.id || f.productId) === String(params.id));
        setIsFavorite(exists);
      } catch (_) {}
    };
    checkFavorite();
  }, [session?.user?.id, params?.id]);

  const toggleFavorite = async () => {
    if (!producto) return;
    try {
      if (isFavorite) {
        await fetch(`/api/comprador/favoritos?productId=${encodeURIComponent(producto.id)}`, { method: 'DELETE' });
        setIsFavorite(false);
      } else {
        await fetch('/api/comprador/favoritos', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ productId: producto.id })
        });
        setIsFavorite(true);
      }
    } catch (_) {}
  };

  const formatearPrecio = (precio: number) =>
    new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", minimumFractionDigits: 0 }).format(precio);

  // Parse purchase units
  const purchaseUnits = useMemo(() => {
    if (!producto?.purchaseUnits) return [];
    if (Array.isArray(producto.purchaseUnits)) return producto.purchaseUnits;
    return [];
  }, [producto?.purchaseUnits]);

  // Calculate current price based on selected purchase unit
  const precioActual = useMemo(() => {
    if (!producto) return 0;
    if (!selectedPurchaseUnit) return producto.price;
    if ((selectedPurchaseUnit as any).price != null) return (selectedPurchaseUnit as any).price;
    return producto.price * selectedPurchaseUnit.equivalencia;
  }, [producto, selectedPurchaseUnit]);

  const unidadActual = selectedPurchaseUnit?.unit || producto?.unit;

  const gallery: string[] = useMemo(() => {
    const imgs: string[] = [];
    if (producto && Array.isArray(producto.imagenes) && producto.imagenes.length) imgs.push(...producto.imagenes.filter(Boolean));
    if (producto && producto.imageUrl) imgs.push(producto.imageUrl);
    return imgs.length ? imgs : [];
  }, [producto?.imageUrl, producto?.imagenes]);

  const [active, setActive] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [showOwnerAlert, setShowOwnerAlert] = useState(false);
  const canPrev = active > 0;
  const canNext = active < Math.max(gallery.length - 1, 0);

  const esPropietario = !!(
    session?.user?.role === "CAMPESINO" &&
    session?.user?.id &&
    (
      ((producto?.agricultor as any)?.user_id && String(session.user.id) === String((producto?.agricultor as any).user_id)) ||
      (producto?.agricultor?.id && String(session.user.id) === String(producto.agricultor.id))
    )
  );

  useEffect(() => {
    let t: any;
    if (esPropietario) {
      setShowOwnerAlert(true);
      t = setTimeout(() => setShowOwnerAlert(false), 4000);
    } else {
      setShowOwnerAlert(false);
    }
    return () => clearTimeout(t);
  }, [esPropietario]);

  const handleAddToCart = (qty: number = 1) => {
    if (!producto) return;
    if (producto.stock <= 0) return;
    cart.addItem({
      id: producto.id,
      nombre: producto.name,
      precio: precioActual,
      stock: producto.stock,
      unidad: unidadActual || producto.unit,
      purchaseUnit: unidadActual || producto.unit,
      campesinoId: producto.agricultorId || producto.agricultor?.id || "desconocido",
      campesinoName: producto.agricultor?.user?.nombre || "desconocido",
      imagen: producto.imageUrl || (gallery[0] || ""),
      metodosEntrega: Array.isArray(producto.metodosEntrega) ? producto.metodosEntrega : null,
    }, qty);
    cart.toggleCart();
  };

  const scrollLeft = () => carouselRef.current?.scrollBy({ left: -320, behavior: 'smooth' });
  const scrollRight = () => carouselRef.current?.scrollBy({ left: 320, behavior: 'smooth' });

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-900 flex items-center justify-center text-neutral-200">
        <div className="flex items-center gap-3">
          <Sprout className="w-6 h-6 text-lime-400 animate-spin" />
          <span className="font-semibold text-sm">Cargando producto...</span>
        </div>
      </div>
    );
  }

  if (error || !producto) {
    return (
      <div className="min-h-screen bg-neutral-900 flex flex-col items-center justify-center text-neutral-200 p-4">
        <p className="mb-4 text-base font-semibold">{error || "Producto no encontrado"}</p>
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-lime-500 text-neutral-950 font-bold hover:bg-lime-400 transition"
        >
          <ArrowLeft className="w-4 h-4" /> Volver al mercado
        </button>
      </div>
    );
  }

  const nombreAgricultor = producto.agricultor?.user?.nombre || (producto.agricultor as any)?.nombre || "Agricultor de AgroConecta";
  const municipio = producto.municipio || "Colombia";
  const vereda = producto.vereda ? `, Vereda ${producto.vereda}` : "";
  const ubicacionCompleta = `${municipio}${vereda}`;

  return (
    <div className="min-h-screen bg-neutral-900 text-white pb-16">
      <div className="max-w-7xl mx-auto px-4 py-4 md:py-8 space-y-8">
        
        {/* Barra superior de regreso */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center gap-2 text-sm font-semibold text-neutral-300 hover:text-lime-400 transition-colors bg-neutral-800/80 hover:bg-neutral-800 px-3.5 py-2 rounded-xl border border-neutral-750"
          >
            <ArrowLeft className="w-4 h-4" /> Volver al mercado
          </button>

          <button
            onClick={toggleFavorite}
            className={`p-2.5 rounded-xl transition-all shadow-md flex items-center gap-2 text-xs font-semibold ${
              isFavorite
                ? 'bg-red-600 text-white hover:bg-red-700'
                : 'bg-neutral-800 text-neutral-300 hover:text-red-400 border border-neutral-700'
            }`}
          >
            <Heart className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
            <span className="hidden sm:inline">{isFavorite ? 'Guardado en Favoritos' : 'Guardar en Favoritos'}</span>
          </button>
        </div>

        {/* Tarjeta Principal de Detalle */}
        <div className="bg-neutral-850 border border-neutral-800 rounded-2xl overflow-hidden shadow-2xl grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8 p-4 md:p-8">
          
          {/* Galería izquierda */}
          <div className="lg:col-span-6 flex flex-col sm:flex-row gap-4">
            {/* Thumbnails verticales */}
            {gallery.length > 1 && (
              <div className="hidden sm:flex flex-col gap-3 w-20 overflow-y-auto max-h-[480px] pr-1">
                {gallery.map((src, i) => (
                  <button
                    key={i}
                    onClick={() => setActive(i)}
                    className={`rounded-xl overflow-hidden h-20 w-20 flex-shrink-0 transition-all ${
                      i === active 
                        ? 'ring-2 ring-lime-500 scale-105 shadow-md shadow-lime-950/40' 
                        : 'border border-neutral-750 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={src} alt={`Vista ${i+1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}

            {/* Imagen principal */}
            <div className="relative flex-1 bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden group flex items-center justify-center min-h-[320px] md:min-h-[460px]">
              {gallery.length ? (
                <img src={gallery[active]} alt={producto.name} className="w-full h-full max-h-[480px] object-cover transition-transform duration-500 group-hover:scale-105" />
              ) : producto.imageUrl ? (
                <img src={producto.imageUrl} alt={producto.name} className="w-full h-full max-h-[480px] object-cover" />
              ) : (
                <div className="flex flex-col items-center justify-center text-neutral-400 p-8">
                  <Sprout className="w-16 h-16 text-lime-500 mb-2" />
                  <span className="text-xs uppercase tracking-wider font-semibold">Producto Agrícola</span>
                </div>
              )}

              {/* Botones de Navegación de Galería */}
              {gallery.length > 1 && (
                <>
                  <button
                    onClick={() => canPrev && setActive(a => Math.max(a-1, 0))}
                    disabled={!canPrev}
                    className={`absolute left-3 top-1/2 -translate-y-1/2 p-2.5 rounded-full ${canPrev ? 'bg-neutral-900/80 hover:bg-neutral-900 text-white' : 'bg-neutral-900/40 text-neutral-600 cursor-not-allowed'} shadow-lg backdrop-blur-sm`}
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => canNext && setActive(a => Math.min(a+1, gallery.length-1))}
                    disabled={!canNext}
                    className={`absolute right-3 top-1/2 -translate-y-1/2 p-2.5 rounded-full ${canNext ? 'bg-neutral-900/80 hover:bg-neutral-900 text-white' : 'bg-neutral-900/40 text-neutral-600 cursor-not-allowed'} shadow-lg backdrop-blur-sm`}
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Columna derecha: Detalles y Compra */}
          <div className="lg:col-span-6 space-y-6 flex flex-col justify-between">
            <div className="space-y-4">
              
              {/* Breadcrumb / Categoría */}
              <div className="flex items-center gap-2">
                <span className="inline-block bg-lime-500/10 border border-lime-500/20 text-lime-400 font-extrabold text-xs px-2.5 py-1 rounded-md uppercase tracking-wider">
                  {producto.category?.name || 'Producto Agrícola'}
                </span>
                <span className="text-xs text-neutral-400">• Venta Directa</span>
              </div>

              {/* Título y Descripción */}
              <div>
                <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight mb-2">
                  {producto.name}
                </h1>
                <p className="text-neutral-300 text-xs md:text-sm leading-relaxed line-clamp-3">
                  {producto.description || "Producto fresco cosechado por nuestros campesinos locales directamente para tu mesa."}
                </p>
              </div>

              {/* Bloque de Precio */}
              <div className="bg-neutral-900 p-4 rounded-xl border border-neutral-800 flex items-baseline justify-between">
                <div>
                  <div className="text-3xl md:text-4xl font-extrabold text-lime-400">
                    {formatearPrecio(precioActual)}
                  </div>
                  <div className="text-xs text-neutral-400 font-medium">
                    Precio por {unidadActual}
                  </div>
                </div>

                {selectedPurchaseUnit && (
                  <div className="text-right">
                    <span className="inline-block bg-lime-500/10 text-lime-400 border border-lime-500/20 text-xs font-bold px-2.5 py-1 rounded-md">
                      {selectedPurchaseUnit.equivalencia} {producto.unit}
                    </span>
                  </div>
                )}
              </div>

              {/* Opciones de Compra / Empaque */}
              {purchaseUnits.length > 0 && (
                <div className="space-y-2.5 pt-2">
                  <label className="text-xs font-bold text-neutral-200 uppercase tracking-wider block flex items-center gap-1.5">
                    <Package className="w-4 h-4 text-lime-400" /> Opciones de Presentación
                  </label>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                    {/* Opción Base */}
                    <button
                      type="button"
                      onClick={() => setSelectedPurchaseUnit(null)}
                      className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                        !selectedPurchaseUnit
                          ? 'bg-lime-500/10 border-lime-500 text-lime-400 font-bold shadow-md'
                          : 'bg-neutral-900 border-neutral-800 text-neutral-300 hover:bg-neutral-800'
                      }`}
                    >
                      <div className="text-xs font-bold uppercase">{producto.unit}</div>
                      <div className="text-sm font-extrabold text-white">{formatearPrecio(producto.price)}</div>
                    </button>

                    {/* Opciones Adicionales */}
                    {purchaseUnits.map((pu, idx) => {
                      const p = (pu as any).price != null ? (pu as any).price : producto.price * pu.equivalencia;
                      const isSel = selectedPurchaseUnit?.unit === pu.unit;
                      return (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setSelectedPurchaseUnit(pu)}
                          className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                            isSel
                              ? 'bg-lime-500/10 border-lime-500 text-lime-400 font-bold shadow-md'
                              : 'bg-neutral-900 border-neutral-800 text-neutral-300 hover:bg-neutral-800'
                          }`}
                        >
                          <div className="text-xs font-bold uppercase">{pu.unit}</div>
                          <div className="text-sm font-extrabold text-white">{formatearPrecio(p)}</div>
                          <div className="text-[10px] text-neutral-400 font-medium">{pu.equivalencia} {producto.unit}</div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Tarjeta del Vendedor / Agricultor con Ubicación */}
              <div className="bg-gradient-to-br from-neutral-900 to-neutral-850 p-4 rounded-xl border border-neutral-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-lime-500/10 border border-lime-500/30 flex items-center justify-center text-lime-400">
                      <User className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-xs text-neutral-400 font-medium">Cultivado y vendido por</div>
                      <div className="text-sm font-bold text-white flex items-center gap-1.5">
                        <span>{nombreAgricultor}</span>
                        <ShieldCheck className="w-4 h-4 text-lime-400 flex-shrink-0" />
                      </div>
                    </div>
                  </div>

                  <span className="bg-lime-500/10 text-lime-400 text-[10px] font-bold px-2 py-0.5 rounded border border-lime-500/20 uppercase tracking-wider">
                    Campesino Directo
                  </span>
                </div>

                <div className="pt-2 border-t border-neutral-800 flex items-center gap-2 text-xs text-neutral-300">
                  <MapPin className="w-4 h-4 text-orange-400 flex-shrink-0" />
                  <span className="font-semibold text-white">Origen:</span>
                  <span className="text-neutral-300 truncate">{ubicacionCompleta}</span>
                </div>
              </div>

              {/* Alerta si es el propietario */}
              {esPropietario && showOwnerAlert && (
                <div className="p-3 rounded-xl border border-amber-500/40 bg-amber-950/20 text-amber-300 text-xs font-semibold">
                  Eres el agricultor propietario de este producto. No puedes realizar auto-compras.
                </div>
              )}
            </div>

            {/* Fila de Acción de Compra */}
            <div className="pt-4 border-t border-neutral-800 space-y-3">
              {!esPropietario && (
                <div className="flex items-center gap-3">
                  {/* Selector de Cantidad */}
                  <div className="flex items-center bg-neutral-900 border border-neutral-800 rounded-xl p-1">
                    <button
                      type="button"
                      onClick={() => setQuantity(q => Math.max(1, q - 1))}
                      disabled={quantity <= 1}
                      className="w-9 h-9 flex items-center justify-center rounded-lg text-neutral-300 hover:bg-neutral-800 disabled:opacity-40"
                    >-</button>
                    <span className="w-10 text-center font-extrabold text-sm text-white">{quantity}</span>
                    <button
                      type="button"
                      onClick={() => setQuantity(q => Math.min(producto.stock, q + 1))}
                      disabled={quantity >= producto.stock}
                      className="w-9 h-9 flex items-center justify-center rounded-lg text-neutral-300 hover:bg-neutral-800 disabled:opacity-40"
                    >+</button>
                  </div>

                  {/* Botón Agregar al Carrito */}
                  <button
                    type="button"
                    onClick={() => handleAddToCart(quantity)}
                    disabled={producto.stock <= 0}
                    className={`flex-1 font-extrabold py-3 px-5 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 text-sm cursor-pointer ${
                      producto.stock <= 0
                        ? "bg-neutral-800 text-neutral-500 cursor-not-allowed border border-neutral-750"
                        : "bg-lime-500 hover:bg-lime-400 text-neutral-950 shadow-lime-950/40 active:scale-95"
                    }`}
                  >
                    <ShoppingCart className="w-5 h-5 text-neutral-950" />
                    <span>{producto.stock <= 0 ? "Producto Agotado" : "Agregar al carrito"}</span>
                  </button>
                </div>
              )}
            </div>

          </div>
        </div>

        {/* Tabs de Características y Descripción */}
        <div className="bg-neutral-850 border border-neutral-800 rounded-2xl p-4 md:p-6 shadow-xl">
          <Tabs producto={producto} />
        </div>

        {/* Carrusel de Productos Similares */}
        {productosSimilares.length > 0 && (
          <div className="space-y-4 pt-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg md:text-xl font-bold text-white flex items-center gap-2">
                  <Sprout className="w-5 h-5 text-lime-400" />
                  <span>Productos Similares que te pueden interesar</span>
                </h2>
                <p className="text-xs text-neutral-400">Cosechados por nuestros agricultores en la región</p>
              </div>

              {/* Botones de Scroll del Carrusel */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={scrollLeft}
                  className="p-2 rounded-xl bg-neutral-800 hover:bg-neutral-750 border border-neutral-700 text-neutral-200 transition"
                  title="Anterior"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={scrollRight}
                  className="p-2 rounded-xl bg-neutral-800 hover:bg-neutral-750 border border-neutral-700 text-neutral-200 transition"
                  title="Siguiente"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Contenedor Carrusel Scroll Horizontal */}
            <div
              ref={carouselRef}
              className="flex items-stretch gap-4 overflow-x-auto scrollbar-none pb-4 pt-1 scroll-smooth"
            >
              {productosSimilares.map((p) => {
                const img = p.imageUrl || (Array.isArray(p.imagenes) && p.imagenes[0]) || p.imagen || "";
                return (
                  <div
                    key={p.id}
                    className="w-56 sm:w-64 flex-shrink-0 bg-neutral-900 hover:bg-neutral-850 rounded-xl border border-neutral-800/60 hover:border-neutral-700 transition-all duration-300 overflow-hidden group flex flex-col justify-between shadow-lg cursor-pointer"
                    onClick={() => router.push(`/mercado/producto/${p.id}`)}
                  >
                    <div>
                      {/* Imagen */}
                      <div className="relative bg-neutral-900 overflow-hidden h-36">
                        {img ? (
                          <img
                            src={img}
                            alt={p.name || p.nombre}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-neutral-900 to-neutral-800 flex items-center justify-center">
                            <Sprout className="w-8 h-8 text-lime-400/40" />
                          </div>
                        )}
                      </div>

                      {/* Info */}
                      <div className="p-3 space-y-1.5">
                        <span className="inline-block bg-lime-500/10 border border-lime-500/20 text-lime-400 font-bold text-[10px] px-2 py-0.5 rounded uppercase">
                          {p.unit || p.unidad || "Unidad"}
                        </span>
                        <h3 className="text-xs font-bold text-white group-hover:text-lime-400 transition-colors line-clamp-1">
                          {p.name || p.nombre}
                        </h3>
                      </div>
                    </div>

                    {/* Precio inferior */}
                    <div className="p-3 pt-0 flex items-center justify-between">
                      <div>
                        <span className="text-sm font-extrabold text-lime-400 block leading-none">
                          {formatearPrecio(p.price || p.precio || 0)}
                        </span>
                        <span className="text-[9px] text-neutral-400">por {p.unit || p.unidad}</span>
                      </div>
                      <div className="w-7 h-7 rounded-full bg-lime-500 text-neutral-950 flex items-center justify-center">
                        <ShoppingCart className="w-3.5 h-3.5" />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

function Tabs({ producto }: { producto: ProductoDetalle }) {
  const [tab, setTab] = useState<'car' | 'desc'>('car');
  const caracteristicas: Array<{ label: string; value: string | number | null | undefined }> = [
    { label: 'Categoría', value: producto.category?.name },
    { label: 'Unidad de Medida Base', value: producto.unit },
    { label: 'Tipo de Cultivo', value: producto.tipoCultivo || 'Convencional' },
    { label: 'Peso Aproximado', value: producto.pesoAproximado ? `${producto.pesoAproximado} kg` : null },
    { label: 'Certificaciones', value: Array.isArray(producto.certificaciones) ? producto.certificaciones.join(', ') : (typeof producto.certificaciones === 'string' ? producto.certificaciones : null) },
  ];

  return (
    <div>
      <div className="flex gap-6 border-b border-neutral-800 mb-4">
        <button
          type="button"
          onClick={() => setTab('car')}
          className={`pb-2.5 text-xs sm:text-sm font-bold uppercase tracking-wider transition-colors cursor-pointer ${
            tab === 'car' ? 'text-lime-400 border-b-2 border-lime-400' : 'text-neutral-400 hover:text-white'
          }`}
        >
          Características del Producto
        </button>
        <button
          type="button"
          onClick={() => setTab('desc')}
          className={`pb-2.5 text-xs sm:text-sm font-bold uppercase tracking-wider transition-colors cursor-pointer ${
            tab === 'desc' ? 'text-lime-400 border-b-2 border-lime-400' : 'text-neutral-400 hover:text-white'
          }`}
        >
          Descripción Detallada
        </button>
      </div>

      {tab === 'car' ? (
        <div className="divide-y divide-neutral-800">
          {caracteristicas.filter(c => c.value).map((c, i) => (
            <div key={i} className="flex items-center justify-between py-2.5 text-xs sm:text-sm">
              <span className="text-neutral-400 font-medium">{c.label}</span>
              <span className="text-white font-bold ml-4">{String(c.value)}</span>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-neutral-300 text-xs sm:text-sm leading-relaxed whitespace-pre-wrap py-2">
          {producto.description || 'Este producto no cuenta con descripción adicional.'}
        </div>
      )}
    </div>
  );
}
