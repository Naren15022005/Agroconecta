
"use client";
import { Suspense, useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import ProductosCatalogo from '../../../components/ProductosCatalogo';
import { Search, Filter, Plus, Grid3X3, List, ChevronDown } from 'lucide-react';

export default function MercadoPage() {
  const { data: session } = useSession();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [filtroCategoria, setFiltroCategoria] = useState<string>("Todos");
  const [ordenPor, setOrdenPor] = useState<string>("recientes");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [busqueda, setBusqueda] = useState<string>("");
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  const opcionesOrden = [
    { value: "recientes", label: "Más recientes" },
    { value: "precio-asc", label: "Precio: menor a mayor" },
    { value: "precio-desc", label: "Precio: mayor a menor" },
    { value: "rating", label: "Mejor calificados" }
  ];

  // Cerrar dropdown al hacer click fuera
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  const categorias = [
    { id: "Todos", nombre: "Todos" },
    { id: "Frutas", nombre: "Frutas" },
    { id: "Verduras", nombre: "Verduras" },
    { id: "Lácteos", nombre: "Lácteos" },
    { id: "Cereales", nombre: "Cereales" },
    { id: "Otros", nombre: "Otros" }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section Compacto */}
      <section className="bg-gradient-to-r from-green-600 via-green-700 to-green-800 text-white py-8">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-3 mb-4">
              <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center backdrop-blur-sm">
                <span className="text-2xl">🌱</span>
              </div>
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
                Mercado Agrícola Colombiano
              </h1>
            </div>
            <p className="text-green-100 mb-6 max-w-2xl mx-auto text-lg">
              Conecta con otros agricultores y explora productos frescos de toda Colombia
            </p>
            
            {/* Barra de búsqueda moderna */}
            <div className="max-w-xl mx-auto relative">
              <div className="relative group">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 group-focus-within:text-green-600 transition-colors" />
                <input
                  type="text"
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && e.preventDefault()}
                  placeholder="Buscar productos frescos..."
                  className="w-full pl-12 pr-24 py-3 rounded-xl border-0 focus:ring-3 focus:ring-green-300 focus:outline-none text-gray-700 shadow-lg placeholder-gray-400 transition-all duration-200"
                />
                <button className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-green-600 hover:bg-green-700 text-white px-4 py-1.5 rounded-lg transition-all duration-200 font-medium text-sm shadow-md hover:shadow-lg">
                  Buscar
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Barra de categorías y acciones */}
      <section className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 py-6">
            {/* Banner de categorías principales */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 flex-1">
              <div className="flex items-center space-x-2 text-gray-700 font-medium">
                <Filter className="w-5 h-5 text-green-600" />
                <span>Filtrar por categoría:</span>
              </div>
              
              <div className="flex flex-wrap gap-3">
                {categorias.map(categoria => (
                  <button
                    key={categoria.id}
                    onClick={() => setFiltroCategoria(categoria.id)}
                    className={`px-4 py-2.5 rounded-lg text-sm font-medium shadow-sm transition-all duration-200 border ${
                      filtroCategoria === categoria.id
                        ? 'bg-green-500 text-white hover:bg-green-600 border-green-500 shadow-md'
                        : 'bg-white text-gray-600 hover:bg-gray-50 hover:text-green-700 border-gray-200 hover:border-green-300'
                    }`}
                  >
                    {categoria.nombre}
                  </button>
                ))}
              </div>
            </div>
            
            {/* Botón de publicar producto (esquina derecha) solo para agricultor */}
            {session?.user?.role === 'agricultor' && (
              <a
                href="/agricultor/publicar"
                className="inline-flex items-center space-x-2 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold px-6 py-3 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 text-sm whitespace-nowrap"
              >
                <Plus className="w-5 h-5" />
                <span>Publicar Producto</span>
              </a>
            )}
          </div>
        </div>
      </section>

      {/* Contenido principal */}
      <main className="max-w-7xl mx-auto px-6 py-6">
        {/* Header de productos */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="mb-4 sm:mb-0">
            <div className="flex items-center gap-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Productos Disponibles</h2>
                <p className="text-gray-600">Explora y compra productos frescos directamente de otros agricultores</p>
              </div>
              
              {(busqueda || filtroCategoria !== "Todos") && (
                <button
                  onClick={() => {
                    setBusqueda("");
                    setFiltroCategoria("Todos");
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors duration-200"
                >
                  Limpiar filtros
                </button>
              )}
            </div>
          </div>
          
          {/* Controles de vista y ordenamiento */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mt-4 sm:mt-0">
            {/* Ordenar por */}
            <div className="flex items-center space-x-3">
              <span className="text-sm text-gray-600 font-medium whitespace-nowrap">Ordenar por:</span>
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="appearance-none px-4 py-2.5 pr-10 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white text-sm font-medium shadow-sm hover:border-green-300 hover:shadow-md transition-all duration-200 cursor-pointer min-w-[190px] text-gray-900 text-left flex items-center justify-between"
                >
                  <span>{opcionesOrden.find(op => op.value === ordenPor)?.label}</span>
                  <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />
                </button>
                
                {isDropdownOpen && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-lg z-20 overflow-hidden backdrop-blur-sm">
                    {opcionesOrden.map((opcion) => (
                      <button
                        key={opcion.value}
                        onClick={() => {
                          setOrdenPor(opcion.value);
                          setIsDropdownOpen(false);
                        }}
                        className="w-full px-4 py-3 text-left text-sm font-medium text-gray-900 hover:bg-green-50 hover:text-green-700 transition-colors duration-200 border-b border-gray-100 last:border-b-0"
                      >
                        {opcion.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
            
            {/* Opciones de vista */}
            <div className="flex items-center space-x-3">
              <span className="text-sm text-gray-600 font-medium">Vista:</span>
              <div className="flex bg-gray-50 rounded-xl p-1 border border-gray-200">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2.5 rounded-lg transition-all duration-200 ${
                    viewMode === 'grid'
                      ? 'bg-white text-green-600 shadow-sm border border-gray-200'
                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                  }`}
                  title="Vista de cuadrícula"
                >
                  <Grid3X3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2.5 rounded-lg transition-all duration-200 ${
                    viewMode === 'list'
                      ? 'bg-white text-green-600 shadow-sm border border-gray-200'
                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                  }`}
                  title="Vista de lista"
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
        
        <Suspense fallback={
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="w-16 h-16 border-4 border-green-200 border-t-green-600 rounded-full animate-spin mx-auto mb-6"></div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Cargando productos frescos</h3>
              <p className="text-gray-500">Conectando con agricultores de toda Colombia...</p>
            </div>
          </div>
        }>
          <ProductosCatalogo 
            viewMode={viewMode} 
            filtroCategoria={filtroCategoria} 
            ordenPor={ordenPor}
            busqueda={busqueda}
          />
        </Suspense>
      </main>

      {/* Footer mejorado */}
      <footer className="bg-gradient-to-r from-green-50 to-orange-50 border-t border-gray-200 py-8 mt-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:text-left">
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">🌱 AgroConecta</h4>
              <p className="text-gray-600 text-sm">
                Conectando agricultores y promoviendo el comercio justo en Colombia
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">Enlaces útiles</h4>
              <div className="space-y-2 text-sm">
                <a href="/agricultor/publicar" className="block text-gray-600 hover:text-green-600 transition-colors">Publicar producto</a>
                <a href="/agricultor/pedidos" className="block text-gray-600 hover:text-green-600 transition-colors">Mis pedidos</a>
                <a href="/agricultor/perfil" className="block text-gray-600 hover:text-green-600 transition-colors">Mi perfil</a>
              </div>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">Estadísticas</h4>
              <div className="space-y-2 text-sm text-gray-600">
                <p>🌾 132 productos activos</p>
                <p>👥 {categorias.length - 1} categorías disponibles</p>
                <p>🇨🇴 Hecho en Colombia</p>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-200 mt-8 pt-6 text-center">
            <p className="text-gray-500 text-sm">© 2025 AgroConecta — Transformando el agro colombiano 🇨🇴</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
