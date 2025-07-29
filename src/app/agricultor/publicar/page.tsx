"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useUserId } from "@/lib/useUserId";
import { useEffect } from "react";
import { MapPin, DollarSign, Package, FileText, Camera, Leaf, Save, Trash2, Send, Info, X } from "lucide-react";

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

export default function PublicarPage() {
  const userId = useUserId();
  // Estados para categorías y subcategorías
  const [categorias, setCategorias] = useState<{ id: string; name: string }[]>([]);
  const [subcategorias, setSubcategorias] = useState<{ id: string; name: string; categoryId: string }[]>([]);

  // Cargar categorías desde la API
  useEffect(() => {
    fetch('/api/categorias')
      .then(res => res.json())
      .then(data => setCategorias(data))
      .catch(() => setCategorias([]));
  }, []);

  // Cargar subcategorías solo cuando hay categoría seleccionada
  // Declarar useState y formData antes de este useEffect para evitar el error
  // (Mover este useEffect después de la declaración de formData)


  type FormDataType = {
    name: string;
    description: string;
    price: string;
    unit: string;
    category: string;
    subcategory: string;
    stock: string;
    municipio: string;
    vereda: string;
    imagenes: File[];
    tipoCultivo: string;
    fechaCosecha: string;
    tiempoEntrega: string;
    imageUrl: string;
    stockMinimo: string;
    pesoAproximado: string;
    dimensiones: string;
    condicionesAlmacenamiento: string;
    certificaciones: string[];
    metodosEntrega: string[];
    horariosDisponibles: string;
    notasEspeciales: string;
    reservedStock: string;
  };

  const [formData, setFormData] = useState<FormDataType>({
    name: '',
    description: '',
    price: '',
    unit: 'kg',
    category: '',
    subcategory: '',
    stock: '',
    municipio: '',
    vereda: '',
    imagenes: [],
    tipoCultivo: 'convencional',
    fechaCosecha: '',
    tiempoEntrega: '',
    imageUrl: '',
    stockMinimo: '',
    pesoAproximado: '',
    dimensiones: '',
    condicionesAlmacenamiento: '',
    certificaciones: [],
    metodosEntrega: ['domicilio'],
    horariosDisponibles: '',
    notasEspeciales: '',
    reservedStock: '',
  });

  // Debug avanzado: guardar info de la respuesta de subcategorías
  const [subcatDebug, setSubcatDebug] = useState<{status?: number, raw?: string, parsed?: any}>({});
  useEffect(() => {
    if (!formData.category) {
      setSubcategorias([]);
      setSubcatDebug({});
      return;
    }
    fetch(`/api/subcategorias?categoriaId=${formData.category}`)
      .then(async res => {
        const raw = await res.text();
        let parsed;
        try {
          parsed = JSON.parse(raw);
        } catch {
          parsed = null;
        }
        setSubcatDebug({ status: res.status, raw, parsed });
        setSubcategorias(Array.isArray(parsed) ? parsed : []);
      })
      .catch(() => {
        setSubcategorias([]);
        setSubcatDebug({ status: undefined, raw: 'error', parsed: null });
      });
  }, [formData.category]);
  const [previewImages, setPreviewImages] = useState<string[]>([]);
  const [showPreview, setShowPreview] = useState<boolean>(false);
  const [showConfirm, setShowConfirm] = useState<boolean>(false);
  const router = useRouter();

  // Handlers tipados
  const handleInputChange = (field: keyof FormDataType, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const newFiles: File[] = [];
    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        // Siempre agrega el resultado como string
        setPreviewImages(prev => [
          ...prev,
          typeof reader.result === 'string' ? reader.result : ''
        ]);
      };
      reader.readAsDataURL(file);
      newFiles.push(file);
    });
    setFormData(prev => ({ ...prev, imagenes: [...prev.imagenes, ...newFiles] }));
  };

  const removeImage = (idx: number) => {
    setPreviewImages(prev => prev.filter((_, i) => i !== idx));
    setFormData(prev => ({ ...prev, imagenes: prev.imagenes.filter((_, i) => i !== idx) }));
  };

  const toggleCertificacion = (cert: string) => {
    setFormData(prev => {
      if (!Array.isArray(prev.certificaciones)) return { ...prev, certificaciones: [cert] };
      const exists = prev.certificaciones.includes(cert);
      return {
        ...prev,
        certificaciones: exists
          ? prev.certificaciones.filter(c => c !== cert)
          : [...prev.certificaciones, cert]
      };
    });
  };

  const toggleMetodoEntrega = (metodo: string) => {
    setFormData(prev => {
      if (!Array.isArray(prev.metodosEntrega)) return { ...prev, metodosEntrega: [metodo] };
      const exists = prev.metodosEntrega.includes(metodo);
      return {
        ...prev,
        metodosEntrega: exists
          ? prev.metodosEntrega.filter(m => m !== metodo)
          : [...prev.metodosEntrega, metodo]
      };
    });
  };

  // Handler para submit con POST real
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) {
      alert("Debes iniciar sesión para publicar un producto.");
      return;
    }
    // Validación mínima
    if (!formData.name || !formData.price || !formData.category || !formData.subcategory) {
      alert("Por favor completa todos los campos obligatorios.");
      return;
    }

    // Determinar la imagen principal a enviar
    let imageUrlToSend = formData.imageUrl;
    // Si no hay URL y hay imagen subida, sube la imagen base64 a /api/upload
    if (!imageUrlToSend && previewImages.length > 0) {
      const base64 = previewImages[0];
      // Validar base64 mínimo
      if (!base64 || !base64.startsWith('data:image/')) {
        alert('La imagen seleccionada no es válida. Intenta seleccionar otra.');
        console.error('Base64 inválido:', base64);
        return;
      }
      // Log para depuración
      console.log('Enviando base64 a /api/upload:', base64.substring(0, 100) + '...');
      try {
        const uploadRes = await fetch("/api/upload", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ image: base64 }),
        });
        if (uploadRes.ok) {
          const uploadData = await uploadRes.json();
          imageUrlToSend = uploadData.url || uploadData.imageUrl || '';
        } else {
          alert("Error al subir la imagen. Intenta de nuevo.");
          return;
        }
      } catch (err) {
        alert("Error de red al subir la imagen");
        return;
      }
    }

    const payload = {
      name: formData.name,
      description: formData.description,
      price: Number(formData.price),
      unit: formData.unit,
      categoryId: formData.category,
      subcategoryId: formData.subcategory,
      stock: Number(formData.stock) || 0,
      stockMinimo: Number(formData.stockMinimo) || 0,
      reservedStock: Number(formData.reservedStock) || 0,
      imageUrl: imageUrlToSend,
      farmerId: userId,
      fechaCosecha: formData.fechaCosecha,
      tiempoEntrega: formData.tiempoEntrega ? Number(formData.tiempoEntrega) : 1,
      pesoAproximado: formData.pesoAproximado,
      dimensiones: formData.dimensiones,
      condicionesAlmacenamiento: formData.condicionesAlmacenamiento,
      certificaciones: formData.certificaciones,
      metodosEntrega: formData.metodosEntrega,
      horariosDisponibles: formData.horariosDisponibles,
      notasEspeciales: formData.notasEspeciales,
      municipio: formData.municipio,
      vereda: formData.vereda,
      tipoCultivo: formData.tipoCultivo,
    };
    try {
      const res = await fetch("/api/productos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const error = await res.json();
        alert(error?.error || "Error al publicar el producto");
        return;
      }
      setShowConfirm(true);
      setTimeout(() => {
        router.push("/agricultor/mis-productos");
      }, 1800);
    } catch (err) {
      alert("Error de red al publicar el producto");
    }
  };

  // Main UI
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header: title left, preview button right */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-green-900">Publicar Producto</h1>
          <button
            type="button"
            className="px-5 py-2 border-2 border-blue-500 text-blue-600 rounded-xl font-semibold hover:bg-blue-50 hover:text-blue-700 transition-all"
            onClick={() => setShowPreview(true)}
          >
            Previsualizar
          </button>
        </div>
        <form className="space-y-10 bg-white p-8 rounded-2xl shadow-xl border border-green-300" onSubmit={handleSubmit}>
          {/* Bloque datos principales */}
          <fieldset className="border border-green-200 rounded-2xl mb-8">
            <legend className="px-4 py-2 text-lg font-bold text-green-700 flex items-center gap-2"><Package className="w-6 h-6" /> Datos principales</legend>
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <label className="block font-semibold mb-2 text-gray-800">Nombre del producto *</label>
                <input type="text" value={formData.name} onChange={e => handleInputChange('name', e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none bg-white text-gray-900" placeholder="Ej: Banano" required />
              </div>
              <div>
                <label className="block font-semibold mb-2 text-gray-800">Unidad de medida *</label>
                <select value={formData.unit} onChange={e => handleInputChange('unit', e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded focus:border-green-500 focus:outline-none bg-white text-gray-900">
                  <option value="">Seleccionar unidad</option>
                  {unidades.map(unidad => (
                    <option key={unidad.value} value={unidad.value}>{unidad.icon} {unidad.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block font-semibold mb-2 text-gray-800">Categoría *</label>
                <select value={formData.category} onChange={e => handleInputChange('category', e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded focus:border-green-500 focus:outline-none bg-white text-gray-900" required>
                  <option value="">Seleccionar categoría</option>
                  {categorias.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block font-semibold mb-2 text-gray-800">Subcategoría *</label>
                <select value={formData.subcategory} onChange={e => handleInputChange('subcategory', e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded focus:border-green-500 focus:outline-none bg-white text-gray-900" required disabled={!formData.category}>
                  <option value="">Seleccionar subcategoría</option>
                  {subcategorias.map(sub => (
                    <option key={sub.id} value={sub.id}>{sub.name}</option>
                  ))}
                </select>
              </div>
            </div>
          </fieldset>

          {/* Bloque descripción */}
          <fieldset className="border border-green-200 rounded-2xl mb-8">
            <legend className="px-4 py-2 text-lg font-bold text-green-700 flex items-center gap-2"><FileText className="w-6 h-6" /> Descripción</legend>
            <div className="p-6">
              <label className="block font-semibold mb-2 text-gray-800">Descripción del producto *</label>
              <textarea value={formData.description} onChange={e => handleInputChange('description', e.target.value)} rows={3} className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none bg-white text-gray-900" placeholder="Describe tu producto, cómo fue cultivado, características especiales..." required />
            </div>
          </fieldset>

          {/* Bloque precio y stock */}
          <fieldset className="border border-green-200 rounded-2xl mb-8">
            <legend className="px-4 py-2 text-lg font-bold text-green-700 flex items-center gap-2"><DollarSign className="w-6 h-6" /> Precio y Stock</legend>
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <label className="block font-semibold mb-2 text-gray-800">Precio *</label>
                  <input type="number" value={formData.price} onChange={e => handleInputChange('price', e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none bg-white text-gray-900" placeholder="Ej: 2500" min="0" required />
                </div>
                <div>
                  <label className="block font-semibold mb-2 text-gray-800">Stock disponible *</label>
                  <input type="number" value={formData.stock} onChange={e => handleInputChange('stock', e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none bg-white text-gray-900" placeholder="Ej: 100" min="0" required />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <label className="block font-semibold mb-2 text-gray-800">Stock mínimo</label>
                  <input type="number" value={formData.stockMinimo} onChange={e => handleInputChange('stockMinimo', e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none bg-white text-gray-900" placeholder="Ej: 10" min="0" />
                </div>
                <div>
                  <label className="block font-semibold mb-2 text-gray-800">Stock reservado</label>
                  <input type="number" value={formData.reservedStock} onChange={e => handleInputChange('reservedStock', e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none bg-white text-gray-900" placeholder="Ej: 5" min="0" />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <label className="block font-semibold mb-2 text-gray-800">Dimensiones</label>
                  <input type="text" value={formData.dimensiones} onChange={e => handleInputChange('dimensiones', e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none bg-white text-gray-900" placeholder="Ej: 30x20x15 cm" />
                </div>
              </div>
            </div>
          </fieldset>
          {/* Modal de Confirmación */}
          {showConfirm && (
            <div className="fixed inset-0 bg-gray-200/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-all">
              <div className="bg-white rounded-xl max-w-xs w-full shadow-xl flex flex-col items-center p-8">
                <div className="mb-4">
                  <svg className="w-16 h-16 text-green-500 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor"><circle cx="12" cy="12" r="10" strokeWidth="2" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4" /></svg>
                </div>
                <h2 className="text-xl font-bold text-green-700 mb-2 text-center">¡Producto publicado!</h2>
                <p className="text-gray-700 text-center mb-2">Tu producto ha sido publicado exitosamente.</p>
                <p className="text-xs text-gray-500 text-center">Redirigiendo a Mis Productos...</p>
              </div>
            </div>
          )}

          {/* Bloque calidad y certificaciones */}
          <fieldset className="border border-green-200 rounded-2xl mb-8">
            <legend className="px-4 py-2 text-lg font-bold text-green-700 flex items-center gap-2"><Leaf className="w-6 h-6" /> Calidad y Certificaciones</legend>
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <label className="block font-semibold mb-2 text-gray-800">Tipo de cultivo</label>
                <select value={formData.tipoCultivo} onChange={e => handleInputChange('tipoCultivo', e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded focus:border-green-500 focus:outline-none bg-white text-gray-900">
                  <option value="convencional">Convencional</option>
                  <option value="organico">Orgánico</option>
                </select>
              </div>
              <div>
                <label className="block font-semibold mb-2 text-gray-800">Condiciones de almacenamiento</label>
                <input type="text" value={formData.condicionesAlmacenamiento} onChange={e => handleInputChange('condicionesAlmacenamiento', e.target.value)} className="w-full border border-green-200 rounded-lg px-4 py-2 bg-white text-gray-900 placeholder-gray-400 focus:border-green-400 transition-all" placeholder="Lugar fresco y seco, temp. 15-20°C" />
              </div>
            </div>
            <div className="mt-6">
              <div className="pt-6 pb-2 px-4">
                <label className="block font-semibold mb-4 text-gray-800 mt-2">Certificaciones <span className='font-normal text-gray-500'>(selecciona las que apliquen)</span></label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 p-4 rounded-xl bg-green-50 border border-green-100">
                {certificacionesDisponibles.map(cert => (
                  <button
                    type="button"
                    key={cert}
                    className={`flex items-center justify-center w-full min-h-[2.8rem] px-4 py-2 rounded-lg border text-xs font-medium shadow-sm focus:outline-none focus:ring-2 focus:ring-green-400
                      ${formData.certificaciones.includes(cert)
                        ? 'bg-gradient-to-br from-green-100 to-green-50 border-green-400 text-green-800 ring-2 ring-green-300 shadow-md'
                        : 'bg-white border-green-100 text-gray-600 hover:bg-green-50 hover:text-green-700'}
                    `}
                    onClick={() => toggleCertificacion(cert)}
                    tabIndex={0}
                    style={{ margin: '3px', transition: 'none', transform: 'none' }}
                  >
                    <span className="truncate text-center w-full">{cert}</span>
                    {formData.certificaciones.includes(cert) && (
                      <span className="ml-2 text-green-500 font-bold">✓</span>
                    )}
                  </button>
                ))}
                </div>
              </div>
            </div>
          </fieldset>

          {/* Bloque entrega y ubicación */}
          <fieldset className="border border-green-200 rounded-2xl mb-8">
            <legend className="px-4 py-2 text-lg font-bold text-green-700 flex items-center gap-2"><MapPin className="w-6 h-6" /> Entrega y Ubicación</legend>
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="md:col-span-2 pt-6 pb-2 px-4">
                <label className="block text-base font-medium text-green-600 mb-5">Métodos de entrega disponibles <span className="text-red-500">*</span></label>
                <div className="flex flex-nowrap gap-3 overflow-x-auto">
                  {metodosEntregaDisponibles.map(metodo => {
                    const selected = formData.metodosEntrega.includes(metodo.value);
                    return (
                      <button
                        type="button"
                        key={metodo.value}
                        className={`flex flex-col items-center justify-center min-w-[150px] h-[80px] px-3 py-2 rounded-xl border-2 shadow-sm text-xs font-medium transition-all select-none
                          ${selected
                            ? 'bg-white border-green-400 text-green-700 ring-2 ring-green-300 shadow-md'
                            : 'bg-white border-gray-300 text-gray-700 hover:border-green-300 hover:text-green-700'}
                        `}
                        onClick={() => toggleMetodoEntrega(metodo.value)}
                        tabIndex={0}
                        style={{ margin: '2px' }}
                        disabled={!selected && formData.metodosEntrega.length > 0}
                      >
                        <span className={`text-xl mb-1 ${selected ? '' : 'opacity-60'}`}>{metodo.icon}</span>
                        <span className={`text-center w-full font-semibold break-words whitespace-normal leading-tight ${selected ? 'text-green-700' : 'text-gray-700'}`}>{metodo.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
              <div>
                <label className="block font-semibold mb-2 text-gray-800">Horarios disponibles</label>
                <input type="text" value={formData.horariosDisponibles} onChange={e => handleInputChange('horariosDisponibles', e.target.value)} className="w-full border border-green-200 rounded-lg px-4 py-2 bg-white text-gray-900 focus:border-green-400 transition-all" />
              </div>
              <div>
                <label className="block font-semibold mb-2 text-gray-800">Municipio *</label>
                <input type="text" value={formData.municipio} onChange={e => handleInputChange('municipio', e.target.value)} className="w-full border border-green-200 rounded-lg px-4 py-2 bg-white text-gray-900 placeholder-gray-400 focus:border-green-400 transition-all" placeholder="Ej: Medellín" />
              </div>
              <div>
                <label className="block font-semibold mb-2 text-gray-800">Vereda *</label>
                <input type="text" value={formData.vereda} onChange={e => handleInputChange('vereda', e.target.value)} className="w-full border border-green-200 rounded-lg px-4 py-2 bg-white text-gray-900 placeholder-gray-400 focus:border-green-400 transition-all" placeholder="Ej: Santa Elena" />
              </div>
            </div>
          </fieldset>

          {/* Bloque información adicional */}
          <fieldset className="border border-green-200 rounded-2xl mb-8">
            <legend className="px-4 py-2 text-lg font-bold text-green-700 flex items-center gap-2"><FileText className="w-6 h-6" /> Información Adicional</legend>
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <label className="block font-semibold mb-2 text-gray-800">Fecha de cosecha *</label>
                <input type="date" value={formData.fechaCosecha} onChange={e => handleInputChange('fechaCosecha', e.target.value)} className="w-full border border-green-200 rounded-lg px-4 py-2 bg-white text-gray-900 focus:border-green-400 transition-all" />
              </div>
              <div>
                <label className="block font-semibold mb-2 text-gray-800">Tiempo de entrega (días)</label>
                <input type="number" value={formData.tiempoEntrega} onChange={e => handleInputChange('tiempoEntrega', e.target.value)} className="w-full border border-green-200 rounded-lg px-4 py-2 bg-white text-gray-900 focus:border-green-400 transition-all" />
              </div>
              <div className="md:col-span-2">
                <label className="block font-semibold mb-2 text-gray-800">Notas especiales</label>
                <textarea value={formData.notasEspeciales} onChange={e => handleInputChange('notasEspeciales', e.target.value)} rows={3} className="w-full border border-green-200 rounded-lg px-4 py-2 bg-white text-gray-900 placeholder-gray-400 focus:border-green-400 transition-all" placeholder="Instrucciones especiales de manejo, recomendaciones de uso, etc." />
              </div>
            </div>
          </fieldset>

          {/* Bloque galería de imágenes */}
          <fieldset className="border border-green-200 rounded-2xl mb-8">
            <legend className="px-4 py-2 text-lg font-bold text-green-700 flex items-center gap-2"><Camera className="w-6 h-6" /> Galería de Imágenes</legend>
            <div className="p-6">
              <label htmlFor="imagenes-upload" className="block w-full cursor-pointer border-2 border-dashed border-green-300 rounded-xl py-8 flex flex-col items-center justify-center text-center text-green-700 bg-green-50 hover:bg-green-100 transition mb-2">
                <Camera className="w-10 h-10 mb-2 text-green-400" />
                <span className="font-semibold">Haz click o arrastra imágenes aquí</span>
                <span className="text-xs text-gray-500">Formatos permitidos: JPG, PNG, WEBP, etc.</span>
                <input id="imagenes-upload" type="file" accept="image/*" multiple onChange={handleImageUpload} className="hidden" />
              </label>
              <div className="flex flex-wrap gap-3 mt-2">
                {previewImages.map((img, idx) => (
                  <div key={idx} className="relative w-24 h-24">
                    <img src={img} alt={`Preview ${idx + 1}`} className="object-cover w-full h-full rounded-xl border-2 border-green-300" />
                    <button type="button" className="absolute top-1 right-1 bg-white rounded-full p-1 shadow" onClick={() => removeImage(idx)}><Trash2 className="w-4 h-4 text-red-500" /></button>
                  </div>
                ))}
              </div>
              <div className="mt-2">
                <label className="block font-semibold mb-1 text-gray-800">O puedes proporcionar una URL de imagen</label>
                <input type="text" className="w-full border border-green-200 rounded-lg px-4 py-2 bg-white text-gray-900 placeholder-gray-400 focus:border-green-400 transition-all" value={formData.imageUrl} onChange={e => handleInputChange('imageUrl', e.target.value)} placeholder="https://..." />
              </div>
            </div>
          </fieldset>

          {/* Botones de acción */}
          <div className="flex flex-col md:flex-row gap-4 mb-8">
            <button type="button" className="flex-1 flex items-center justify-center px-6 py-4 border-2 border-red-300 text-red-600 rounded-xl hover:border-red-500 hover:bg-red-50 transition font-medium">
              <Trash2 className="w-5 h-5 mr-2" />
              Limpiar Todo
            </button>
            <button type="submit" className="flex-1 flex items-center justify-center px-6 py-4 border-2 border-green-500 text-green-700 rounded-xl hover:border-green-600 hover:bg-green-50 transition font-medium">
              <Send className="w-5 h-5 mr-2" />
              Publicar Producto
            </button>
          </div>

          {/* Modal de Previsualización */}
          {showPreview && (
            <div className="fixed inset-0 bg-gray-200/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-all">
              <div className="bg-white rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto scrollbar-hide">
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                  <h3 className="text-xl font-semibold text-gray-900">Vista Previa del Producto</h3>
                  <button
                    onClick={() => setShowPreview(false)}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
                <div className="p-6 flex flex-col items-center">
                  {/* Card extendida con todos los datos del formulario */}
                  <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden w-full">
                    {/* Imagen del producto */}
                    <div className="h-48 bg-gray-200 relative">
                      {previewImages[0] ? (
                        <img
                          src={previewImages[0]}
                          alt={formData.name || 'Producto'}
                          className="w-full h-full object-cover"
                          onError={e => { e.currentTarget.src = '/placeholder-product.jpg'; }}
                        />
                      ) : formData.imageUrl ? (
                        <img
                          src={formData.imageUrl}
                          alt={formData.name || 'Producto'}
                          className="w-full h-full object-cover"
                          onError={e => { e.currentTarget.src = '/placeholder-product.jpg'; }}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          <span className="text-4xl">🥬</span>
                        </div>
                      )}
                    </div>
                    {/* Contenido de la tarjeta */}
                    <div className="p-4">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-1">
                        {formData.name || 'Nombre del producto'}
                      </h3>
                      {/* Etiquetas de categoría y subcategoría debajo del nombre */}
                      <div className="flex flex-wrap gap-2 mb-2">
                        {formData.category && (
                          <span className="bg-green-600 text-white text-xs px-2 py-1 rounded-full">
                            {categorias.find(c => c.id === formData.category)?.name || 'Categoría'}
                          </span>
                        )}
                        {formData.subcategory && (
                          <span className="bg-green-200 text-green-800 text-xs px-2 py-1 rounded-full">
                            {subcategorias.find(s => s.id === formData.subcategory)?.name || 'Subcategoría'}
                          </span>
                        )}
                      </div>
                      <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                        {formData.description || 'Sin descripción.'}
                      </p>
                      {/* Precio y stock */}
                      <div className="flex items-center justify-between mb-3">
                        <div className="text-2xl font-bold text-green-600">
                          {formData.price ? `$${Number(formData.price).toLocaleString()}` : '$0'}
                          <span className="text-sm font-normal text-gray-500">
                            /{unidades.find(u => u.value === formData.unit)?.label.split(' ')[0] || 'unidad'}
                          </span>
                        </div>
                        <div className="text-sm text-gray-500">
                          Stock: {formData.stock || 0}
                        </div>
                      </div>
                      {/* Agricultor (simulado) */}
                      <div className="text-xs text-gray-500 mb-1">
                        Por: Tú (previsualización)
                      </div>
                      {/* Ubicación */}
                      <div className="flex items-center gap-2 text-xs text-gray-500 mb-1">
                        <MapPin className="w-4 h-4" />
                        <span>{formData.municipio || 'Municipio'}</span>
                        {formData.vereda && <span>- {formData.vereda}</span>}
                      </div>
                      {/* Certificaciones */}
                      {formData.certificaciones && formData.certificaciones.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-2">
                          {formData.certificaciones.map(cert => (
                            <span key={cert} className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-medium border border-green-200">{cert}</span>
                          ))}
                        </div>
                      )}
                      {/* Tipo de cultivo, fecha de cosecha, peso, dimensiones */}
                      <div className="grid grid-cols-2 gap-2 text-xs text-gray-600 mb-2">
                        <div><span className="font-semibold">Cultivo:</span> {formData.tipoCultivo || 'N/A'}</div>
                        <div><span className="font-semibold">Cosecha:</span> {formData.fechaCosecha || 'N/A'}</div>
                        <div><span className="font-semibold">Peso:</span> {formData.pesoAproximado || 'N/A'} kg</div>
                        <div><span className="font-semibold">Dimensiones:</span> {formData.dimensiones || 'N/A'}</div>
                      </div>
                      {/* Condiciones de almacenamiento */}
                      {formData.condicionesAlmacenamiento && (
                        <div className="text-xs text-gray-600 mb-2">
                          <span className="font-semibold">Almacenamiento:</span> {formData.condicionesAlmacenamiento}
                        </div>
                      )}
                      {/* Métodos de entrega */}
                      {formData.metodosEntrega && formData.metodosEntrega.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-2">
                          {formData.metodosEntrega.map(metodo => (
                            <span key={metodo} className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs font-medium border border-blue-200">
                              {metodosEntregaDisponibles.find(m => m.value === metodo)?.label || metodo}
                            </span>
                          ))}
                        </div>
                      )}
                      {/* Notas especiales */}
                      {formData.notasEspeciales && (
                        <div className="text-xs text-gray-600 mb-2">
                          <span className="font-semibold">Notas:</span> {formData.notasEspeciales}
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
                <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
                  <button
                    onClick={() => setShowPreview(false)}
                    className="px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors"
                  >
                    Cerrar Vista Previa
                  </button>
                  <button
                    onClick={() => {
                      setShowPreview(false);
                      document.querySelector('button[type="submit"]')?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Listo, Publicar
                  </button>
                </div>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
