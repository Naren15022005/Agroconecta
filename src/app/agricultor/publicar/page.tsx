"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useUserId } from "@/lib/useUserId";
import { useEffect } from "react";
import { MapPin, DollarSign, Package, FileText, Camera, Leaf, Save, Trash2, Send, Info, X } from "lucide-react";

const unidades = [
  { value: 'kg', label: 'Kilogramo (kg)' },
  { value: 'libra', label: 'Libra (lb)' },
  { value: 'gramo', label: 'Gramo (g)' },
  { value: 'bulto', label: 'Bulto' },
  { value: 'caja', label: 'Caja' },
  { value: 'canasta', label: 'Canasta' },
  { value: 'unidad', label: 'Unidad' },
  { value: 'docena', label: 'Docena' },
  { value: 'litro', label: 'Litro (L)' },
  { value: 'galón', label: 'Galón' },
  { value: 'manojo', label: 'Manojo' },
  { value: 'racimo', label: 'Racimo' }
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
  const [agricultorId, setAgricultorId] = useState<string | null>(null);

  // Obtener agricultorId si existe
  useEffect(() => {
    if (userId) {
      fetch(`/api/agricultor/por-user?userId=${userId}`)
        .then(res => res.json())
        .then(data => {
          if (data && data.id) {
            setAgricultorId(data.id);
          } else {
            setAgricultorId(null);
          }
        })
        .catch(() => setAgricultorId(null));
    }
  }, [userId]);
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
    purchaseUnits: string[];
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
    stockMinimo: '10',
    pesoAproximado: '',
    purchaseUnits: [],
    certificaciones: [],
    metodosEntrega: ['domicilio'],
    horariosDisponibles: '',
    notasEspeciales: '',
    reservedStock: '10',
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

  const togglePurchaseUnit = (unit: string) => {
    setFormData(prev => {
      if (!Array.isArray(prev.purchaseUnits)) return { ...prev, purchaseUnits: [unit] };
      const exists = prev.purchaseUnits.includes(unit);
      return {
        ...prev,
        purchaseUnits: exists ? prev.purchaseUnits.filter(u => u !== unit) : [...prev.purchaseUnits, unit]
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
      price: formData.price === '' ? null : Number(formData.price),
      unit: formData.unit,
      categoryId: formData.category,
      subcategoryId: formData.subcategory || null,
      stock: formData.stock === '' ? 0 : Number(formData.stock),
      // Valores fijos: el sistema asigna siempre 10 a stock mínimo y 10 a stock reservado
      stockMinimo: 10,
      reservedStock: 10,
      imageUrl: imageUrlToSend,
      fechaCosecha: formData.fechaCosecha === '' ? null : formData.fechaCosecha,
      tiempoEntrega: formData.tiempoEntrega === '' ? null : formData.tiempoEntrega.toString(),
      pesoAproximado: formData.pesoAproximado === '' ? null : Number(formData.pesoAproximado),
      
      
      certificaciones: formData.certificaciones && formData.certificaciones.length > 0 ? JSON.stringify(formData.certificaciones) : null,
      metodosEntrega: formData.metodosEntrega && formData.metodosEntrega.length > 0 ? JSON.stringify(formData.metodosEntrega) : null,
      purchaseUnits: formData.purchaseUnits && formData.purchaseUnits.length > 0 ? JSON.stringify(formData.purchaseUnits) : null,
      horariosDisponibles: formData.horariosDisponibles === '' ? null : formData.horariosDisponibles,
      notasEspeciales: formData.notasEspeciales === '' ? null : formData.notasEspeciales,
      municipio: formData.municipio === '' ? null : formData.municipio,
      vereda: formData.vereda === '' ? null : formData.vereda,
      tipoCultivo: formData.tipoCultivo === '' ? null : formData.tipoCultivo,
      ...(agricultorId ? { agricultorId } : { farmerId: userId }),
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
    <div className="min-h-screen bg-neutral-900 py-8 text-neutral-100">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header: title left, preview button right */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-neutral-50">Publicar Producto</h1>
          <button
            type="button"
            className="px-4 md:px-5 py-2 rounded-xl font-semibold border border-neutral-700 bg-neutral-800/60 text-neutral-100 hover:bg-neutral-800 hover:border-green-600 transition-colors"
            onClick={() => setShowPreview(true)}
          >
            Previsualizar
          </button>
        </div>
        <form className="space-y-8 bg-neutral-800/60 p-6 md:p-8 rounded-2xl shadow-2xl border border-neutral-700" onSubmit={handleSubmit}>
          {/* Bloque datos principales */}
          <fieldset className="border border-neutral-700 rounded-2xl bg-neutral-900/30">
            <legend className="px-4 py-2 text-base md:text-lg font-bold text-green-400 flex items-center gap-2"><Package className="w-5 h-5" /> Datos principales</legend>
            <div className="p-5 md:p-6 grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
              <div>
                <label className="block text-sm font-semibold mb-2 text-neutral-200">Nombre del producto *</label>
                <input type="text" value={formData.name} onChange={e => handleInputChange('name', e.target.value)} className="w-full px-4 py-2 border border-neutral-700 rounded-lg focus:outline-none focus:border-green-600 focus:ring-1 focus:ring-green-600/40 bg-neutral-900 text-neutral-100 placeholder-neutral-500" placeholder="Ej: Banano" required />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2 text-neutral-200">Unidad de medida *</label>
                <select value={formData.unit} onChange={e => handleInputChange('unit', e.target.value)} className="w-full px-4 py-2 pr-10 border border-neutral-700 rounded-lg focus:border-green-600 focus:outline-none focus:ring-1 focus:ring-green-600/40 bg-neutral-900 text-neutral-100 appearance-none">
                  <option value="" disabled className="text-neutral-400">Seleccionar unidad</option>
                  {unidades.map(unidad => (
                    <option key={unidad.value} value={unidad.value} className="bg-neutral-900 text-neutral-100">{unidad.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2 text-neutral-200">Categoría *</label>
                <select value={formData.category} onChange={e => handleInputChange('category', e.target.value)} className="w-full px-4 py-2 border border-neutral-700 rounded-lg focus:border-green-600 focus:outline-none bg-neutral-900 text-neutral-100" required>
                  <option value="">Seleccionar categoría</option>
                  {categorias.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2 text-neutral-200">Subcategoría *</label>
                <select value={formData.subcategory} onChange={e => handleInputChange('subcategory', e.target.value)} className="w-full px-4 py-2 border border-neutral-700 rounded-lg focus:border-green-600 focus:outline-none bg-neutral-900 text-neutral-100 disabled:opacity-60" required disabled={!formData.category}>
                  <option value="">Seleccionar subcategoría</option>
                  {subcategorias.map(sub => (
                    <option key={sub.id} value={sub.id}>{sub.name}</option>
                  ))}
                </select>
              </div>
            </div>
          </fieldset>

          {/* Bloque descripción */}
          <fieldset className="border border-neutral-700 rounded-2xl bg-neutral-900/30">
            <legend className="px-4 py-2 text-base md:text-lg font-bold text-green-400 flex items-center gap-2"><FileText className="w-5 h-5" /> Descripción</legend>
            <div className="p-5 md:p-6">
              <label className="block text-sm font-semibold mb-2 text-neutral-200">Descripción del producto *</label>
              <textarea value={formData.description} onChange={e => handleInputChange('description', e.target.value)} rows={4} className="w-full px-4 py-2 border border-neutral-700 rounded-lg focus:outline-none focus:border-green-600 focus:ring-1 focus:ring-green-600/40 bg-neutral-900 text-neutral-100 placeholder-neutral-500" placeholder="Describe tu producto, cómo fue cultivado, características especiales..." required />
            </div>
          </fieldset>

          {/* Bloque precio y stock */}
          <fieldset className="border border-neutral-700 rounded-2xl bg-neutral-900/30">
            <legend className="px-4 py-2 text-base md:text-lg font-bold text-green-400 flex items-center gap-2"><DollarSign className="w-5 h-5" /> Precio y Stock</legend>
            <div className="p-5 md:p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                <div>
                  <label className="block text-sm font-semibold mb-2 text-neutral-200">Precio *</label>
                  <input type="number" value={formData.price} onChange={e => handleInputChange('price', e.target.value)} className="w-full px-4 py-2 border border-neutral-700 rounded-lg focus:outline-none focus:border-green-600 focus:ring-1 focus:ring-green-600/40 bg-neutral-900 text-neutral-100 placeholder-neutral-500" placeholder="Ej: 2500" min="0" required />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2 text-neutral-200">Stock disponible *</label>
                  <input type="number" value={formData.stock} onChange={e => handleInputChange('stock', e.target.value)} className="w-full px-4 py-2 border border-neutral-700 rounded-lg focus:outline-none focus:border-green-600 focus:ring-1 focus:ring-green-600/40 bg-neutral-900 text-neutral-100 placeholder-neutral-500" placeholder="Ej: 100" min="0" required />
                </div>
              </div>
              
              
            </div>
          </fieldset>
          {/* Modal de Confirmación */}
          {showConfirm && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
              <div className="bg-neutral-900 border border-neutral-700 rounded-xl max-w-xs w-full shadow-2xl flex flex-col items-center p-8">
                <div className="mb-4">
                  <svg className="w-16 h-16 text-green-500 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor"><circle cx="12" cy="12" r="10" strokeWidth="2" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4" /></svg>
                </div>
                <h2 className="text-xl font-bold text-green-400 mb-2 text-center">¡Producto publicado!</h2>
                <p className="text-neutral-200 text-center mb-2">Tu producto ha sido publicado exitosamente.</p>
                <p className="text-xs text-neutral-400 text-center">Redirigiendo a Mis Productos...</p>
              </div>
            </div>
          )}

          {/* Bloque calidad y certificaciones */}
          <fieldset className="border border-neutral-700 rounded-2xl bg-neutral-900/30">
            <legend className="px-4 py-2 text-base md:text-lg font-bold text-green-400 flex items-center gap-2"><Leaf className="w-5 h-5" /> Calidad y Certificaciones</legend>
            <div className="p-5 md:p-6 grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
              <div>
                <label className="block text-sm font-semibold mb-2 text-neutral-200">Tipo de cultivo</label>
                <select value={formData.tipoCultivo} onChange={e => handleInputChange('tipoCultivo', e.target.value)} className="w-full px-4 py-2 border border-neutral-700 rounded-lg focus:border-green-600 focus:outline-none bg-neutral-900 text-neutral-100">
                  <option value="convencional">Convencional</option>
                  <option value="organico">Orgánico</option>
                </select>
              </div>
              
            </div>
            <div className="mt-6">
              <div className="pt-2 px-5 md:px-6 pb-6">
                <label className="block text-sm font-semibold mb-3 text-neutral-200">Certificaciones <span className='font-normal text-neutral-400'>(selecciona las que apliquen)</span></label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 p-4 rounded-xl bg-neutral-900/50 border border-neutral-700">
                {certificacionesDisponibles.map(cert => (
                  <button
                    type="button"
                    key={cert}
                    className={`flex items-center justify-center w-full min-h-[2.8rem] px-3 py-2 rounded-lg border text-xs font-medium focus:outline-none focus:ring-2 focus:ring-green-600/40
                      ${formData.certificaciones.includes(cert)
                        ? 'bg-green-600/15 border-green-600 text-green-300'
                        : 'bg-neutral-900 border-neutral-700 text-neutral-300 hover:border-green-600 hover:text-green-200'}
                    `}
                    onClick={() => toggleCertificacion(cert)}
                    tabIndex={0}
                    style={{ margin: '3px', transition: 'none', transform: 'none' }}
                  >
                    <span className="truncate text-center w-full">{cert}</span>
                    {formData.certificaciones.includes(cert) && (
                      <span className="ml-2 text-green-400 font-bold">✓</span>
                    )}
                  </button>
                ))}
                </div>
              </div>
            </div>
          </fieldset>

          {/* Bloque entrega y ubicación */}
          <fieldset className="border border-neutral-700 rounded-2xl bg-neutral-900/30">
            <legend className="px-4 py-2 text-base md:text-lg font-bold text-green-400 flex items-center gap-2"><MapPin className="w-5 h-5" /> Entrega y Ubicación</legend>
            <div className="p-5 md:p-6 grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-neutral-200 mb-3">Métodos de entrega disponibles <span className="text-red-400">*</span></label>
                <div className="grid grid-cols-2 md:flex md:flex-nowrap gap-3">
                  {metodosEntregaDisponibles.map(metodo => {
                    const selected = formData.metodosEntrega.includes(metodo.value);
                    return (
                      <button
                        type="button"
                        key={metodo.value}
                        className={`flex flex-col items-center justify-center w-full md:w-[150px] h-[82px] px-3 py-2 rounded-xl border text-xs font-semibold transition-colors select-none
                          ${selected
                            ? 'bg-green-600/15 border-green-600 text-green-200'
                            : 'bg-neutral-900 border-neutral-700 text-neutral-200 hover:border-green-600'}
                        `}
                        onClick={() => toggleMetodoEntrega(metodo.value)}
                        tabIndex={0}
                        disabled={!selected && formData.metodosEntrega.length > 0}
                      >
                        <span className={`text-xl mb-1 ${selected ? '' : 'opacity-70'}`}>{metodo.icon}</span>
                        <span className={`text-center w-full break-words whitespace-normal leading-tight ${selected ? 'text-green-200' : 'text-neutral-200'}`}>{metodo.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2 text-neutral-200">Horarios disponibles</label>
                <input type="text" value={formData.horariosDisponibles} onChange={e => handleInputChange('horariosDisponibles', e.target.value)} className="w-full border border-neutral-700 rounded-lg px-4 py-2 bg-neutral-900 text-neutral-100 placeholder-neutral-500 focus:border-green-600 focus:ring-1 focus:ring-green-600/40 transition" />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2 text-neutral-200">Municipio *</label>
                <input type="text" value={formData.municipio} onChange={e => handleInputChange('municipio', e.target.value)} className="w-full border border-neutral-700 rounded-lg px-4 py-2 bg-neutral-900 text-neutral-100 placeholder-neutral-500 focus:border-green-600 focus:ring-1 focus:ring-green-600/40 transition" placeholder="Ej: Medellín" />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2 text-neutral-200">Vereda *</label>
                <input type="text" value={formData.vereda} onChange={e => handleInputChange('vereda', e.target.value)} className="w-full border border-neutral-700 rounded-lg px-4 py-2 bg-neutral-900 text-neutral-100 placeholder-neutral-500 focus:border-green-600 focus:ring-1 focus:ring-green-600/40 transition" placeholder="Ej: Santa Elena" />
              </div>
            </div>
          </fieldset>

          {/* Bloque información adicional */}
          <fieldset className="border border-neutral-700 rounded-2xl bg-neutral-900/30">
            <legend className="px-4 py-2 text-base md:text-lg font-bold text-green-400 flex items-center gap-2"><FileText className="w-5 h-5" /> Información Adicional</legend>
            <div className="p-5 md:p-6 grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
              <div>
                <label className="block text-sm font-semibold mb-2 text-neutral-200">Fecha de cosecha *</label>
                <input type="date" value={formData.fechaCosecha} onChange={e => handleInputChange('fechaCosecha', e.target.value)} className="w-full border border-neutral-700 rounded-lg px-4 py-2 bg-neutral-900 text-neutral-100 focus:border-green-600 focus:ring-1 focus:ring-green-600/40 transition" />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2 text-neutral-200">Tiempo de entrega (días)</label>
                <input type="number" value={formData.tiempoEntrega} onChange={e => handleInputChange('tiempoEntrega', e.target.value)} className="w-full border border-neutral-700 rounded-lg px-4 py-2 bg-neutral-900 text-neutral-100 focus:border-green-600 focus:ring-1 focus:ring-green-600/40 transition" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold mb-2 text-neutral-200">Notas especiales</label>
                <textarea value={formData.notasEspeciales} onChange={e => handleInputChange('notasEspeciales', e.target.value)} rows={4} className="w-full border border-neutral-700 rounded-lg px-4 py-2 bg-neutral-900 text-neutral-100 placeholder-neutral-500 focus:border-green-600 focus:ring-1 focus:ring-green-600/40 transition" placeholder="Instrucciones especiales de manejo, recomendaciones de uso, etc." />
              </div>
            </div>
          </fieldset>

          {/* Bloque galería de imágenes */}
          <fieldset className="border border-neutral-700 rounded-2xl bg-neutral-900/30">
            <legend className="px-4 py-2 text-base md:text-lg font-bold text-green-400 flex items-center gap-2"><Camera className="w-5 h-5" /> Galería de Imágenes</legend>
            <div className="p-5 md:p-6">
              <label htmlFor="imagenes-upload" className="w-full cursor-pointer border-2 border-dashed border-neutral-700 rounded-xl py-8 flex flex-col items-center justify-center text-center text-neutral-200 bg-neutral-900/60 hover:border-green-600 hover:bg-neutral-900 transition mb-3">
                <Camera className="w-10 h-10 mb-2 text-green-400" />
                <span className="font-semibold">Haz click o arrastra imágenes aquí</span>
                <span className="text-xs text-neutral-400">Formatos permitidos: JPG, PNG, WEBP, etc.</span>
                <input id="imagenes-upload" type="file" accept="image/*" multiple onChange={handleImageUpload} className="hidden" />
              </label>
              <div className="flex flex-wrap gap-3 mt-2">
                {previewImages.map((img, idx) => (
                  <div key={idx} className="relative w-24 h-24">
                    <img src={img} alt={`Preview ${idx + 1}`} className="object-cover w-full h-full rounded-xl border border-neutral-700" />
                    <button type="button" className="absolute top-1 right-1 bg-neutral-900/90 border border-neutral-700 rounded-full p-1 shadow" onClick={() => removeImage(idx)}><Trash2 className="w-4 h-4 text-red-400" /></button>
                  </div>
                ))}
              </div>
              <div className="mt-2">
                <label className="block text-sm font-semibold mb-2 text-neutral-200">O puedes proporcionar una URL de imagen</label>
                <input type="text" className="w-full border border-neutral-700 rounded-lg px-4 py-2 bg-neutral-900 text-neutral-100 placeholder-neutral-500 focus:border-green-600 focus:ring-1 focus:ring-green-600/40 transition" value={formData.imageUrl} onChange={e => handleInputChange('imageUrl', e.target.value)} placeholder="https://..." />
              </div>
            </div>
          </fieldset>

          {/* Botones de acción */}
          <div className="flex flex-col md:flex-row gap-4 mb-8">
            <button type="button" className="flex-1 flex items-center justify-center px-6 py-3.5 border border-neutral-700 text-neutral-200 rounded-xl hover:border-red-500/70 hover:bg-red-500/10 transition-colors font-semibold">
              <Trash2 className="w-5 h-5 mr-2" />
              Limpiar Todo
            </button>
            <button type="submit" className="flex-1 flex items-center justify-center px-6 py-3.5 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors font-semibold border border-green-700/40">
              <Send className="w-5 h-5 mr-2" />
              Publicar Producto
            </button>
          </div>

          {/* Modal de Previsualización */}
          {showPreview && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
              <div className="bg-neutral-900 border border-neutral-700 rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto scrollbar-hide">
                <div className="flex items-center justify-between p-6 border-b border-neutral-800">
                  <h3 className="text-xl font-semibold text-neutral-100">Vista Previa del Producto</h3>
                  <button
                    onClick={() => setShowPreview(false)}
                    className="text-neutral-400 hover:text-neutral-200 transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
                <div className="p-6 flex flex-col items-center">
                  {/* Card extendida con todos los datos del formulario */}
                  <div className="bg-neutral-800 border border-neutral-700 rounded-xl shadow-lg overflow-hidden w-full">
                    {/* Imagen del producto */}
                    <div className="h-48 bg-neutral-950 relative">
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
                        <div className="w-full h-full flex items-center justify-center text-neutral-400">
                          <span className="text-4xl">🥬</span>
                        </div>
                      )}
                    </div>
                    {/* Contenido de la tarjeta */}
                    <div className="p-4">
                      <h3 className="text-lg font-semibold text-neutral-100 mb-2 line-clamp-1">
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
                          <span className="bg-green-600/20 text-green-200 text-xs px-2 py-1 rounded-full border border-green-700/40">
                            {subcategorias.find(s => s.id === formData.subcategory)?.name || 'Subcategoría'}
                          </span>
                        )}
                      </div>
                      <p className="text-neutral-300 text-sm mb-3 line-clamp-2">
                        {formData.description || 'Sin descripción.'}
                      </p>
                      {/* Precio y stock */}
                      <div className="flex items-center justify-between mb-3">
                        <div className="text-2xl font-bold text-green-400">
                          {formData.price ? `$${Number(formData.price).toLocaleString()}` : '$0'}
                          <span className="text-sm font-normal text-neutral-400">
                            /{unidades.find(u => u.value === formData.unit)?.label.split(' ')[0] || 'unidad'}
                          </span>
                        </div>
                        <div className="text-sm text-neutral-400">
                          Stock: {formData.stock || 0}
                        </div>
                      </div>
                      {/* Agricultor (simulado) */}
                      <div className="text-xs text-neutral-400 mb-1">
                        Por: Tú (previsualización)
                      </div>
                      {/* Ubicación */}
                      <div className="flex items-center gap-2 text-xs text-neutral-400 mb-1">
                        <MapPin className="w-4 h-4" />
                        <span>{formData.municipio || 'Municipio'}</span>
                        {formData.vereda && <span>- {formData.vereda}</span>}
                      </div>
                      {/* Certificaciones */}
                      {formData.certificaciones && formData.certificaciones.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-2">
                          {formData.certificaciones.map(cert => (
                            <span key={cert} className="bg-green-600/15 text-green-200 px-2 py-1 rounded text-xs font-medium border border-green-700/40">{cert}</span>
                          ))}
                        </div>
                      )}
                      {/* Tipo de cultivo, fecha de cosecha, peso, dimensiones */}
                      <div className="grid grid-cols-2 gap-2 text-xs text-neutral-300 mb-2">
                        <div><span className="font-semibold">Cultivo:</span> {formData.tipoCultivo || 'N/A'}</div>
                        <div><span className="font-semibold">Cosecha:</span> {formData.fechaCosecha || 'N/A'}</div>
                        <div><span className="font-semibold">Peso:</span> {formData.pesoAproximado || 'N/A'} kg</div>
                      </div>
                      {/* Condiciones de almacenamiento removed */}
                      {/* Métodos de entrega */}
                      {formData.metodosEntrega && formData.metodosEntrega.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-2">
                          {formData.metodosEntrega.map(metodo => (
                            <span key={metodo} className="bg-neutral-900 text-neutral-200 px-2 py-1 rounded text-xs font-medium border border-neutral-700">
                              {metodosEntregaDisponibles.find(m => m.value === metodo)?.label || metodo}
                            </span>
                          ))}
                        </div>
                      )}
                      {/* Notas especiales */}
                      {formData.notasEspeciales && (
                        <div className="text-xs text-neutral-300 mb-2">
                          <span className="font-semibold">Notas:</span> {formData.notasEspeciales}
                        </div>
                      )}
                      {/* Botón de acción (deshabilitado en preview) */}
                      <button className="w-full bg-green-600 text-white py-2 px-4 rounded-lg opacity-60 cursor-not-allowed font-medium mt-2" disabled>
                        Agregar al Carrito
                      </button>
                    </div>
                  </div>
                  <div className="mt-4 p-3 bg-neutral-800 border border-neutral-700 rounded-lg w-full">
                    <div className="flex items-start">
                      <Info className="w-5 h-5 text-green-400 mr-2 flex-shrink-0 mt-0.5" />
                      <div className="text-sm text-neutral-200">
                        <p className="font-medium">Vista previa</p>
                        <p className="text-neutral-300">Así es como los compradores verán tu producto en el marketplace.</p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-6 border-t border-neutral-800 bg-neutral-900">
                  <button
                    onClick={() => setShowPreview(false)}
                    className="w-full sm:w-auto px-4 py-2 text-neutral-300 hover:text-white transition-colors rounded-md border border-transparent hover:border-neutral-700 text-sm"
                  >
                    Cerrar Vista Previa
                  </button>
                  <button
                    onClick={() => {
                      setShowPreview(false);
                      document.querySelector('button[type="submit"]')?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="w-full sm:w-auto px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
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
