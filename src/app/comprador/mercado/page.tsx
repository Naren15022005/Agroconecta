"use client";
import { Suspense, useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import ProductosCatalogo from '../../../components/ProductosCatalogo';
import { Search, Filter, Grid3X3, List, ChevronDown } from 'lucide-react';

export default function MercadoCompradorPage() {
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
    { id: "Tubérculos", nombre: "Tubérculos" },
    { id: "Café", nombre: "Café" },
    { id: "Hierbas", nombre: "Hierbas" },
    { id: "Cereales", nombre: "Cereales" },
    { id: "Lácteos", nombre: "Lácteos" },
  ];

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 pt-8 pb-2">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div className="flex-1 flex items-center gap-2">
            <div className="relative w-full max-w-xs">
              <Search className="absolute left-3 top-2.5 text-gray-400 w-5 h-5" />
              <input
                type="text"
                className="pl-10 pr-4 py-2 w-full rounded-lg border border-gray-200 focus:ring-2 focus:ring-green-200 focus:border-green-400 outline-none text-gray-700 bg-white shadow-sm"
                placeholder="Buscar productos, agricultores..."
                value={busqueda}
                onChange={e => setBusqueda(e.target.value)}
              />
            </div>
            <div className="ml-2 relative" ref={dropdownRef}>
              <button
                className="flex items-center gap-1 px-3 py-2 rounded-lg border border-gray-200 bg-white text-gray-700 hover:bg-gray-100"
                onClick={() => setIsDropdownOpen(v => !v)}
              >
                <Filter className="w-4 h-4 mr-1" />
                {opcionesOrden.find(o => o.value === ordenPor)?.label || 'Ordenar'}
                <ChevronDown className="w-4 h-4 ml-1" />
              </button>
              {isDropdownOpen && (
                <div className="absolute z-10 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg">
                  {opcionesOrden.map(op => (
                    <button
                      key={op.value}
                      className={`block w-full text-left px-4 py-2 hover:bg-green-50 ${ordenPor === op.value ? 'text-green-700 font-semibold' : ''}`}
                      onClick={() => { setOrdenPor(op.value); setIsDropdownOpen(false); }}
                    >
                      {op.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
          <div className="flex gap-2 items-center">
            <button
              className={`p-2 rounded-lg border ${viewMode === 'grid' ? 'bg-green-100 border-green-400 text-green-700' : 'bg-white border-gray-200 text-gray-400'} transition`}
              onClick={() => setViewMode('grid')}
            >
              <Grid3X3 className="w-5 h-5" />
            </button>
            <button
              className={`p-2 rounded-lg border ${viewMode === 'list' ? 'bg-green-100 border-green-400 text-green-700' : 'bg-white border-gray-200 text-gray-400'} transition`}
              onClick={() => setViewMode('list')}
            >
              <List className="w-5 h-5" />
            </button>
          </div>
        </div>
        <div className="flex flex-wrap gap-2 mb-6">
          {categorias.map(cat => (
            <button
              key={cat.id}
              className={`px-4 py-2 rounded-full border text-sm font-medium transition ${filtroCategoria === cat.nombre ? 'bg-green-600 text-white border-green-600' : 'bg-white text-gray-700 border-gray-200 hover:bg-green-50'}`}
              onClick={() => setFiltroCategoria(cat.nombre)}
            >
              {cat.nombre}
            </button>
          ))}
        </div>
      </div>
      <Suspense fallback={
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500 mr-4"></div>
          <div>
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
  );
}
