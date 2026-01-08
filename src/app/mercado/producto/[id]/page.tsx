"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { MapPin, User, ArrowLeft, ShoppingCart, ChevronLeft, ChevronRight } from "lucide-react";
import { useCartStore } from "@/store/cart";
import { useSession } from "next-auth/react";

interface ProductoDetalle {
  id: string;
  name: string;
  description: string;
  price: number;
  unit: string;
  purchaseUnits?: string[] | string | null;
  category?: { name: string } | null;
  agricultor?: { id: string; user?: { nombre?: string | null } | null } | null;
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
  const [selectedUnit, setSelectedUnit] = useState<string | null>(null);

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
        // Normalize purchaseUnits if present
        if (p && p.purchaseUnits) {
          try {
            if (Array.isArray(p.purchaseUnits)) p.purchaseUnits = p.purchaseUnits;
            else if (typeof p.purchaseUnits === 'string') p.purchaseUnits = JSON.parse(p.purchaseUnits);
          } catch (_) {
            // leave as-is
          }
        }
        setProducto(p);
        if (p && Array.isArray(p.purchaseUnits) && p.purchaseUnits.length > 0) {
          setSelectedUnit(String(p.purchaseUnits[0]));
        }
      } catch (e) {
        setError("No se pudo cargar el producto");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [params?.id]);

  const formatearPrecio = (precio: number) =>
    new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", minimumFractionDigits: 0 }).format(precio);

  const handleAddToCart = () => {
    if (!producto) return;
    if (producto.stock <= 0) return;
    cart.addItem({
      id: producto.id,
      name: producto.name,
      price: producto.price,
      stock: producto.stock,
      unit: producto.unit,
      purchaseUnit: selectedUnit ?? producto.unit,
      campesinoId: producto.agricultorId || producto.agricultor?.id || "desconocido",
      campesinoName: producto.agricultor?.user?.nombre || "desconocido",
      imageUrl: producto.imageUrl || "",
      metodosEntrega: Array.isArray(producto.metodosEntrega) ? producto.metodosEntrega : null,
    });
  };

  // Mantener el orden de hooks: declarar useMemo/useState antes de cualquier return condicional
  const gallery: string[] = useMemo(() => {
    const imgs: string[] = [];
    if (producto && Array.isArray(producto.imagenes) && producto.imagenes.length) imgs.push(...producto.imagenes.filter(Boolean));
    if (producto && producto.imageUrl) imgs.push(producto.imageUrl);
    return imgs.length ? imgs : [];
  }, [producto?.imageUrl, producto?.imagenes]);
  const [active, setActive] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedDelivery, setSelectedDelivery] = useState<string | null>(null);
  const [showOwnerAlert, setShowOwnerAlert] = useState(false);
  const canPrev = active > 0;
  const canNext = active < Math.max(gallery.length - 1, 0);

  // Regla: agricultor no puede comprar su propio producto
  const esPropietario = !!(
    session?.user?.role === "CAMPESINO" &&
    session?.user?.id &&
    (
      // Prefer user_id (owner user id) returned by the API, fall back to agricultor profile id
      (producto?.agricultor as any)?.user_id && String(session.user.id) === String((producto?.agricultor as any).user_id) ||
      (producto?.agricultor?.id && String(session.user.id) === String(producto.agricultor.id))
    )
  );

  // Mostrar el mensaje de propietario solo una vez por carga de página
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

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-900 flex items-center justify-center text-neutral-200">
        Cargando producto...
      </div>
    );
  }

  if (error || !producto) {
    return (
      <div className="min-h-screen bg-neutral-900 flex flex-col items-center justify-center text-neutral-200 p-4">
        <p className="mb-4 text-sm md:text-base">{error || "Producto no encontrado"}</p>
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-neutral-700 text-neutral-100 hover:bg-neutral-800"
        >
          <ArrowLeft className="w-4 h-4" /> Volver al mercado
        </button>
      </div>
    );
  }

  const ubicacion = [producto.municipio, producto.vereda].filter(Boolean).join(", ") || "Colombia";

  return (
    <div className="min-h-screen bg-neutral-900 text-white">
      <div className="max-w-7xl mx-auto px-4 py-4 md:py-8">
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-2 text-sm text-neutral-300 hover:text-white mb-4"
        >
          <ArrowLeft className="w-4 h-4" /> Volver al mercado
        </button>

        <div className="bg-neutral-800 border border-neutral-700 rounded-2xl overflow-hidden shadow-2xl grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8 p-4 md:p-6">
          {/* Galería izquierda */}
          <div className="lg:col-span-7 flex gap-3">
            {/* Thumbnails verticales */}
            <div className="hidden sm:flex flex-col gap-2 w-20">
              {(gallery.length ? gallery : [producto.imageUrl]).filter(Boolean).map((src, i) => (
                <button
                  key={i}
                  onClick={() => setActive(i)}
                  className={`border rounded-lg overflow-hidden h-20 w-20 ${i === active ? 'border-green-600' : 'border-neutral-700 hover:border-neutral-600'}`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={src as string} alt={`Vista ${i+1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
            {/* Imagen principal */}
            <div className="relative flex-1 bg-neutral-900 border border-neutral-700 rounded-xl overflow-hidden">
              {gallery.length ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={gallery[active]} alt={producto.name} className="w-full h-[360px] md:h-[460px] object-cover" />
              ) : producto.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={producto.imageUrl} alt={producto.name} className="w-full h-[360px] md:h-[460px] object-cover" />
              ) : (
                <div className="w-full h-[360px] md:h-[460px] flex items-center justify-center text-6xl text-neutral-300">🌿</div>
              )}
              {gallery.length > 1 && (
                <>
                  <button
                    onClick={() => canPrev && setActive(a => Math.max(a-1, 0))}
                    disabled={!canPrev}
                    className={`absolute left-2 top-1/2 -translate-y-1/2 p-2 rounded-full border ${canPrev ? 'bg-neutral-800/80 hover:bg-neutral-700 border-neutral-600' : 'bg-neutral-800/40 border-neutral-700 cursor-not-allowed'}`}
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => canNext && setActive(a => Math.min(a+1, gallery.length-1))}
                    disabled={!canNext}
                    className={`absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full border ${canNext ? 'bg-neutral-800/80 hover:bg-neutral-700 border-neutral-600' : 'bg-neutral-800/40 border-neutral-700 cursor-not-allowed'}`}
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Columna derecha */}
          <div className="lg:col-span-5 space-y-4">
            <div>
                <div className="text-xs uppercase tracking-wide text-neutral-400 mb-1">
                  <nav className="text-xs text-neutral-400 mb-2">
                    <ol className="flex items-center gap-2">
                      <li className="text-neutral-400">Mercado</li>
                      <li className="text-neutral-600">/</li>
                      <li className="text-neutral-400">{producto.category?.name || 'Producto'}</li>
                      <li className="text-neutral-600">/</li>
                      <li className="text-neutral-200 font-medium" aria-current="page">{producto.name}</li>
                    </ol>
                  </nav>
                </div>
              <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight mb-2">{producto.name}</h1>
              <p className="text-neutral-300 text-sm md:text-base leading-relaxed">
                {producto.description}
              </p>
            </div>

            <div className="flex items-start gap-6">
              <div>
                <div className="text-2xl md:text-3xl font-extrabold text-green-400">
                  {formatearPrecio(producto.price)}
                </div>
                <div className="text-xs text-neutral-400">por {producto.unit}</div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-neutral-200">
                <User className="w-4 h-4 text-green-500" />
                <span className="font-medium">{producto.agricultor?.user?.nombre || "Agricultor desconocido"}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-neutral-400">
                <MapPin className="w-4 h-4 text-orange-500" />
                <span>{ubicacion}</span>
              </div>
            </div>

            

            {esPropietario && showOwnerAlert && (
              <div className="mt-2 p-3 rounded-lg border border-amber-600 bg-amber-900/20 text-amber-300" role="alert">
                Eres el agricultor de este producto. No puedes comprar tu propio producto.
              </div>
            )}

            <div className="pt-3">
              {!esPropietario && (
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setQuantity(q => Math.max(1, q-1))}
                      disabled={quantity <= 1}
                      className="px-3 py-2 rounded-lg bg-neutral-800 border border-neutral-700 text-neutral-200"
                    >-</button>
                    <div className="px-4 py-2 bg-neutral-900 border border-neutral-700 rounded-lg text-neutral-100">{quantity}</div>
                    <button
                      onClick={() => setQuantity(q => Math.min(producto.stock, q+1))}
                      disabled={quantity >= producto.stock}
                      className="px-3 py-2 rounded-lg bg-neutral-800 border border-neutral-700 text-neutral-200"
                    >+</button>
                  </div>

                  {Array.isArray(producto.metodosEntrega) && producto.metodosEntrega.length > 0 && (
                    <select
                      value={selectedDelivery ?? ''}
                      onChange={(e) => setSelectedDelivery(e.target.value || null)}
                      className="bg-neutral-800 border border-neutral-700 text-neutral-200 rounded-lg px-3 py-2"
                    >
                      <option value="">Seleccionar método de entrega</option>
                      {producto.metodosEntrega.map((m, i) => (
                        <option key={i} value={m}>{m}</option>
                      ))}
                    </select>
                  )}

                  {Array.isArray(producto.purchaseUnits) && producto.purchaseUnits.length > 0 && (
                    <div className="flex items-center gap-2">
                      <div className="text-sm text-neutral-400 mr-2">Unidad de compra:</div>
                      {producto.purchaseUnits.map((u, i) => (
                        <button
                          key={i}
                          onClick={() => setSelectedUnit(prev => prev === String(u) ? null : String(u))}
                          className={`text-sm px-3 py-1 rounded-full border ${selectedUnit === String(u) ? 'bg-green-600 text-white border-green-600' : 'bg-neutral-800 text-neutral-300 border-neutral-700 hover:border-green-600'}`}>
                          {selectedUnit === String(u) ? '✓ ' : ''}{u}
                        </button>
                      ))}
                    </div>
                  )}

                  <button
                    onClick={() => {
                      if (!producto) return;
                      if (producto.stock <= 0) return;
                      cart.addItem({
                        id: producto.id,
                        name: producto.name,
                        price: producto.price,
                        stock: producto.stock,
                        unit: producto.unit,
                        purchaseUnit: selectedUnit ?? producto.unit,
                        campesinoId: producto.agricultorId || producto.agricultor?.id || "desconocido",
                        campesinoName: producto.agricultor?.user?.nombre || "desconocido",
                        imageUrl: producto.imageUrl || "",
                        metodosEntrega: Array.isArray(producto.metodosEntrega) ? producto.metodosEntrega : null,
                        deliveryMethod: selectedDelivery || undefined,
                      }, quantity)
                    }}
                    disabled={producto.stock <= 0}
                    className={`inline-flex items-center justify-center gap-2 font-semibold px-4 py-2 rounded-xl shadow-sm ${
                      producto.stock <= 0
                        ? "bg-neutral-700 text-neutral-400 cursor-not-allowed"
                        : "bg-green-600 hover:bg-green-700 text-white"
                    }`}
                  >
                    <ShoppingCart className="w-4 h-4" />
                    {producto.stock <= 0 ? "Sin stock" : "Agregar al carrito"}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Tabs de detalle */}
        <div className="mt-6 bg-neutral-800 border border-neutral-700 rounded-2xl p-4 md:p-6">
          <Tabs producto={producto} />
        </div>
      </div>
    </div>
  );
}

function Tabs({ producto }: { producto: ProductoDetalle }) {
  const [tab, setTab] = useState<'car'|'desc'>('car');
  const caracteristicas: Array<{label: string; value: string | number | null | undefined}> = [
    { label: 'Tipo de producto', value: producto.category?.name },
    { label: 'Unidad', value: producto.unit },
    { label: 'Tipo de cultivo', value: producto.tipoCultivo },
    { label: 'Peso aproximado', value: producto.pesoAproximado ? `${producto.pesoAproximado}` : null },
    { label: 'Certificaciones', value: Array.isArray(producto.certificaciones) ? producto.certificaciones.join(', ') : (typeof producto.certificaciones === 'string' ? producto.certificaciones : null) },
  ];
  return (
    <div>
      <div className="flex gap-4 border-b border-neutral-700 mb-4">
        <button onClick={() => setTab('car')} className={`pb-2 text-sm ${tab==='car' ? 'text-white border-b-2 border-green-600' : 'text-neutral-400 hover:text-white'}`}>Características</button>
        <button onClick={() => setTab('desc')} className={`pb-2 text-sm ${tab==='desc' ? 'text-white border-b-2 border-green-600' : 'text-neutral-400 hover:text-white'}`}>Descripción</button>
      </div>
      {tab === 'car' ? (
        <div className="divide-y divide-neutral-800">
          {caracteristicas.filter(c=>c.value).map((c, i) => (
            <div key={i} className="flex items-center justify-between py-3">
              <div className="text-neutral-400 text-sm">{c.label}</div>
              <div className="text-neutral-100 text-sm font-medium ml-4">{String(c.value)}</div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-neutral-300 text-sm leading-relaxed whitespace-pre-wrap">
          {producto.description || 'Sin descripción'}
        </div>
      )}
    </div>
  );
}
