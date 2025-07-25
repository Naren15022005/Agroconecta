

"use client";
import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Upload, Plus, X, MapPin, DollarSign, Package, FileText, Camera, AlertCircle, CheckCircle, Save, Eye, ArrowLeft, Loader2, ImageIcon, Calendar, Clock, Leaf, Scale, Tag, Info, Send, Trash2 } from 'lucide-react';

interface ProductoFormData {
  name: string;
  description: string;
  categoryId: string;
  price: number;
  unit: string;
  stock: number;
  municipio: string;
  vereda: string;
  imagenes: File[];
  tipoCultivo: 'organico' | 'convencional';
  fechaCosecha: string;
  tiempoEntrega: number;
  imageUrl?: string;
  // Nuevos campos
  stockMinimo: number;
  pesoAproximado?: number;
  dimensiones?: string;
  condicionesAlmacenamiento?: string;
  certificaciones: string[];
  metodosEntrega: string[];
  horariosDisponibles?: string;
  notasEspeciales?: string;
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

export default function PublicarPage() {
  const { data: session } = useSession();
  const [formData, setFormData] = useState<ProductoFormData>({
    name: '',
    description: '',
    categoryId: '',
    price: 0,
    unit: 'kg',
    stock: 0,
    municipio: '',
    vereda: '',
    imagenes: [],
    tipoCultivo: 'convencional',
    fechaCosecha: '',
    tiempoEntrega: 1,
    imageUrl: '',
    // Nuevos campos
    stockMinimo: 10,
    pesoAproximado: 0,
    dimensiones: '',
    condicionesAlmacenamiento: '',
    certificaciones: [],
    metodosEntrega: ['domicilio'],
    horariosDisponibles: '',
    notasEspeciales: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [categorias, setCategorias] = useState<{ id: string; name: string }[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previewImages, setPreviewImages] = useState<string[]>([]);
  const [mensaje, setMensaje] = useState('');
  const [tipoMensaje, setTipoMensaje] = useState<'success' | 'error'>('success');
  const [showPreview, setShowPreview] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [isDraftSaved, setIsDraftSaved] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  useEffect(() => {
    // Cargar categorías con mejor manejo de errores
    const loadCategorias = async () => {
      try {
        const res = await fetch('/api/categorias');
        
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        
        const responseText = await res.text();
        if (!responseText) {
          // Usar categorías por defecto
          setCategorias([
            { id: '1', name: 'Frutas' },
            { id: '2', name: 'Verduras' },
            { id: '3', name: 'Hortalizas' },
            { id: '4', name: 'Granos' },
            { id: '5', name: 'Tubérculos' }
          ]);
          return;
        }
        
        const data = JSON.parse(responseText);
        setCategorias(data);
        
      } catch (err) {
        // Usar categorías por defecto en caso de error
        setCategorias([
          { id: '1', name: 'Frutas' },
          { id: '2', name: 'Verduras' },
          { id: '3', name: 'Hortalizas' },
          { id: '4', name: 'Granos' },
          { id: '5', name: 'Tubérculos' }
        ]);
      }
    };
    
    loadCategorias();
    
    // Cargar borrador si existe
    loadDraft();
  }, []);

  // Guardar borrador automáticamente
  useEffect(() => {
    const saveTimer = setTimeout(() => {
      if (formData.name || formData.description) {
        saveDraft();
      }
    }, 2000);

    return () => clearTimeout(saveTimer);
  }, [formData]);

  const saveDraft = () => {
    localStorage.setItem('producto-draft', JSON.stringify(formData));
    setIsDraftSaved(true);
    setLastSaved(new Date());
    setTimeout(() => setIsDraftSaved(false), 2000);
  };

  const loadDraft = () => {
    const draft = localStorage.getItem('producto-draft');
    if (draft) {
      try {
        const draftData = JSON.parse(draft);
        setFormData(prev => ({ ...prev, ...draftData }));
      } catch (err) {
        // Silenciar error de carga de borrador
      }
    }
  };

  const clearDraft = () => {
    localStorage.removeItem('producto-draft');
  };

  const toggleCertificacion = (cert: string) => {
    const currentCerts = formData.certificaciones;
    if (currentCerts.includes(cert)) {
      handleInputChange('certificaciones', currentCerts.filter(c => c !== cert));
    } else {
      handleInputChange('certificaciones', [...currentCerts, cert]);
    }
  };

  const toggleMetodoEntrega = (metodo: string) => {
    const currentMetodos = formData.metodosEntrega;
    if (currentMetodos.includes(metodo)) {
      if (currentMetodos.length > 1) { // Al menos uno debe estar seleccionado
        handleInputChange('metodosEntrega', currentMetodos.filter(m => m !== metodo));
      }
    } else {
      handleInputChange('metodosEntrega', [...currentMetodos, metodo]);
    }
  };

  const calculateProgress = () => {
    const requiredFields = ['name', 'description', 'categoryId', 'price', 'stock', 'municipio', 'vereda', 'fechaCosecha'];
    const filledFields = requiredFields.filter(field => {
      const value = formData[field as keyof ProductoFormData];
      return value !== '' && value !== 0;
    });
    
    const imagesFilled = formData.imagenes.length > 0 || formData.imageUrl;
    const totalFields = requiredFields.length + (imagesFilled ? 1 : 0);
    const completedFields = filledFields.length + (imagesFilled ? 1 : 0);
    
    return Math.round((completedFields / (requiredFields.length + 1)) * 100);
  };

  const handleInputChange = (field: keyof ProductoFormData, value: string | number | File[] | string[]) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Limpiar error del campo cuando se modifica
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    
    // Validar que no exceda 5 imágenes
    if (formData.imagenes.length + files.length > 5) {
      setErrors(prev => ({
        ...prev,
        imagenes: 'Máximo 5 imágenes permitidas'
      }));
      return;
    }

    // Validar tamaño de archivos (5MB máximo)
    const validFiles = files.filter(file => {
      if (file.size > 5 * 1024 * 1024) {
        setErrors(prev => ({
          ...prev,
          imagenes: 'Cada imagen debe pesar menos de 5MB'
        }));
        return false;
      }
      return true;
    });

    // Crear previews
    const newPreviews: string[] = [];
    validFiles.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        newPreviews.push(e.target?.result as string);
        if (newPreviews.length === validFiles.length) {
          setPreviewImages(prev => [...prev, ...newPreviews]);
        }
      };
      reader.readAsDataURL(file);
    });

