"use client";
import { useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import { X, MapPin, User, ShoppingCart } from "lucide-react";

export interface ProductoDetalleData {
  id: string;
  nombre: string;
  descripcion: string;
  precio: number;
  unidad: string;
  categoria: string;
  agricultor: string;
  agricultorId?: string;
  ubicacion: string;
  imagen?: string;
  stock: number;
  metodosEntrega?: string | string[] | null;
}

interface PreparacionData {
  acciones: string[];
  madurez: string;
  tamano: string;
  notas: string;
}

interface Props {
  open: boolean;
  producto: ProductoDetalleData | null;
  onClose: () => void;
  onConfirm: (method: string, quantity: number, preparation: PreparacionData) => void;
}

export default function ProductoDetalleModal({ open, producto, onClose, onConfirm }: Props) {
  const { data: session } = useSession();
  const [quantity, setQuantity] = useState(1);
  const methods = useMemo(() => {
    if (!producto?.metodosEntrega) return ["Recogida en finca", "Entrega local"];
    if (Array.isArray(producto.metodosEntrega)) return producto.metodosEntrega as string[];
    try {
      const parsed = JSON.parse(producto.metodosEntrega as string);
      if (Array.isArray(parsed) && parsed.length) return parsed;
      if (typeof parsed === "object") return Object.values(parsed);
      return ["Recogida en finca", "Entrega local"];
    } catch (_) {
      return ["Recogida en finca", "Entrega local"];
    }
  }, [producto]);

  const [selectedMethod, setSelectedMethod] = useState<string>(methods[0] || "Recogida en finca");
  const accionesDisponibles = ["Sin preparación", "Lavado", "Empacado", "Cortado"];
  const madurezDisponibles = ["Verde", "Maduro", "Al punto"];
  const tamanoDisponibles = ["Pequeño", "Mediano", "Grande"];
  const [acciones, setAcciones] = useState<string[]>(["Sin preparación"]);
  const [madurez, setMadurez] = useState<string>(madurezDisponibles[1]);
  const [tamano, setTamano] = useState<string>(tamanoDisponibles[1]);
  const [notas, setNotas] = useState<string>("");

  useEffect(() => {
    if (producto) {
      setQuantity(1);
      setSelectedMethod(methods[0] || "Recogida en finca");
      setAcciones(["Sin preparación"]);
      setMadurez(madurezDisponibles[1]);
      setTamano(tamanoDisponibles[1]);
      setNotas("");
    }
  }, [producto, methods]);

  if (!open || !producto) return null;

  const esPropietario = !!(session?.user?.role === 'CAMPESINO' && session?.user?.id && producto.agricultorId && String(session.user.id) === String(producto.agricultorId));

  const formatearPrecio = (precio: number) => new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", minimumFractionDigits: 0 }).format(precio);

  const inc = () => { if (!esPropietario) setQuantity(q => Math.min(q + 1, producto.stock)); };
  const dec = () => { if (!esPropietario) setQuantity(q => Math.max(1, q - 1)); };

  return (
    <div className="fixed inset-0 z-[70]">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="absolute inset-x-0 top-0 flex justify-center p-4 md:p-6">
        <div className="w-full max-w-5xl bg-neutral-800 text-white rounded-2xl border border-neutral-700 shadow-2xl overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-700">
            <h3 className="text-lg font-semibold">Detalle del producto</h3>
            <button onClick={onClose} className="p-2 rounded-md hover:bg-neutral-700"><X className="w-5 h-5" /></button>
          </div>

          <div className="p-4 md:p-6 grid grid-cols-1 md:grid-cols-12 gap-6">
            <div className="md:col-span-5">
              <div className="bg-neutral-800 border border-neutral-700 rounded-xl overflow-hidden">
                {producto.imagen && (producto.imagen.startsWith("http") || producto.imagen.startsWith("/")) ? (
                  <img src={producto.imagen} alt={producto.nombre} className="w-full h-48 md:h-64 object-cover" />
                ) : (
                  <div className="w-full h-48 md:h-64 flex items-center justify-center text-6xl text-neutral-300">{producto.imagen || "🌿"}</div>
                )}
              </div>
            </div>

            <div className="md:col-span-7 space-y-4">
              <h4 className="text-2xl font-extrabold tracking-tight">{producto.nombre}</h4>
              <p className="text-neutral-300 text-sm leading-relaxed">{producto.descripcion}</p>

              <div className="flex items-start justify-start gap-6">
                <div>
                  <div className="text-2xl font-extrabold text-green-400">{formatearPrecio(producto.precio)}</div>
                  <div className="text-xs text-neutral-400">por {producto.unidad}</div>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2 text-sm text-neutral-200">
                  <User className="w-4 h-4 text-green-500" />
                  <span className="font-medium">{producto.agricultor}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-neutral-400">
                  <MapPin className="w-4 h-4 text-orange-500" />
                  <span>{producto.ubicacion}</span>
                </div>
              </div>

              <div className="pt-2">
                <label className="text-sm font-medium text-neutral-200">Forma de pedido</label>
                <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                  {methods.map((m) => (
                    <button key={m} onClick={() => setSelectedMethod(m)}
                      className={`px-3 py-2 rounded-lg border text-sm text-left ${selectedMethod === m ? 'bg-green-600 text-white border-green-600' : 'bg-neutral-800 text-neutral-200 border-neutral-700 hover:bg-neutral-700'}`}
                    >{m}</button>
                  ))}
                </div>
              </div>

              <div className="pt-2">
                <label className="text-sm font-medium text-neutral-200">Preparación</label>
                <div className="mt-2">
                  <span className="text-xs text-neutral-400">Acciones</span>
                  <div className="mt-1 flex flex-wrap gap-2">
                    {accionesDisponibles.map(a => {
                      const active = acciones.includes(a);
                      return (
                        <button key={a}
                          onClick={() => {
                            setAcciones(prev => {
                              if (a === "Sin preparación") return ["Sin preparación"];
                              const base = prev.filter(x => x !== "Sin preparación");
                              if (base.includes(a)) return base.filter(x => x !== a);
                              return [...base, a];
                            });
                          }}
                          className={`px-3 py-1.5 rounded-lg border text-xs ${active ? 'bg-green-600 text-white border-green-600' : 'bg-neutral-800 text-neutral-200 border-neutral-700 hover:bg-neutral-700'}`}
                        >{a}</button>
                      );
                    })}
                  </div>
                </div>

                <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <span className="text-xs text-neutral-400">Madurez</span>
                    <div className="mt-1 flex flex-wrap gap-2">
                      {madurezDisponibles.map(m => (
                        <button key={m} onClick={() => setMadurez(m)}
                          className={`px-3 py-1.5 rounded-lg border text-xs ${madurez === m ? 'bg-green-600 text-white border-green-600' : 'bg-neutral-800 text-neutral-200 border-neutral-700 hover:bg-neutral-700'}`}
                        >{m}</button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <span className="text-xs text-neutral-400">Tamaño</span>
                    <div className="mt-1 flex flex-wrap gap-2">
                      {tamanoDisponibles.map(t => (
                        <button key={t} onClick={() => setTamano(t)}
                          className={`px-3 py-1.5 rounded-lg border text-xs ${tamano === t ? 'bg-green-600 text-white border-green-600' : 'bg-neutral-800 text-neutral-200 border-neutral-700 hover:bg-neutral-700'}`}
                        >{t}</button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-3">
                  <span className="text-xs text-neutral-400">Notas para el agricultor (opcional)</span>
                  <textarea value={notas} onChange={e => setNotas(e.target.value)}
                    placeholder="Ej: empaquetar en bolsas pequeñas, evitar piezas muy maduras, etc."
                    className="mt-1 w-full px-3 py-2 rounded-lg bg-neutral-800 text-white border border-neutral-700 text-sm placeholder-neutral-500"
                    rows={3}
                  />
                </div>
              </div>

              <div className="pt-2">
                <label className="text-sm font-medium text-neutral-200">Cantidad</label>
                <div className="mt-2 inline-flex items-center gap-2 bg-neutral-800 border border-neutral-700 rounded-lg p-2">
                  <button onClick={dec} disabled={esPropietario} className={`w-8 h-8 rounded-md ${esPropietario ? 'bg-neutral-600 text-neutral-400 cursor-not-allowed' : 'bg-neutral-700 text-white'}`}>-</button>
                  <div className="min-w-[48px] text-center font-semibold">{quantity}</div>
                  <button onClick={inc} disabled={esPropietario} className={`w-8 h-8 rounded-md ${esPropietario ? 'bg-neutral-600 text-neutral-400 cursor-not-allowed' : 'bg-neutral-700 text-white'}`}>+</button>
                </div>
              </div>

              {esPropietario && (
                <div className="mt-2 p-3 rounded-lg border border-amber-600 bg-amber-900/20 text-amber-300" role="alert">
                  Eres el agricultor de este producto. No puedes comprar tu propio producto.
                </div>
              )}

              <div className="pt-3">
                <button
                  onClick={() => { if (!esPropietario) onConfirm(selectedMethod, quantity, { acciones, madurez, tamano, notas }); }}
                  disabled={esPropietario}
                  className={`w-full inline-flex items-center justify-center gap-2 font-semibold px-4 py-2 rounded-xl shadow-sm ${esPropietario ? 'bg-neutral-700 text-neutral-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700 text-white'}`}
                >
                  <ShoppingCart className="w-4 h-4" /> Agregar al carrito
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
