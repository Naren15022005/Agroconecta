"use client";
import React, { useState } from "react";
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
  // Estados para categorías y subcategorías
  const [categorias, setCategorias] = useState<{ id: string; nombre: string }[]>([]);
  const [subcategorias, setSubcategorias] = useState<{ id: string; nombre: string; categoriaId: string }[]>([]);
  const [subcategoriasFiltradas, setSubcategoriasFiltradas] = useState<{ id: string; nombre: string; categoriaId: string }[]>([]);

  // Cargar categorías y subcategorías desde la API
  useEffect(() => {
    fetch('/api/categorias')
      .then(res => res.json())
      .then(data => setCategorias(data))
      .catch(() => setCategorias([]));
    fetch('/api/subcategorias')
      .then(res => res.json())
      .then(data => setSubcategorias(data))
      .catch(() => setSubcategorias([]));
  }, []);

  // Filtrar subcategorías según la categoría seleccionada
  useEffect(() => {
    if (formData.category) {
      setSubcategoriasFiltradas(subcategorias.filter(sub => sub.categoriaId === formData.category));
    } else {
      setSubcategoriasFiltradas([]);
    }
  }, [formData.category, subcategorias]);
  type FormDataType = {
    name: string;
    description: string;
    price: string;
    unit: string;
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
  };

  const [formData, setFormData] = useState<FormDataType>({
    name: '',
    description: '',
    price: '',
    unit: 'kg',
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
    notasEspeciales: ''
  });
  const [previewImages, setPreviewImages] = useState<string[]>([]);
  const [showPreview, setShowPreview] = useState<boolean>(false);

  // Handlers tipados
  const handleInputChange = (field: keyof FormDataType, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    let newFiles: File[] = [];
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
        <form className="space-y-10 bg-white p-8 rounded-2xl shadow-xl border border-green-300">
          {/* Bloque principal */}
          <fieldset className="border border-green-200 rounded-2xl mb-8">
            <legend className="px-4 py-2 text-lg font-bold text-green-700 flex items-center gap-2"><Package className="w-6 h-6" /> Datos principales</legend>
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <label className="block font-semibold mb-2 text-gray-800">Nombre *</label>
                <input type="text" value={formData.name} onChange={e => handleInputChange('name', e.target.value)} className="w-full border border-green-200 rounded-lg px-4 py-2 bg-white text-gray-900 placeholder-gray-400 focus:border-green-400 transition-all" placeholder="Ej: Plátano Hartón" />
              </div>
              <div>
                <label className="block font-semibold mb-2 text-gray-800">Categoría *</label>
                <select value={formData.category || ''} onChange={e => handleInputChange('category', e.target.value)} className="w-full border border-green-200 rounded-lg px-4 py-2 bg-white text-gray-900 focus:border-green-400 transition-all">
                  <option value="">Selecciona una categoría</option>
                  {categorias.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.nombre}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block font-semibold mb-2 text-gray-800">Subcategoría *</label>
                <select value={formData.subcategory} onChange={e => handleInputChange('subcategory', e.target.value)} className="w-full border border-green-200 rounded-lg px-4 py-2 bg-white text-gray-900 focus:border-green-400 transition-all">
                  <option value="">Selecciona una subcategoría</option>
                  {subcategoriasFiltradas.map(sub => (
                    <option key={sub.id} value={sub.id}>{sub.nombre}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block font-semibold mb-2 text-gray-800">Unidad</label>
                <select value={formData.unit} onChange={e => handleInputChange('unit', e.target.value)} className="w-full border border-green-200 rounded-lg px-4 py-2 bg-white text-gray-900 focus:border-green-400 transition-all">
                  {unidades.map(u => <option key={u.value} value={u.value}>{u.icon} {u.label}</option>)}
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="block font-semibold mb-2 text-gray-800">Descripción *</label>
                <textarea value={formData.description} onChange={e => handleInputChange('description', e.target.value)} className="w-full border border-green-200 rounded-lg px-4 py-2 bg-white text-gray-900 placeholder-gray-400 focus:border-green-400 transition-all" rows={3} placeholder="Describe tu producto..." />
              </div>
            </div>
          </fieldset>

          {/* Bloque precio y stock */}
          <fieldset className="border border-green-200 rounded-2xl mb-8">
            <legend className="px-4 py-2 text-lg font-bold text-green-700 flex items-center gap-2"><DollarSign className="w-6 h-6" /> Precio y Stock</legend>
            <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-8">
              <div>
                <label className="block font-semibold mb-2 text-gray-800">Precio *</label>
                <input type="number" value={formData.price} onChange={e => handleInputChange('price', e.target.value)} className="w-full border border-green-200 rounded-lg px-4 py-2 bg-white text-gray-900 placeholder-gray-400 focus:border-green-400 transition-all" placeholder="2500" />
              </div>
              <div>
                <label className="block font-semibold mb-2 text-gray-800">Stock disponible *</label>
                <input type="number" value={formData.stock} onChange={e => handleInputChange('stock', e.target.value)} className="w-full border border-green-200 rounded-lg px-4 py-2 bg-white text-gray-900 placeholder-gray-400 focus:border-green-400 transition-all" placeholder="50" />
              </div>
              <div>
                <label className="block font-semibold mb-2 text-gray-800">Stock mínimo</label>
                <input type="number" value={formData.stockMinimo} onChange={e => handleInputChange('stockMinimo', e.target.value)} className="w-full border border-green-200 rounded-lg px-4 py-2 bg-white text-gray-900 placeholder-gray-400 focus:border-green-400 transition-all" placeholder="10" />
              </div>
              <div>
                <label className="block font-semibold mb-2 text-gray-800">Peso aproximado (kg)</label>
                <input type="number" value={formData.pesoAproximado} onChange={e => handleInputChange('pesoAproximado', e.target.value)} className="w-full border border-green-200 rounded-lg px-4 py-2 bg-white text-gray-900 placeholder-gray-400 focus:border-green-400 transition-all" placeholder="1.5" />
              </div>
              <div>
                <label className="block font-semibold mb-2 text-gray-800">Dimensiones</label>
                <input type="text" value={formData.dimensiones} onChange={e => handleInputChange('dimensiones', e.target.value)} className="w-full border border-green-200 rounded-lg px-4 py-2 bg-white text-gray-900 placeholder-gray-400 focus:border-green-400 transition-all" placeholder="30cm x 20cm x 15cm" />
              </div>
            </div>
          </fieldset>

          {/* Bloque calidad y certificaciones */}
          <fieldset className="border border-green-200 rounded-2xl mb-8">
            <legend className="px-4 py-2 text-lg font-bold text-green-700 flex items-center gap-2"><Leaf className="w-6 h-6" /> Calidad y Certificaciones</legend>
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <label className="block font-semibold mb-2 text-gray-800">Tipo de cultivo</label>
                <select value={formData.tipoCultivo} onChange={e => handleInputChange('tipoCultivo', e.target.value)} className="w-full border border-green-200 rounded-lg px-4 py-2 bg-white text-gray-900 focus:border-green-400 transition-all">
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
              <input type="file" accept="image/*" multiple onChange={handleImageUpload} className="mb-2" />
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
            <button type="button" className="flex-1 flex items-center justify-center px-6 py-4 border-2 border-green-300 text-green-700 rounded-xl hover:border-green-500 hover:bg-green-50 transition font-medium">
              <Save className="w-5 h-5 mr-2" />
              Guardar Borrador
            </button>
            <button type="button" className="flex-1 flex items-center justify-center px-6 py-4 border-2 border-red-300 text-red-600 rounded-xl hover:border-red-500 hover:bg-red-50 transition font-medium">
              <Trash2 className="w-5 h-5 mr-2" />
              Limpiar Todo
            </button>
          </div>
          <button type="submit" className="w-full flex items-center justify-center px-8 py-4 rounded-xl text-white font-semibold text-lg transition bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 transform hover:scale-[1.02] shadow-lg hover:shadow-xl">
            <Send className="w-6 h-6 mr-3" />
            Publicar Producto
          </button>
        </form>

        {/* Modal de Previsualización */}
        {showPreview && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <h3 className="text-xl font-semibold text-gray-900">Vista Previa del Producto</h3>
                <button
                  onClick={() => setShowPreview(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              <div className="p-6">
                <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
                  {/* Aquí iría la card de vista previa */}
                </div>
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
      </div>
    </div>
  );
}