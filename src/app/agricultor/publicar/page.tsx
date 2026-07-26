"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUserId } from "@/lib/useUserId";
import { 
  Package, 
  DollarSign, 
  MapPin, 
  Camera, 
  Sparkles, 
  Trash2, 
  Send, 
  X, 
  CheckCircle2, 
  Plus, 
  Eye, 
  Truck, 
  Info,
  Clock,
  Layers,
  ArrowRight,
  ArrowLeft,
  Home,
  Store,
  Check
} from "lucide-react";
import PackagingModal from '@/components/PackagingModal';
import CitySelector from '@/components/CitySelector';

const unidades = [
  { value: 'kg', label: 'Kilogramo (kg)' },
  { value: 'libra', label: 'Libra (lb)' },
  { value: 'bulto', label: 'Bulto' },
  { value: 'caja', label: 'Caja' },
  { value: 'canasta', label: 'Canasta' },
  { value: 'unidad', label: 'Unidad' },
  { value: 'docena', label: 'Docena' },
  { value: 'litro', label: 'Litro (L)' },
  { value: 'manojo', label: 'Manojo' },
  { value: 'racimo', label: 'Racimo' }
];

const metodosEntregaDisponibles = [
  { value: 'domicilio', label: 'Entrega a domicilio', icon: Truck },
  { value: 'punto', label: 'Punto de encuentro', icon: MapPin },
  { value: 'finca', label: 'Recogida en finca', icon: Home },
  { value: 'mercado', label: 'Mercado local', icon: Store }
];

type PurchaseUnit = {
  unit: string;
  equivalencia: number;
  price?: number | null;
};

type FormDataType = {
  name: string;
  description: string;
  price: string;
  unit: string;
  category: string;
  subcategory: string;
  stock: string;
  municipio: string;
  imagenes: File[];
  tiempoEntrega: string;
  imageUrl: string;
  purchaseUnits: PurchaseUnit[];
  metodosEntrega: string[];
};

