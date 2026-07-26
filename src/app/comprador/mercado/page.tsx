"use client";
import { Suspense, useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import ProductosCatalogo from '@/components/ProductosCatalogo';
import CitySelector from '@/components/CitySelector';
import { Search, AlignJustify, Plus, Grid3X3, List, ChevronDown, X, Filter } from 'lucide-react';

export default function MercadoCompradorPage() {
  const { data: session } = useSession();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [filtroCategoria, setFiltroCategoria] = useState<string>("Todos");
  const [ordenPor, setOrdenPor] = useState<string>("recientes");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [busqueda, setBusqueda] = useState<string>("");
  const [bannerVisible, setBannerVisible] = useState(false);
  const [filtroCiudad, setFiltroCiudad] = useState<string>("Todas");
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [productosLoaded, setProductosLoaded] = useState(false);
  
  const opcionesOrden = [
    { value: "recientes", label: "Más recientes" },
    { value: "precio-asc", label: "Precio: menor a mayor" },
    { value: "precio-desc", label: "Precio: mayor a menor" },
    { value: "rating", label: "Mejor calificados" }
  ];

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

  useEffect(() => {
    const t = setTimeout(() => setBannerVisible(true), 80);
    return () => clearTimeout(t);
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
    <div className="min-h-screen bg-neutral-900 text-white overflow-x-hidden">

      <section className={`w-full relative transform transition-all duration-700 ${bannerVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
        <img
          src="/uploads/productos/mercado-banner-comprador.jpg"
          alt="Mercado de Agricultores"
          className="w-full h-[160px] sm:h-[220px] md:h-[320px] lg:h-[400px] object-cover"
        />

        <div className={`absolute inset-0 transition-opacity duration-700 ${bannerVisible ? 'opacity-100' : 'opacity-0'}`}>
          <div className="absolute inset-0 bg-black/40" />
        </div>

        <div className={`absolute inset-0 flex items-center justify-center pointer-events-none transition-opacity duration-700 ${bannerVisible ? 'opacity-100' : 'opacity-0'}`}>
          <div className="bg-transparent px-3 sm:px-6 py-1 sm:py-2 rounded-md w-full">
            <h2 className="text-lg sm:text-2xl md:text-4xl font-bold text-white text-center leading-tight max-w-3xl mx-auto px-2">
              Bienvenido al Mercado
            </h2>
          </div>
        </div>
      </section>

      <main className="w-full max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-10 py-6">
        {/* Botón flotante/superior para abrir Filtros en Móvil */}
        <div className="md:hidden mb-4">
          <button
            onClick={() => setMobileFiltersOpen(true)}
            aria-expanded={mobileFiltersOpen}
            aria-controls="mobile-filters"
            className="w-full inline-flex items-center justify-center gap-2.5 px-4 py-3 bg-neutral-800 hover:bg-neutral-750 text-white rounded-xl border border-neutral-700 shadow-md font-semibold text-sm transition-all active:scale-[0.99]"
          >
            <Filter className="w-4 h-4 text-lime-400" />
            <span>Filtros y Búsqueda</span>
          </button>
        </div>

        {/* Modal / Drawer deslizable de Filtros Móvil */}
        <div className={`fixed inset-0 z-50 md:hidden transition-opacity duration-300 ${mobileFiltersOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
          {/* Fondo oscuro traslúcido */}
          <div 
            className="absolute inset-0 bg-black/70 backdrop-blur-sm transition-opacity" 
            onClick={() => setMobileFiltersOpen(false)} 
          />

          {/* Panel Lateral Deslizable */}
          <aside 
            id="mobile-filters" 
            className={`fixed top-0 left-0 bottom-0 w-[85vw] max-w-sm bg-neutral-900 border-r border-neutral-800 p-5 shadow-2xl z-50 transform transition-transform duration-300 ease-in-out flex flex-col ${mobileFiltersOpen ? 'translate-x-0' : '-translate-x-full'}`}
          >
            {/* Header del Panel */}
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-neutral-800">
              <div className="flex items-center gap-2">
                <Filter className="w-5 h-5 text-lime-400" />
                <h3 className="text-lg font-bold text-white">Filtros de búsqueda</h3>
              </div>
              <button 
                onClick={() => setMobileFiltersOpen(false)} 
                className="p-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white transition-colors"
                aria-label="Cerrar filtros"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Contenido scrolleable */}
            <div className="flex-1 overflow-y-auto space-y-5 pr-1">
              <div>
                <label className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-2 block">Buscador</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 w-4 h-4" />
                  <input
                    type="text"
                    value={busqueda}
                    onChange={(e) => setBusqueda(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && e.preventDefault()}
                    placeholder="Buscar por nombre..."
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-neutral-800 text-white placeholder-neutral-500 border border-neutral-700 text-sm focus:outline-none focus:ring-2 focus:ring-lime-500/50"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-2 block">Categorías</label>
                <div className="flex flex-col gap-1.5">
                  {categorias.map(categoria => (
                    <button
                      key={categoria.id}
                      onClick={() => setFiltroCategoria(categoria.id)}
                      className={`w-full text-left px-3.5 py-2.5 rounded-xl text-sm font-medium border transition-all cursor-pointer ${
                        filtroCategoria === categoria.id
                          ? 'bg-gradient-to-r from-lime-600 to-lime-500 text-neutral-950 font-extrabold border-lime-500 shadow-md shadow-lime-950/40'
                          : 'bg-neutral-800/60 text-neutral-300 border-neutral-700/60 hover:bg-neutral-800 hover:text-white'
                      }`}
                    >
                      {categoria.nombre}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-2 block">Ubicación / Ciudad</label>
                <CitySelector
                  value={filtroCiudad}
                  onChange={setFiltroCiudad}
                  placeholder="Buscar ciudad o departamento..."
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-2 block">Ordenar por</label>
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="w-full text-left px-3.5 py-2.5 border border-neutral-700 rounded-xl bg-neutral-800 text-sm font-medium text-white flex items-center justify-between"
                  >
                    <span>{opcionesOrden.find(op => op.value === ordenPor)?.label}</span>
                    <ChevronDown className={`w-4 h-4 text-neutral-400 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {isDropdownOpen && (
                    <div className="absolute z-30 left-0 right-0 mt-2 bg-neutral-900 border border-neutral-700 rounded-xl overflow-hidden shadow-xl">
                      {opcionesOrden.map((opcion) => (
                        <button
                          key={opcion.value}
                          onClick={() => { setOrdenPor(opcion.value); setIsDropdownOpen(false); }}
                          className="w-full px-3.5 py-2.5 text-left text-sm font-medium text-neutral-200 hover:bg-neutral-800 border-b border-neutral-800/60 last:border-b-0"
                        >
                          {opcion.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Footer con Acciones */}
            <div className="pt-4 mt-3 border-t border-neutral-800 flex gap-3">
              <button
                onClick={() => { setBusqueda(''); setFiltroCategoria('Todos'); setFiltroCiudad('Todas'); }}
                className="flex-1 px-4 py-2.5 rounded-xl border border-neutral-700 text-xs font-semibold text-neutral-300 hover:bg-neutral-800 transition-colors text-center"
              >
                Limpiar
              </button>
              <button
                onClick={() => setMobileFiltersOpen(false)}
                className="flex-1 px-4 py-2.5 rounded-xl bg-gradient-to-r from-lime-600 to-lime-500 text-xs font-bold text-white shadow-lg shadow-lime-900/50 transition-all text-center"
              >
                Ver productos
              </button>
            </div>
          </aside>
        </div>

        <div className="mb-6">
            <div className="lg:flex lg:items-start lg:gap-6">
            <aside className="hidden lg:block w-full lg:w-72 flex-shrink-0">
              <div className="bg-neutral-800 p-4 rounded-lg border border-neutral-700 space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-neutral-100">Filtros</h3>
                  <p className="text-neutral-400 text-sm">Buscar y filtrar productos</p>
                </div>

                <div>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 w-5 h-5" />
                    <input
                      type="text"
                      value={busqueda}
                      onChange={(e) => setBusqueda(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && e.preventDefault()}
                      placeholder="Buscar productos..."
                      className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-neutral-800 text-white placeholder-neutral-500 border border-neutral-700 focus:outline-none focus:ring-2 focus:ring-green-600"
                    />
                  </div>
                </div>

                <div>
                  <div className="mt-2 flex flex-col gap-2">
                    {categorias.map(categoria => (
                      <button
                        key={categoria.id}
                        onClick={() => setFiltroCategoria(categoria.id)}
                        className={`w-full text-left px-3.5 py-2.5 rounded-xl text-sm font-medium border transition-all cursor-pointer ${
                          filtroCategoria === categoria.id
                            ? 'bg-gradient-to-r from-lime-600 to-lime-500 text-neutral-950 font-extrabold border-lime-500 shadow-md shadow-lime-950/40'
                            : 'bg-neutral-800/60 text-neutral-300 border-neutral-700/60 hover:bg-neutral-800 hover:text-white'
                        }`}
                      >
                        {categoria.nombre}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-sm text-neutral-300 font-medium">Filtrar por ciudad</label>
                  <div className="mt-2">
                    <CitySelector
                      value={filtroCiudad}
                      onChange={setFiltroCiudad}
                      placeholder="Buscar ciudad o departamento..."
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <span className="text-sm text-neutral-300 font-medium">Ordenar por</span>
                  <div className="mt-2 relative" ref={dropdownRef}>
                    <button
                      onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                      className="appearance-none w-full text-left px-3 py-2 pr-8 border border-neutral-700 rounded-md focus:ring-2 focus:ring-green-600 bg-neutral-800 text-sm font-medium text-white flex items-center justify-between"
                    >
                      <span>{opcionesOrden.find(op => op.value === ordenPor)?.label}</span>
                      <ChevronDown className={`w-4 h-4 text-neutral-400 ${isDropdownOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {isDropdownOpen && (
                      <div className="absolute z-30 left-0 right-0 mt-2 bg-neutral-900 border border-neutral-700 rounded-md overflow-hidden">
                        {opcionesOrden.map((opcion) => (
                          <button
                            key={opcion.value}
                            onClick={() => { setOrdenPor(opcion.value); setIsDropdownOpen(false); }}
                            className="w-full px-3 py-2 text-left text-sm font-medium text-white hover:bg-neutral-800 border-b border-neutral-800 last:border-b-0"
                          >
                            {opcion.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-start">
                  <button
                    onClick={() => { setBusqueda(''); setFiltroCategoria('Todos'); setFiltroCiudad('Todas'); }}
                    className="px-2.5 py-1.5 text-sm font-medium text-neutral-200 hover:text-neutral-100 rounded-md"
                  >
                    Limpiar
                  </button>
                </div>
              </div>
            </aside>

            <div className="flex-1">
              <Suspense fallback={
                <div className="flex items-center justify-center py-16">
                  <div className="text-center">
                    <div className="w-8 h-8 border-2 border-neutral-700 border-t-green-600 rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-neutral-300 text-sm">Cargando productos…</p>
                  </div>
                </div>
              }>
                <ProductosCatalogo 
                  viewMode={viewMode} 
                  filtroCategoria={filtroCategoria} 
                  ordenPor={ordenPor}
                  busqueda={busqueda}
                  filtroCiudad={filtroCiudad}
                  onLoaded={() => setProductosLoaded(true)}
                />
              </Suspense>
            </div>
          </div>
        </div>
      </main>

      <footer className="bg-neutral-900 border-t border-neutral-800 py-8 mt-12">
        <div className="w-full max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-10 text-center">
          <p className="text-neutral-400 text-sm">© 2026 AgroConecta</p>
        </div>
      </footer>
    </div>
  );
}