    handleInputChange('imagenes', [...formData.imagenes, ...validFiles]);
  };

  const removeImage = (index: number) => {
    const newImages = formData.imagenes.filter((_, i) => i !== index);
    const newPreviews = previewImages.filter((_, i) => i !== index);
    
    setFormData(prev => ({ ...prev, imagenes: newImages }));
    setPreviewImages(newPreviews);
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'El nombre del producto es obligatorio';
    }

    if (!formData.description.trim() || formData.description.length < 20) {
      newErrors.description = 'La descripción debe tener al menos 20 caracteres';
    }

    if (!formData.categoryId) {
      newErrors.categoryId = 'Selecciona una categoría';
    }

    if (formData.price <= 0) {
      newErrors.price = 'El precio debe ser mayor a 0';
    }

    if (formData.stock <= 0) {
      newErrors.stock = 'El stock debe ser mayor a 0';
    }

    if (!formData.municipio.trim()) {
      newErrors.municipio = 'El municipio es obligatorio';
    }

    if (!formData.vereda.trim()) {
      newErrors.vereda = 'La vereda es obligatoria';
    }

    if (formData.imagenes.length === 0 && !formData.imageUrl) {
      newErrors.imagenes = 'Debes subir al menos una imagen o proporcionar una URL';
    }

    if (!formData.fechaCosecha) {
      newErrors.fechaCosecha = 'La fecha de cosecha es obligatoria';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Verificar sesión
    if (!session?.user?.id) {
      setMensaje('Debes iniciar sesión para publicar productos.');
      setTipoMensaje('error');
      return;
    }

    if (!validateForm()) {
      setMensaje('Por favor corrige los errores en el formulario.');
      setTipoMensaje('error');
      return;
    }

    setIsSubmitting(true);
    setMensaje('');

    try {
      // Manejar imagen de forma segura
      let imageToUse = formData.imageUrl || '';
      
      // Solo crear objectURL si hay archivos válidos
      if (formData.imagenes.length > 0 && formData.imagenes[0] instanceof File) {
        try {
          imageToUse = URL.createObjectURL(formData.imagenes[0]);
        } catch (urlError) {
          imageToUse = formData.imageUrl || '';
        }
      }

      const ubicacion = `${formData.vereda}, ${formData.municipio}`;

      const productData = {
        name: formData.name,
        price: formData.price,
        unit: formData.unit,
        imageUrl: imageToUse,
        description: formData.description,
        categoryId: formData.categoryId,
        ubicacion: ubicacion,
        farmerId: session.user.id,
        stock: formData.stock,
        tipoCultivo: formData.tipoCultivo,
        fechaCosecha: formData.fechaCosecha,
        tiempoEntrega: formData.tiempoEntrega,
      });

      const res = await fetch('/api/productos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          price: formData.price,
          unit: formData.unit,
          imageUrl: imageToUse,
          description: formData.description,
          categoryId: formData.categoryId,
          ubicacion: ubicacion,
          farmerId: session.user.id,
          // Campos adicionales que se pueden agregar al backend
          stock: formData.stock,
          tipoCultivo: formData.tipoCultivo,
          fechaCosecha: formData.fechaCosecha,
          tiempoEntrega: formData.tiempoEntrega,
        }),
      });

      if (res.ok) {
        setMensaje('¡Producto publicado exitosamente!');
        setTipoMensaje('success');
        
        // Resetear formulario
        setFormData({
          name: '',
          description: '',
          categoryId: '',
          price: 0,
          unit: 'kg',
          stock: 0,
          municipio: '',
          vereda: '',
          imagenes: [],
          tipoCultivo: 'convencional',
          fechaCosecha: '',
          tiempoEntrega: 1,
          imageUrl: '',
          stockMinimo: 10,
          pesoAproximado: 0,
          dimensiones: '',
          condicionesAlmacenamiento: '',
          certificaciones: [],
          metodosEntrega: ['domicilio'],
          horariosDisponibles: '',
          notasEspeciales: ''
        });
        setPreviewImages([]);
        setErrors({});
        
        // Scroll hacia arriba para mostrar el mensaje
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        // Mejorar manejo de errores
        let errorMessage = 'Error al publicar producto';
        try {
          const errorText = await res.text();
          if (errorText) {
            const errorData = JSON.parse(errorText);
            errorMessage = errorData.error || errorMessage;
          } else {
            errorMessage = `Error del servidor (${res.status}): ${res.statusText}`;
          }
        } catch (parseError) {
          
          errorMessage = `Error del servidor (${res.status}): ${res.statusText}`;
        }
        setMensaje(errorMessage);
        setTipoMensaje('error');
      }
    } catch (err) {
      
      setMensaje('Error de red o servidor. Inténtalo de nuevo.');
      setTipoMensaje('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header mejorado */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4">
              <button
                type="button"
                onClick={() => window.history.back()}
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                <span>Volver</span>
              </button>
              <div className="h-6 w-px bg-gray-300"></div>
              <h1 className="text-3xl font-bold text-gray-900">Publicar Producto</h1>
            </div>
            
            <div className="flex items-center space-x-3">
              {isDraftSaved && (
                <div className="flex items-center space-x-2 text-green-600 text-sm">
                  <Save className="w-4 h-4" />
                  <span>Borrador guardado</span>
                </div>
              )}
              
              <button
                type="button"
                onClick={() => setShowPreview(!showPreview)}
                className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Eye className="w-4 h-4" />
                <span>{showPreview ? 'Ocultar' : 'Previsualizar'}</span>
              </button>
            </div>
          </div>
          
          {/* Barra de progreso */}
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Progreso del formulario</span>
              <span className="text-sm font-semibold text-green-600">{calculateProgress()}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-green-500 to-green-600 h-2 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${calculateProgress()}%` }}
              ></div>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Completa todos los campos obligatorios para publicar tu producto
            </p>
          </div>
        </div>

        {/* Mensaje de estado */}
        {mensaje && (
          <div className={`mb-6 p-4 rounded-lg flex items-center ${
            tipoMensaje === 'success' 
              ? 'bg-green-50 text-green-800 border border-green-200' 
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}>
            {tipoMensaje === 'success' ? (
              <CheckCircle className="w-5 h-5 mr-3 flex-shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 mr-3 flex-shrink-0" />
            )}
            <span>{mensaje}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Información básica del producto */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center mb-6">
              <Package className="w-6 h-6 text-green-600 mr-3" />
              <h2 className="text-xl font-semibold text-gray-900">Información del Producto</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Nombre del producto */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre del producto *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className={`w-full px-4 py-3 rounded-lg border text-gray-900 placeholder-gray-500 ${
                    errors.name ? 'border-red-300' : 'border-gray-300'
                  } focus:ring-2 focus:ring-green-500 focus:border-transparent`}
                  placeholder="Ej: Plátano Hartón Premium"
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                )}
              </div>

              {/* Categoría */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Categoría *
                </label>
                <select
                  value={formData.categoryId}
                  onChange={(e) => handleInputChange('categoryId', e.target.value)}
                  className={`w-full px-4 py-3 rounded-lg border text-gray-900 ${
                    errors.categoryId ? 'border-red-300' : 'border-gray-300'
                  } focus:ring-2 focus:ring-green-500 focus:border-transparent`}
                >
                  <option value="">Selecciona una categoría</option>
                  {categorias.map((categoria) => (
                    <option key={categoria.id} value={categoria.id}>
                      {categoria.name}
                    </option>
                  ))}
                </select>
                {errors.categoryId && (
                  <p className="mt-1 text-sm text-red-600">{errors.categoryId}</p>
                )}
              </div>

              {/* Descripción */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Descripción *
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  rows={4}
                  className={`w-full px-4 py-3 rounded-lg border text-gray-900 placeholder-gray-500 ${
                    errors.description ? 'border-red-300' : 'border-gray-300'
                  } focus:ring-2 focus:ring-green-500 focus:border-transparent`}
                  placeholder="Describe tu producto, cómo fue cultivado, características especiales..."
                />
                <p className="mt-1 text-sm text-gray-500">
                  {formData.description.length}/20 caracteres mínimo
                </p>
                {errors.description && (
                  <p className="mt-1 text-sm text-red-600">{errors.description}</p>
                )}
              </div>
            </div>
          </div>

          {/* Precio y stock */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center mb-6">
              <DollarSign className="w-6 h-6 text-green-600 mr-3" />
              <h2 className="text-xl font-semibold text-gray-900">Precio y Disponibilidad</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Precio */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Precio *
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-3 text-gray-500">$</span>
                  <input
                    type="number"
                    value={formData.price}
                    onChange={(e) => handleInputChange('price', parseFloat(e.target.value) || 0)}
                    className={`w-full pl-8 pr-4 py-3 rounded-lg border text-gray-900 placeholder-gray-500 ${
                      errors.price ? 'border-red-300' : 'border-gray-300'
                    } focus:ring-2 focus:ring-green-500 focus:border-transparent`}
                    placeholder="2500"
                  />
                </div>
                {errors.price && (
                  <p className="mt-1 text-sm text-red-600">{errors.price}</p>
                )}
              </div>

              {/* Unidad */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Unidad de medida
                </label>
                <div className="relative">
                  <select
                    value={formData.unit}
                    onChange={(e) => handleInputChange('unit', e.target.value)}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 text-gray-900 focus:ring-2 focus:ring-green-500 focus:border-transparent appearance-none"
                  >
                    {unidades.map((unidad) => (
                      <option key={unidad.value} value={unidad.value}>
                        {unidad.icon} {unidad.label}
                      </option>
                    ))}
                  </select>
                  <Scale className="absolute right-3 top-3 w-5 h-5 text-gray-400 pointer-events-none" />
                </div>
              </div>

              {/* Stock */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Stock disponible *
                </label>
                <input
                  type="number"
                  value={formData.stock}
                  onChange={(e) => handleInputChange('stock', parseInt(e.target.value) || 0)}
                  className={`w-full px-4 py-3 rounded-lg border text-gray-900 placeholder-gray-500 ${
                    errors.stock ? 'border-red-300' : 'border-gray-300'
                  } focus:ring-2 focus:ring-green-500 focus:border-transparent`}
                  placeholder="50"
                />
                {errors.stock && (
                  <p className="mt-1 text-sm text-red-600">{errors.stock}</p>
                )}
              </div>

              {/* Stock mínimo */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Stock mínimo de alerta
                </label>
                <input
                  type="number"
                  value={formData.stockMinimo}
                  onChange={(e) => handleInputChange('stockMinimo', parseInt(e.target.value) || 0)}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="10"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Te notificaremos cuando el stock esté por debajo de este número
                </p>
              </div>

              {/* Peso aproximado */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Peso aproximado (kg)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.pesoAproximado}
                  onChange={(e) => handleInputChange('pesoAproximado', parseFloat(e.target.value) || 0)}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="1.5"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Ayuda a calcular costos de envío
                </p>
              </div>
            </div>

            {/* Dimensiones */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Dimensiones del empaque (opcional)
              </label>
              <input
                type="text"
                value={formData.dimensiones}
                onChange={(e) => handleInputChange('dimensiones', e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="30cm x 20cm x 15cm"
              />
            </div>
          </div>

          {/* Información de calidad y certificaciones */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center mb-6">
              <Leaf className="w-6 h-6 text-green-600 mr-3" />
              <h2 className="text-xl font-semibold text-gray-900">Calidad y Certificaciones</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Tipo de cultivo */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipo de cultivo
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => handleInputChange('tipoCultivo', 'convencional')}
                    className={`p-3 rounded-lg border-2 transition-colors ${
                      formData.tipoCultivo === 'convencional' 
                        ? 'border-green-500 bg-green-50 text-green-700' 
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    <span className="text-lg">🌾</span>
                    <div className="text-sm font-medium">Convencional</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleInputChange('tipoCultivo', 'organico')}
                    className={`p-3 rounded-lg border-2 transition-colors ${
                      formData.tipoCultivo === 'organico' 
                        ? 'border-green-500 bg-green-50 text-green-700' 
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    <span className="text-lg">🌱</span>
                    <div className="text-sm font-medium">Orgánico</div>
                  </button>
                </div>
              </div>

              {/* Condiciones de almacenamiento */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Condiciones de almacenamiento
                </label>
                <input
                  type="text"
                  value={formData.condicionesAlmacenamiento}
                  onChange={(e) => handleInputChange('condicionesAlmacenamiento', e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Lugar fresco y seco, temp. 15-20°C"
                />
              </div>
            </div>

            {/* Certificaciones */}
            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Certificaciones (selecciona las que apliquen)
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {certificacionesDisponibles.map((cert) => (
                  <button
                    key={cert}
                    type="button"
                    onClick={() => toggleCertificacion(cert)}
                    className={`p-3 rounded-lg border-2 text-left transition-colors ${
                      formData.certificaciones.includes(cert)
                        ? 'border-green-500 bg-green-50 text-green-700'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{cert}</span>
                      {formData.certificaciones.includes(cert) && (
                        <CheckCircle className="w-4 h-4 text-green-600" />
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Métodos de entrega */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center mb-6">
              <MapPin className="w-6 h-6 text-green-600 mr-3" />
              <h2 className="text-xl font-semibold text-gray-900">Entrega y Disponibilidad</h2>
            </div>

            <div className="space-y-6">
              {/* Métodos de entrega */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Métodos de entrega disponibles *
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {metodosEntregaDisponibles.map((metodo) => (
                    <button
                      key={metodo.value}
                      type="button"
                      onClick={() => toggleMetodoEntrega(metodo.value)}
                      className={`p-4 rounded-lg border-2 text-center transition-colors ${
                        formData.metodosEntrega.includes(metodo.value)
                          ? 'border-green-500 bg-green-50 text-green-700'
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      <div className="text-2xl mb-2">{metodo.icon}</div>
                      <div className="text-sm font-medium">{metodo.label}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Horarios disponibles */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Horarios disponibles para entrega/recogida
                </label>
                <input
                  type="text"
                  value={formData.horariosDisponibles}
                  onChange={(e) => handleInputChange('horariosDisponibles', e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Lunes a viernes 8:00 AM - 5:00 PM"
                />
              </div>

              {/* Ubicación */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6 pt-6 border-t border-gray-100">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4 col-span-2">Ubicación de la finca</h3>
                </div>
                
                {/* Municipio */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Municipio *
                  </label>
                  <input
                    type="text"
                    value={formData.municipio}
                    onChange={(e) => handleInputChange('municipio', e.target.value)}
                    className={`w-full px-4 py-3 rounded-lg border text-gray-900 placeholder-gray-500 ${
                      errors.municipio ? 'border-red-300' : 'border-gray-300'
                    } focus:ring-2 focus:ring-green-500 focus:border-transparent`}
                    placeholder="Ej: Medellín"
                  />
                  {errors.municipio && (
                    <p className="mt-1 text-sm text-red-600">{errors.municipio}</p>
                  )}
                </div>

                {/* Vereda */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Vereda *
                  </label>
                  <input
                    type="text"
                    value={formData.vereda}
                    onChange={(e) => handleInputChange('vereda', e.target.value)}
                    className={`w-full px-4 py-3 rounded-lg border text-gray-900 placeholder-gray-500 ${
                      errors.vereda ? 'border-red-300' : 'border-gray-300'
                    } focus:ring-2 focus:ring-green-500 focus:border-transparent`}
                    placeholder="Ej: Santa Elena"
                  />
                  {errors.vereda && (
                    <p className="mt-1 text-sm text-red-600">{errors.vereda}</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Información adicional actualizada */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center mb-6">
              <FileText className="w-6 h-6 text-green-600 mr-3" />
              <h2 className="text-xl font-semibold text-gray-900">Información Adicional</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Fecha de cosecha */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Calendar className="w-4 h-4 inline mr-1" />
                  Fecha de cosecha *
                </label>
                <input
                  type="date"
                  value={formData.fechaCosecha}
                  onChange={(e) => handleInputChange('fechaCosecha', e.target.value)}
                  className={`w-full px-4 py-3 rounded-lg border text-gray-900 ${
                    errors.fechaCosecha ? 'border-red-300' : 'border-gray-300'
                  } focus:ring-2 focus:ring-green-500 focus:border-transparent`}
                />
                {errors.fechaCosecha && (
                  <p className="mt-1 text-sm text-red-600">{errors.fechaCosecha}</p>
                )}
              </div>

              {/* Tiempo de entrega */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Clock className="w-4 h-4 inline mr-1" />
                  Tiempo de entrega (días)
                </label>
                <input
                  type="number"
                  value={formData.tiempoEntrega}
                  onChange={(e) => handleInputChange('tiempoEntrega', parseInt(e.target.value) || 1)}
                  min="1"
                  max="30"
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 text-gray-900 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Notas especiales */}
            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Info className="w-4 h-4 inline mr-1" />
                Notas especiales o instrucciones
              </label>
              <textarea
                value={formData.notasEspeciales}
                onChange={(e) => handleInputChange('notasEspeciales', e.target.value)}
                rows={3}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Instrucciones especiales de manejo, recomendaciones de uso, etc."
              />
            </div>
          </div>

          {/* Imágenes mejoradas */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center mb-6">
              <Camera className="w-6 h-6 text-green-600 mr-3" />
              <h2 className="text-xl font-semibold text-gray-900">Galería de Imágenes</h2>
              <span className="ml-auto text-sm text-gray-500">
                {formData.imagenes.length}/5 imágenes
              </span>
            </div>

            <div className="space-y-6">
              {/* Upload area mejorada */}
              <div className={`border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300 ${
                formData.imagenes.length >= 5 
                  ? 'border-gray-200 bg-gray-50' 
                  : 'border-gray-300 hover:border-green-400 hover:bg-green-50'
              }`}>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  id="image-upload"
                  disabled={formData.imagenes.length >= 5}
                />
                <label 
                  htmlFor="image-upload" 
                  className={`cursor-pointer ${formData.imagenes.length >= 5 ? 'cursor-not-allowed' : ''}`}
                >
                  <div className="flex flex-col items-center">
                    {formData.imagenes.length >= 5 ? (
                      <ImageIcon className="w-16 h-16 text-gray-300 mb-4" />
                    ) : (
                      <Upload className="w-16 h-16 text-green-500 mb-4" />
                    )}
                    
                    <h3 className="text-xl font-semibold text-gray-700 mb-2">
                      {formData.imagenes.length >= 5 
                        ? 'Límite de imágenes alcanzado' 
                        : 'Arrastra imágenes aquí'
                      }
                    </h3>
                    
                    {formData.imagenes.length < 5 && (
                      <>
                        <p className="text-gray-500 mb-4">
                          o haz clic para seleccionar archivos
                        </p>
                        <div className="bg-green-100 text-green-800 px-4 py-2 rounded-full text-sm font-medium">
                          Sube hasta 5 imágenes • JPG, PNG • Máx. 5MB cada una
                        </div>
                      </>
                    )}
                  </div>
                </label>
              </div>

              {/* URL alternativa mejorada */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-3 bg-white text-gray-500 font-medium">o</span>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Proporciona una URL de imagen
                </label>
                <div className="flex space-x-3">
                  <input
                    type="url"
                    value={formData.imageUrl}
                    onChange={(e) => handleInputChange('imageUrl', e.target.value)}
                    className="flex-1 px-4 py-3 rounded-lg border border-gray-300 text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="https://ejemplo.com/imagen.jpg"
                  />
                  {formData.imageUrl && (
                    <button
                      type="button"
                      onClick={() => handleInputChange('imageUrl', '')}
                      className="px-4 py-3 text-gray-400 hover:text-red-500 transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  )}
                </div>
              </div>

              {errors.imagenes && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex">
                    <AlertCircle className="w-5 h-5 text-red-400 mr-2 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-red-600">{errors.imagenes}</p>
                  </div>
                </div>
              )}

              {/* Preview de imágenes mejorado */}
              {previewImages.length > 0 && (
                <div>
                  <h4 className="text-lg font-medium text-gray-900 mb-4">Vista previa</h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                    {previewImages.map((preview, index) => (
                      <div key={index} className="relative group">
                        <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                          <img
                            src={preview}
                            alt={`Preview ${index + 1}`}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1.5 hover:bg-red-600 transition-colors shadow-lg opacity-0 group-hover:opacity-100"
                        >
                          <X className="w-4 h-4" />
                        </button>
                        <div className="absolute bottom-2 left-2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                          Imagen {index + 1}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Preview de URL si existe */}
              {formData.imageUrl && (
                <div>
                  <h4 className="text-lg font-medium text-gray-900 mb-4">Imagen desde URL</h4>
                  <div className="w-32 h-32 bg-gray-100 rounded-lg overflow-hidden">
                    <img
                      src={formData.imageUrl}
                      alt="Preview URL"
                      className="w-full h-full object-cover"
                      onError={() => handleInputChange('imageUrl', '')}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Botones de acción mejorados */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="space-y-6">
              {/* Estado del borrador */}
              {lastSaved && (
                <div className="flex items-center text-sm text-gray-500 bg-blue-50 rounded-lg p-3">
                  <Save className="w-4 h-4 mr-2" />
                  <span>
                    Borrador guardado automáticamente: {lastSaved.toLocaleTimeString()}
                  </span>
                </div>
              )}

              {/* Botones principales */}
              <div className="flex flex-col sm:flex-row gap-4">
                {/* Botón guardar borrador */}
                <button
                  type="button"
                  onClick={saveDraft}
                  className="flex-1 flex items-center justify-center px-6 py-4 border-2 border-gray-200 text-gray-700 rounded-xl hover:border-gray-300 hover:bg-gray-50 transition-all duration-200 font-medium"
                >
                  <Save className="w-5 h-5 mr-2" />
                  Guardar Borrador
                </button>

                {/* Botón limpiar formulario */}
                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm('¿Estás seguro de que quieres limpiar todo el formulario?')) {
                      setFormData({
                        name: '',
                        description: '',
                        categoryId: '',
                        price: 0,
                        unit: 'kg',
                        stock: 0,
                        municipio: '',
                        vereda: '',
                        imagenes: [],
                        tipoCultivo: 'convencional',
                        fechaCosecha: '',
                        tiempoEntrega: 1,
                        imageUrl: '',
                        stockMinimo: 10,
                        pesoAproximado: 0,
                        dimensiones: '',
                        condicionesAlmacenamiento: '',
                        certificaciones: [],
                        metodosEntrega: ['domicilio'],
                        horariosDisponibles: '',
                        notasEspeciales: ''
                      });
                      setPreviewImages([]);
                      setErrors({});
                      localStorage.removeItem('producto-draft');
                      setLastSaved(null);
                    }
                  }}
                  className="flex-1 flex items-center justify-center px-6 py-4 border-2 border-red-200 text-red-600 rounded-xl hover:border-red-300 hover:bg-red-50 transition-all duration-200 font-medium"
                >
                  <Trash2 className="w-5 h-5 mr-2" />
                  Limpiar Todo
                </button>
              </div>

              {/* Botón publicar principal */}
              <button
                type="submit"
                disabled={isSubmitting || calculateProgress() < 60}
                className={`w-full flex items-center justify-center px-8 py-4 rounded-xl text-white font-semibold text-lg transition-all duration-200 ${
                  isSubmitting || calculateProgress() < 60
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 transform hover:scale-[1.02] shadow-lg hover:shadow-xl'
                }`}
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-3"></div>
                    Publicando Producto...
                  </>
                ) : calculateProgress() < 60 ? (
                  <>
                    <AlertCircle className="w-6 h-6 mr-3" />
                    Completa más información para publicar
                  </>
                ) : (
                  <>
                    <Send className="w-6 h-6 mr-3" />
                    Publicar Producto
                  </>
                )}
              </button>

              {/* Información adicional */}
              <div className="bg-blue-50 rounded-lg p-4">
                <div className="flex items-start">
                  <Info className="w-5 h-5 text-blue-600 mr-3 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-blue-800">
                    <p className="font-medium mb-1">Antes de publicar:</p>
                    <ul className="space-y-1 text-blue-700">
                      <li>• Revisa que toda la información sea correcta</li>
                      <li>• Asegúrate de tener buenas fotos del producto</li>
                      <li>• Verifica los precios y disponibilidad</li>
                      <li>• Una vez publicado, será visible para todos los compradores</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </form>

        {/* Modal de Previsualización */}
        {showPreview && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              {/* Header del modal */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <h3 className="text-xl font-semibold text-gray-900">Vista Previa del Producto</h3>
                <button
                  onClick={() => setShowPreview(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Contenido del modal */}
              <div className="p-6">
                {/* Card del producto preview */}
                <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
                  {/* Imagen del producto */}
                  <div className="aspect-video bg-gray-100 relative">
                    {formData.imagenes.length > 0 ? (
                      <img
                        src={previewImages[0]}
                        alt={formData.name || 'Producto'}
                        className="w-full h-full object-cover"
                      />
                    ) : formData.imageUrl ? (
                      <img
                        src={formData.imageUrl}
                        alt={formData.name || 'Producto'}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Camera className="w-16 h-16 text-gray-400" />
                      </div>
                    )}
                    
                    {/* Badge de tipo de cultivo */}
                    {formData.tipoCultivo && (
                      <div className={`absolute top-3 left-3 px-3 py-1 rounded-full text-sm font-medium ${
                        formData.tipoCultivo === 'organico' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {formData.tipoCultivo === 'organico' ? '🌱 Orgánico' : '🌾 Convencional'}
                      </div>
                    )}

                    {/* Contador de imágenes */}
                    {formData.imagenes.length > 1 && (
                      <div className="absolute top-3 right-3 bg-black bg-opacity-70 text-white px-2 py-1 rounded text-sm">
                        +{formData.imagenes.length - 1} fotos
                      </div>
                    )}
                  </div>

                  {/* Información del producto */}
                  <div className="p-6">
                    {/* Nombre y precio */}
                    <div className="mb-4">
                      <h4 className="text-xl font-semibold text-gray-900 mb-2">
                        {formData.name || 'Nombre del producto'}
                      </h4>
                      <div className="flex items-center justify-between">
                        <span className="text-2xl font-bold text-green-600">
                          ${formData.price?.toLocaleString() || '0'} / {formData.unit}
                        </span>
                        <span className="text-sm text-gray-500">
                          Stock: {formData.stock || 0} {formData.unit}
                        </span>
                      </div>
                    </div>

                    {/* Descripción */}
                    <div className="mb-4">
                      <p className="text-gray-700 text-sm leading-relaxed">
                        {formData.description || 'Descripción del producto...'}
                      </p>
                    </div>

                    {/* Detalles en grid */}
                    <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                      {/* Ubicación */}
                      <div className="flex items-center text-gray-600">
                        <MapPin className="w-4 h-4 mr-2" />
                        <span>{formData.vereda && formData.municipio ? `${formData.vereda}, ${formData.municipio}` : 'Ubicación'}</span>
                      </div>

                      {/* Fecha de cosecha */}
                      {formData.fechaCosecha && (
                        <div className="flex items-center text-gray-600">
                          <Calendar className="w-4 h-4 mr-2" />
                          <span>Cosecha: {new Date(formData.fechaCosecha).toLocaleDateString()}</span>
                        </div>
                      )}

                      {/* Tiempo de entrega */}
                      <div className="flex items-center text-gray-600">
                        <Clock className="w-4 h-4 mr-2" />
                        <span>Entrega: {formData.tiempoEntrega} días</span>
                      </div>

                      {/* Peso aproximado */}
                      {formData.pesoAproximado && formData.pesoAproximado > 0 && (
                        <div className="flex items-center text-gray-600">
                          <Scale className="w-4 h-4 mr-2" />
                          <span>~{formData.pesoAproximado} kg</span>
                        </div>
                      )}
                    </div>

                    {/* Certificaciones */}
                    {formData.certificaciones.length > 0 && (
                      <div className="mb-4">
                        <h5 className="text-sm font-medium text-gray-700 mb-2">Certificaciones:</h5>
                        <div className="flex flex-wrap gap-2">
                          {formData.certificaciones.map((cert, index) => (
                            <span key={index} className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                              {cert}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Métodos de entrega */}
                    {formData.metodosEntrega.length > 0 && (
                      <div className="mb-4">
                        <h5 className="text-sm font-medium text-gray-700 mb-2">Métodos de entrega:</h5>
                        <div className="flex flex-wrap gap-2">
                          {formData.metodosEntrega.map((metodo, index) => {
                            const metodoInfo = metodosEntregaDisponibles.find(m => m.value === metodo);
                            return (
                              <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                                {metodoInfo?.icon} {metodoInfo?.label}
                              </span>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Condiciones de almacenamiento */}
                    {formData.condicionesAlmacenamiento && (
                      <div className="mb-4">
                        <h5 className="text-sm font-medium text-gray-700 mb-1">Almacenamiento:</h5>
                        <p className="text-sm text-gray-600">{formData.condicionesAlmacenamiento}</p>
                      </div>
                    )}

                    {/* Notas especiales */}
                    {formData.notasEspeciales && (
                      <div className="mb-4">
                        <h5 className="text-sm font-medium text-gray-700 mb-1">Notas especiales:</h5>
                        <p className="text-sm text-gray-600">{formData.notasEspeciales}</p>
                      </div>
                    )}

                    {/* Horarios */}
                    {formData.horariosDisponibles && (
                      <div className="mb-4">
                        <h5 className="text-sm font-medium text-gray-700 mb-1">Horarios disponibles:</h5>
                        <p className="text-sm text-gray-600">{formData.horariosDisponibles}</p>
                      </div>
                    )}

                    {/* Botón de contacto simulado */}
                    <div className="pt-4 border-t border-gray-100">
                      <button className="w-full bg-green-600 text-white py-3 rounded-lg font-medium hover:bg-green-700 transition-colors">
                        Contactar Agricultor
                      </button>
                    </div>
                  </div>
                </div>

                {/* Nota informativa */}
                <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-start">
                    <Info className="w-5 h-5 text-blue-600 mr-2 flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-blue-800">
                      <p className="font-medium">Vista previa</p>
                      <p>Así es como los compradores verán tu producto en el marketplace.</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer del modal */}
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
                    // Hacer scroll al botón de publicar
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
      </div>
    </div>
  );
}