export default function PublicarPage() {
  const userId = useUserId();
  const router = useRouter();
  const [agricultorId, setAgricultorId] = useState<string | null>(null);

  const [categorias, setCategorias] = useState<{ id: string; name: string }[]>([]);
  const [subcategorias, setSubcategorias] = useState<{ id: string; name: string; categoryId: string }[]>([]);

  // Paso actual para tarjetas en móvil (1, 2, 3, 4)
  const [currentStep, setCurrentStep] = useState<number>(1);

  const [formData, setFormData] = useState<FormDataType>({
    name: '',
    description: '',
    price: '',
    unit: 'kg',
    category: '',
    subcategory: '',
    stock: '',
    municipio: '',
    imagenes: [],
    tiempoEntrega: '1',
    imageUrl: '',
    purchaseUnits: [],
    metodosEntrega: [],
  });

  const [previewImages, setPreviewImages] = useState<string[]>([]);
  const [showPreview, setShowPreview] = useState<boolean>(false);
  const [showConfirm, setShowConfirm] = useState<boolean>(false);
  const [showPackagingModal, setShowPackagingModal] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Cargar perfil del agricultor
  useEffect(() => {
    if (userId) {
      fetch(`/api/agricultor/por-user?userId=${userId}`)
        .then(res => res.json())
        .then(data => {
          if (data && data.id) {
            setAgricultorId(data.id);
            if (data.ubicacion && !formData.municipio) {
              setFormData(prev => ({ ...prev, municipio: data.ubicacion }));
            }
          }
        })
        .catch(() => setAgricultorId(null));
    }
  }, [userId]);

  // Cargar categorías
  useEffect(() => {
    fetch('/api/categorias')
      .then(res => res.json())
      .then(data => setCategorias(Array.isArray(data) ? data : []))
      .catch(() => setCategorias([]));
  }, []);

  // Cargar subcategorías dinámicas al cambiar de categoría
  useEffect(() => {
    if (!formData.category) {
      setSubcategorias([]);
      return;
    }
    fetch(`/api/subcategorias?categoriaId=${formData.category}`)
      .then(res => res.json())
      .then(data => setSubcategorias(Array.isArray(data) ? data : []))
      .catch(() => setSubcategorias([]));
  }, [formData.category]);

  const handleInputChange = (field: keyof FormDataType, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const newFiles: File[] = [];
    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
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

  const toggleMetodoEntrega = (metodo: string) => {
    setFormData(prev => {
      const exists = prev.metodosEntrega.includes(metodo);
      return {
        ...prev,
        metodosEntrega: exists
          ? prev.metodosEntrega.filter(m => m !== metodo)
          : [...prev.metodosEntrega, metodo]
      };
    });
  };

  const removePurchaseUnit = (index: number) => {
    setFormData(prev => ({
      ...prev,
      purchaseUnits: prev.purchaseUnits.filter((_, i) => i !== index)
    }));
  };

  const handlePackagingConfirm = (items: PurchaseUnit[]) => {
    const mapped = items.map(i => ({
      ...i,
      price: formData.price && formData.price !== '' ? Number(formData.price) * Number(i.equivalencia) : null
    }));
    setFormData(prev => ({ ...prev, purchaseUnits: [...prev.purchaseUnits, ...mapped] }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) {
      alert("Debes iniciar sesión para publicar un producto.");
      return;
    }

    if (!formData.name || !formData.price || !formData.category || !formData.stock) {
      alert("Por favor completa los campos obligatorios (*)");
      return;
    }

    setIsSubmitting(true);

    let imageUrlToSend = formData.imageUrl;
    const allImageUrls: string[] = [];

    if (previewImages.length > 0) {
      for (let i = 0; i < previewImages.length; i++) {
        const base64 = previewImages[i];
        if (!base64 || !base64.startsWith('data:image/')) continue;
        try {
          const uploadRes = await fetch("/api/upload", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ image: base64 }),
          });
          if (uploadRes.ok) {
            const uploadData = await uploadRes.json();
            const url = uploadData.url || uploadData.imageUrl || '';
            if (url) allImageUrls.push(url);
          }
        } catch (err) {
          console.warn(`Error de red al subir imagen ${i + 1}`);
        }
      }

      if (allImageUrls.length > 0 && !imageUrlToSend) {
        imageUrlToSend = allImageUrls[0];
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
      stockMinimo: 10,
      reservedStock: 10,
      imageUrl: imageUrlToSend || 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=500&auto=format&fit=crop&q=80',
      imagenes: allImageUrls.length > 0 ? JSON.stringify(allImageUrls) : null,
      tiempoEntrega: formData.tiempoEntrega || '1',
      metodosEntrega: formData.metodosEntrega.length > 0 ? JSON.stringify(formData.metodosEntrega) : null,
      purchaseUnits: formData.purchaseUnits.length > 0 ? JSON.stringify(formData.purchaseUnits) : null,
      municipio: formData.municipio || 'Colombia',
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
        setIsSubmitting(false);
        return;
      }

      setShowConfirm(true);
      setTimeout(() => {
        router.push("/agricultor/mis-productos");
      }, 1800);
    } catch (err) {
      alert("Error de red al publicar el producto");
      setIsSubmitting(false);
    }
  };

  const stepsMeta = [
    { title: '1. Información del Producto', subtitle: 'Nombre, categoría y detalles' },
    { title: '2. Precio y Cantidad', subtitle: 'Costo por unidad e inventario' },
    { title: '3. Ubicación y Entrega', subtitle: 'Municipio y logística' },
    { title: '4. Fotos del Producto', subtitle: 'Imágenes reales de tu cosecha' }
  ];

  return (
    <div className="min-h-screen bg-neutral-950 text-white py-4 sm:py-8 px-3 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-4 sm:space-y-6">
        
        {/* Encabezado Principal */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-neutral-850">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-lime-500/10 border border-lime-500/20 text-lime-400 text-[11px] font-semibold uppercase tracking-wider mb-1">
              <Sparkles className="w-3 h-3" /> Publicación AgroConecta
            </div>
            <h1 className="text-xl sm:text-3xl font-extrabold text-white tracking-tight">Publicar Cosecha o Producto</h1>
            <p className="text-xs sm:text-sm text-neutral-400 mt-0.5">Completa los datos esenciales para conectar tu cosecha con compradores directos.</p>
          </div>

          <button
            type="button"
            onClick={() => setShowPreview(true)}
            className="hidden sm:inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-neutral-750 bg-neutral-900 text-neutral-200 hover:text-white hover:bg-neutral-800 transition-all font-semibold text-sm cursor-pointer shadow-sm"
          >
            <Eye className="w-4 h-4 text-lime-400" />
            <span>Previsualizar</span>
          </button>
        </div>


        {/* Formulario en Pasos (Móvil muestra 1 paso por tarjeta, Escritorio muestra todo continuo) */}
        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
          
          {/* Seccion 1: Datos del Producto */}
          <div className={`${currentStep === 1 ? 'block' : 'hidden sm:block'} bg-neutral-900/90 border border-neutral-800/80 rounded-2xl p-4 sm:p-8 space-y-4 sm:space-y-6 shadow-xl backdrop-blur-sm`}>
            <div className="flex items-center gap-2.5 pb-3 border-b border-neutral-800">
              <div className="w-8 h-8 rounded-xl bg-lime-500/10 border border-lime-500/20 flex items-center justify-center text-lime-400 font-extrabold text-xs sm:text-sm">
                1
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-bold text-white">Información del Producto</h2>
                <p className="text-[11px] sm:text-xs text-neutral-400">Nombre, descripción y categoría principal</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              <div className="sm:col-span-2">
                <label className="block text-[11px] sm:text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-1.5">
                  Nombre del Producto <span className="text-lime-400">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={e => handleInputChange('name', e.target.value)}
                  placeholder="Ej: Plátano Hartón Orgánico"
                  className="w-full px-3.5 py-2.5 sm:px-4 sm:py-3 bg-neutral-950 border border-neutral-800 rounded-xl text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-lime-500/50 text-xs sm:text-sm font-medium"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] sm:text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-1.5">
                  Categoría <span className="text-lime-400">*</span>
                </label>
                <select
                  value={formData.category}
                  onChange={e => handleInputChange('category', e.target.value)}
                  className="w-full px-3.5 py-2.5 sm:px-4 sm:py-3 bg-neutral-950 border border-neutral-800 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-lime-500/50 text-xs sm:text-sm cursor-pointer font-medium"
                  required
                >
                  <option value="">Seleccionar categoría</option>
                  {categorias.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] sm:text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-1.5">
                  Subcategoría <span className="text-neutral-400">(Opcional)</span>
                </label>
                <select
                  value={formData.subcategory}
                  onChange={e => handleInputChange('subcategory', e.target.value)}
                  disabled={!formData.category}
                  className="w-full px-3.5 py-2.5 sm:px-4 sm:py-3 bg-neutral-950 border border-neutral-800 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-lime-500/50 text-xs sm:text-sm cursor-pointer disabled:opacity-50 font-medium"
                >
                  <option value="">Seleccionar subcategoría</option>
                  {subcategorias.map(sub => (
                    <option key={sub.id} value={sub.id}>{sub.name}</option>
                  ))}
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-[11px] sm:text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-1.5">
                  Descripción Corta <span className="text-neutral-400">(Recomendado)</span>
                </label>
                <textarea
                  value={formData.description}
                  onChange={e => handleInputChange('description', e.target.value)}
                  rows={3}
                  placeholder="Describe la calidad de tu producto, época de cultivo o detalles de sabor..."
                  className="w-full px-3.5 py-2.5 sm:px-4 sm:py-3 bg-neutral-950 border border-neutral-800 rounded-xl text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-lime-500/50 text-xs sm:text-sm font-medium"
                />
              </div>
            </div>

            {/* Controles de Navegación de Tarjeta en Móvil */}
            <div className="pt-2 flex justify-end items-center sm:hidden">
              <button
                type="button"
                onClick={() => setCurrentStep(2)}
                className="px-4 py-2 bg-neutral-800 hover:bg-neutral-750 text-lime-400 font-bold text-xs rounded-xl inline-flex items-center gap-1.5 cursor-pointer shadow-sm"
              >
                <span>Siguiente: Precio y Stock</span> <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Seccion 2: Precio y Disponible */}
          <div className={`${currentStep === 2 ? 'block' : 'hidden sm:block'} bg-neutral-900/90 border border-neutral-800/80 rounded-2xl p-4 sm:p-8 space-y-4 sm:space-y-6 shadow-xl backdrop-blur-sm`}>
            <div className="flex items-center gap-2.5 pb-3 border-b border-neutral-800">
              <div className="w-8 h-8 rounded-xl bg-lime-500/10 border border-lime-500/20 flex items-center justify-center text-lime-400 font-extrabold text-xs sm:text-sm">
                2
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-bold text-white">Precio y Cantidad Disponible</h2>
                <p className="text-[11px] sm:text-xs text-neutral-400">Define el valor de venta e inventario disponible</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
              {/* 1. Selección de Unidad Primero */}
              <div>
                <label className="block text-[11px] sm:text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-1.5">
                  Unidad de Medida <span className="text-lime-400">*</span>
                </label>
                <select
                  value={formData.unit}
                  onChange={e => handleInputChange('unit', e.target.value)}
                  className="w-full px-3.5 py-2.5 sm:px-4 sm:py-3 bg-neutral-950 border border-neutral-800 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-lime-500/50 text-xs sm:text-sm cursor-pointer font-medium"
                  required
                >
                  {unidades.map(u => (
                    <option key={u.value} value={u.value}>{u.label}</option>
                  ))}
                </select>
              </div>

              {/* 2. Precio Dinámico según Unidad */}
              <div>
                <label className="block text-[11px] sm:text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-1.5">
                  Precio por {unidades.find(u => u.value === formData.unit)?.label.split(' ')[0] || 'Unidad'} <span className="text-lime-400">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400 font-bold text-xs sm:text-sm">$</span>
                  <input
                    type="number"
                    value={formData.price}
                    onChange={e => handleInputChange('price', e.target.value)}
                    placeholder="Ej: 2.500 COP"
                    min="0"
                    className="w-full pl-7 sm:pl-8 pr-3.5 py-2.5 sm:py-3 bg-neutral-950 border border-neutral-800 rounded-xl text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-lime-500/50 text-xs sm:text-sm font-semibold"
                    required
                  />
                </div>
              </div>

              {/* 3. Cantidad Disponible Dinámica */}
              <div>
                <label className="block text-[11px] sm:text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-1.5">
                  Cantidad Disponible <span className="text-neutral-400 font-normal">({unidades.find(u => u.value === formData.unit)?.label.split(' ')[0].toLowerCase() || 'unidades'})</span> <span className="text-lime-400">*</span>
                </label>
                <input
                  type="number"
                  value={formData.stock}
                  onChange={e => handleInputChange('stock', e.target.value)}
                  placeholder="Ej: 100"
                  min="1"
                  className="w-full px-3.5 py-2.5 sm:px-4 sm:py-3 bg-neutral-950 border border-neutral-800 rounded-xl text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-lime-500/50 text-xs sm:text-sm font-semibold"
                  required
                />
              </div>
            </div>

            {/* Empaques Mayores Opcionales */}
            <div className="pt-3 border-t border-neutral-800/60">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-white flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-lime-400" /> Empaques al por Mayor
                  </h4>
                  <p className="text-[10px] sm:text-xs text-neutral-400 mt-0.5">Venta por Cajas o Bultos.</p>
                </div>

                <button
                  type="button"
                  onClick={() => setShowPackagingModal(true)}
                  className="px-3 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-750 text-xs font-semibold text-lime-400 border border-neutral-700 transition-all cursor-pointer flex-shrink-0"
                >
                  + Empaque
                </button>
              </div>

              {formData.purchaseUnits.length > 0 && (
                <div className="mt-2.5 space-y-2">
                  {formData.purchaseUnits.map((pu, idx) => (
                    <div key={idx} className="flex items-center justify-between bg-neutral-950 p-2.5 rounded-xl border border-neutral-800 text-xs">
                      <div>
                        <span className="font-bold text-white">{pu.unit}</span>
                        <span className="text-neutral-400 ml-2">({pu.equivalencia} {formData.unit})</span>
                        {formData.price && (
                          <span className="text-lime-400 font-semibold ml-2">
                            ${(Number(formData.price) * pu.equivalencia).toLocaleString('es-CO')}
                          </span>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => removePurchaseUnit(idx)}
                        className="p-1 text-neutral-400 hover:text-red-400 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Controles de Navegación de Tarjeta en Móvil */}
            <div className="pt-2 flex justify-between items-center sm:hidden">
              <button
                type="button"
                onClick={() => setCurrentStep(1)}
                className="px-3 py-2 bg-neutral-800 text-neutral-300 font-semibold text-xs rounded-xl flex items-center gap-1 cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Anterior
              </button>
              <button
                type="button"
                onClick={() => setCurrentStep(3)}
                className="px-4 py-2 bg-neutral-800 hover:bg-neutral-750 text-lime-400 font-bold text-xs rounded-xl inline-flex items-center gap-1.5 cursor-pointer shadow-sm"
              >
                <span>Siguiente: Ubicación</span> <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Seccion 3: Ubicacion y Entrega */}
          <div className={`${currentStep === 3 ? 'block' : 'hidden sm:block'} bg-neutral-900/90 border border-neutral-800/80 rounded-2xl p-4 sm:p-8 space-y-4 sm:space-y-6 shadow-xl backdrop-blur-sm`}>
            <div className="flex items-center gap-2.5 pb-3 border-b border-neutral-800">
              <div className="w-8 h-8 rounded-xl bg-lime-500/10 border border-lime-500/20 flex items-center justify-center text-lime-400 font-extrabold text-xs sm:text-sm">
                3
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-bold text-white">Ubicación y Métodos de Entrega</h2>
                <p className="text-[11px] sm:text-xs text-neutral-400">¿Dónde entregas tu producto?</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              <div>
                <label className="block text-[11px] sm:text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-1.5">
                  Municipio / Ciudad <span className="text-lime-400">*</span>
                </label>
                <CitySelector
                  value={formData.municipio}
                  onChange={(ciudad) => handleInputChange('municipio', ciudad)}
                  placeholder="Buscar municipio o ciudad de Colombia..."
                />
              </div>

              <div>
                <label className="block text-[11px] sm:text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-1.5">
                  Tiempo Estimado de Entrega <span className="text-neutral-400">(Días)</span>
                </label>
                <div className="relative">
                  <Clock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400 w-4 h-4" />
                  <input
                    type="number"
                    value={formData.tiempoEntrega}
                    onChange={e => handleInputChange('tiempoEntrega', e.target.value)}
                    placeholder="1"
                    min="1"
                    className="w-full pl-10 pr-3.5 py-2.5 sm:py-3 bg-neutral-950 border border-neutral-800 rounded-xl text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-lime-500/50 text-xs sm:text-sm font-semibold"
                  />
                </div>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-[11px] sm:text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-2.5">
                  Métodos de Entrega Disponibles
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
                  {metodosEntregaDisponibles.map(m => {
                    const Icon = m.icon;
                    const selected = formData.metodosEntrega.includes(m.value);
                    return (
                      <button
                        type="button"
                        key={m.value}
                        onClick={() => toggleMetodoEntrega(m.value)}
                        className={`flex flex-col items-center justify-center p-3 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                          selected
                            ? 'bg-lime-500/15 border-lime-500/60 text-lime-400 font-bold shadow-md shadow-lime-950/20'
                            : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:text-white hover:bg-neutral-900'
                        }`}
                      >
                        <div className={`p-1.5 rounded-lg mb-1 transition-colors ${selected ? 'bg-lime-500/20 text-lime-400' : 'bg-neutral-900 text-neutral-400'}`}>
                          <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
                        </div>
                        <span className="text-center text-[11px] sm:text-xs">{m.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Controles de Navegación de Tarjeta en Móvil */}
            <div className="pt-2 flex justify-between items-center sm:hidden">
              <button
                type="button"
                onClick={() => setCurrentStep(2)}
                className="px-3 py-2 bg-neutral-800 text-neutral-300 font-semibold text-xs rounded-xl flex items-center gap-1 cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Anterior
              </button>
              <button
                type="button"
                onClick={() => setCurrentStep(4)}
                className="px-4 py-2 bg-neutral-800 hover:bg-neutral-750 text-lime-400 font-bold text-xs rounded-xl inline-flex items-center gap-1.5 cursor-pointer shadow-sm"
              >
                <span>Siguiente: Fotos</span> <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Seccion 4: Imagenes del Producto */}
          <div className={`${currentStep === 4 ? 'block' : 'hidden sm:block'} bg-neutral-900/90 border border-neutral-800/80 rounded-2xl p-4 sm:p-8 space-y-4 sm:space-y-6 shadow-xl backdrop-blur-sm`}>
            <div className="flex items-center gap-2.5 pb-3 border-b border-neutral-800">
              <div className="w-8 h-8 rounded-xl bg-lime-500/10 border border-lime-500/20 flex items-center justify-center text-lime-400 font-extrabold text-xs sm:text-sm">
                4
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-bold text-white">Fotos del Producto</h2>
                <p className="text-[11px] sm:text-xs text-neutral-400">Sube fotos reales para tus ventas</p>
              </div>
            </div>

            <div>
              <label 
                htmlFor="imagenes-upload" 
                className="w-full border-2 border-dashed border-neutral-800 hover:border-lime-500/50 rounded-2xl p-5 sm:p-8 flex flex-col items-center justify-center text-center bg-neutral-950 hover:bg-neutral-900/80 transition-all cursor-pointer group"
              >
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-lime-500/10 border border-lime-500/20 flex items-center justify-center text-lime-400 mb-2 group-hover:scale-110 transition-transform">
                  <Camera className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <span className="font-bold text-xs sm:text-sm text-white">Haz clic o arrastra fotos aquí</span>
                <span className="text-[10px] sm:text-xs text-neutral-400 mt-0.5">Soporta JPG, PNG, WEBP</span>
                <input id="imagenes-upload" type="file" accept="image/*" multiple onChange={handleImageUpload} className="hidden" />
              </label>

              {previewImages.length > 0 && (
                <div className="flex flex-wrap gap-2.5 mt-3">
                  {previewImages.map((img, idx) => (
                    <div key={idx} className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden border border-neutral-800 shadow-md group">
                      <img src={img} alt={`Preview ${idx + 1}`} className="w-full h-full object-cover" />
                      <button 
                        type="button" 
                        onClick={() => removeImage(idx)}
                        className="absolute top-1 right-1 bg-black/80 text-white rounded-lg p-1 hover:bg-red-600 transition-colors"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className="mt-3">
                <label className="block text-[11px] sm:text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-1">
                  O pega una URL de Imagen Directa
                </label>
                <input
                  type="url"
                  value={formData.imageUrl}
                  onChange={e => handleInputChange('imageUrl', e.target.value)}
                  placeholder="https://..."
                  className="w-full px-3.5 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-lime-500/50 text-xs"
                />
              </div>
            </div>

            {/* Controles de Navegación de Tarjeta en Móvil */}
            <div className="pt-2 flex justify-between items-center sm:hidden">
              <button
                type="button"
                onClick={() => setCurrentStep(3)}
                className="px-3 py-2 bg-neutral-800 text-neutral-300 font-semibold text-xs rounded-xl flex items-center gap-1 cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Anterior
              </button>
              <span className="text-[11px] text-neutral-400 font-semibold">Paso 4 de 4</span>
            </div>
          </div>

          {/* Botones de Acción al Final (En móvil se muestran lado a lado Previsualizar + Publicar) */}
          <div className="pt-2 sticky bottom-4 z-30 sm:static sm:bg-transparent">
            {/* Vista Móvil: Previsualizar (Izquierda) + Publicar (Derecha) */}
            <div className="flex sm:hidden items-center gap-2 bg-neutral-950/95 border border-neutral-800 p-2.5 rounded-2xl backdrop-blur-md shadow-2xl">
              <button
                type="button"
                onClick={() => setShowPreview(true)}
                className="flex-1 py-3 px-2.5 rounded-xl border border-neutral-750 bg-neutral-900 text-neutral-200 hover:text-white font-semibold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
              >
                <Eye className="w-3.5 h-3.5 text-lime-400" />
                <span>Previsualizar</span>
              </button>

              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-[1.4] py-3 px-3 rounded-xl bg-gradient-to-r from-lime-600 to-lime-500 text-neutral-950 font-extrabold text-xs hover:from-lime-500 hover:to-lime-400 transition-all shadow-lg shadow-lime-950/40 flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? (
                  <span>Publicando...</span>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>Publicar Ahora</span>
                  </>
                )}
              </button>
            </div>

            {/* Vista Escritorio: Botón único de publicación */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="hidden sm:flex w-full py-4 rounded-xl bg-gradient-to-r from-lime-600 to-lime-500 text-neutral-950 font-extrabold text-base hover:from-lime-500 hover:to-lime-400 transition-all shadow-lg shadow-lime-950/40 items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <span>Publicando producto...</span>
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  <span>Publicar Producto Ahora</span>
                </>
              )}
            </button>
          </div>

        </form>

        {/* Modal de Empaques Mayores */}
        <PackagingModal
          isOpen={showPackagingModal}
          onClose={() => setShowPackagingModal(false)}
          onConfirm={handlePackagingConfirm}
          baseUnit={formData.unit}
          basePrice={formData.price ? Number(formData.price) : null}
        />

        {/* Modal de Previsualización */}
        {showPreview && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4">
            <div className="bg-neutral-900 border border-neutral-800 rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto shadow-2xl p-5 sm:p-6 space-y-4 shadow-2xl">
              <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
                <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                  <Eye className="w-4 h-4 text-lime-400" /> Vista Previa del Producto
                </h3>
                <button onClick={() => setShowPreview(false)} className="text-neutral-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="bg-neutral-950 rounded-2xl overflow-hidden border border-neutral-800 shadow-xl">
                <div className="h-44 sm:h-48 bg-neutral-900 relative">
                  {previewImages[0] || formData.imageUrl ? (
                    <img src={previewImages[0] || formData.imageUrl} alt="Producto" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-4xl">🥬</div>
                  )}
                </div>

                <div className="p-4 space-y-2.5">
                  <h4 className="text-base sm:text-lg font-bold text-white">{formData.name || 'Nombre del producto'}</h4>
                  <p className="text-xs text-neutral-400">{formData.description || 'Sin descripción.'}</p>
                  
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-lg sm:text-xl font-extrabold text-lime-400">
                      ${formData.price ? Number(formData.price).toLocaleString('es-CO') : '0'}
                      <span className="text-xs text-neutral-400 font-normal"> / {formData.unit}</span>
                    </span>
                    <span className="text-xs text-neutral-400">Stock: {formData.stock || 0}</span>
                  </div>

                  <div className="text-xs text-neutral-400 flex items-center gap-1.5 pt-2 border-t border-neutral-850">
                    <MapPin className="w-3.5 h-3.5 text-lime-400" />
                    <span>{formData.municipio || 'Ubicación'}</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setShowPreview(false)}
                className="w-full py-2.5 rounded-xl bg-neutral-800 text-white font-semibold text-xs hover:bg-neutral-750 transition-colors"
              >
                Cerrar Previsualización
              </button>
            </div>
          </div>
        )}

        {/* Modal de Confirmación */}
        {showConfirm && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4">
            <div className="bg-neutral-900 border border-neutral-800 rounded-2xl max-w-xs w-full p-6 text-center space-y-4 shadow-2xl">
              <CheckCircle2 className="w-14 h-14 text-lime-400 mx-auto animate-bounce" />
              <div>
                <h3 className="text-lg font-bold text-white">¡Producto Publicado!</h3>
                <p className="text-xs text-neutral-400 mt-1">Tu cosecha ya está disponible en el mercado.</p>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
