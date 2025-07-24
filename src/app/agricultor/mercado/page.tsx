
"use client";
import { Suspense, useState } from 'react';
import ProductosCatalogo from '../../../components/ProductosCatalogo';
import { Search, Filter, Plus, Grid3X3, List } from 'lucide-react';

export default function MercadoPage() {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section Compacto */}
      <section className="bg-gradient-to-r from-green-600 via-green-700 to-green-800 text-white py-8">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-3 mb-4">
              <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                <span className="text-2xl">🌱</span>
              </div>
              <h1 className="text-2xl md:text-3xl font-bold">
                Mercado Agrícola Colombiano
              </h1>
            </div>
            <p className="text-green-100 mb-6 max-w-2xl mx-auto">
              Conecta con otros agricultores y explora productos frescos
            </p>
            
            {/* Barra de búsqueda moderna */}
            <div className="max-w-xl mx-auto relative">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Buscar productos frescos..."
                  className="w-full pl-12 pr-24 py-3 rounded-xl border-0 focus:ring-3 focus:ring-green-300 focus:outline-none text-gray-700 shadow-lg"
                />
                <button className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-green-600 hover:bg-green-700 text-white px-4 py-1.5 rounded-lg transition-colors font-medium text-sm">
                  Buscar
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Barra de navegación y filtros */}
      <section className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 py-4">
            {/* Filtros y categorías */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full lg:w-auto">
              <button className="flex items-center space-x-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors text-sm font-medium">
                <Filter className="w-4 h-4" />
                <span>Filtros</span>
              </button>
              
              <div className="flex flex-wrap gap-2">
                <button className="px-3 py-1.5 bg-green-500 text-white rounded-lg text-sm font-medium shadow-sm">
                  Todos
                </button>
                <button className="px-3 py-1.5 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors text-sm">
                  Frutas
                </button>
                <button className="px-3 py-1.5 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors text-sm">
                  Verduras
                </button>
                <button className="px-3 py-1.5 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors text-sm">
                  Lácteos
                </button>
                <button className="px-3 py-1.5 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors text-sm">
                  Cereales
                </button>
                <button className="px-3 py-1.5 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors text-sm">
                  Carnes
                </button>
                <button className="px-3 py-1.5 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors text-sm">
                  Otros
                </button>
              </div>
            </div>
            
            {/* Botón de publicar */}
            <a
              href="/agricultor/publicar"
              className="inline-flex items-center space-x-2 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold px-4 py-2 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 text-sm whitespace-nowrap"
            >
              <Plus className="w-4 h-4" />
              <span>Publicar Producto</span>
            </a>
          </div>
        </div>
      </section>

      {/* Contenido principal */}
      <main className="max-w-7xl mx-auto px-6 py-6">
        {/* Header de productos */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Productos Disponibles</h2>
            <p className="text-gray-600">Explora y compra productos frescos directamente de otros agricultores</p>
          </div>
          
          {/* Opciones de vista */}
          <div className="flex items-center space-x-2 mt-4 sm:mt-0">
            <span className="text-sm text-gray-500 mr-2">Vista:</span>
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-md transition-all duration-200 ${
                  viewMode === 'grid'
                    ? 'bg-white text-green-600 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
                title="Vista de cuadrícula"
              >
                <Grid3X3 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-md transition-all duration-200 ${
                  viewMode === 'list'
                    ? 'bg-white text-green-600 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
                title="Vista de lista"
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
        
        <Suspense fallback={
          <div className="flex items-center justify-center py-16">
            <div className="text-center">
              <div className="w-12 h-12 border-4 border-green-300 border-t-green-600 rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-500">Cargando productos frescos...</p>
            </div>
          </div>
        }>
          <ProductosCatalogo viewMode={viewMode} />
        </Suspense>
      </main>

      {/* Footer simplificado */}
      <footer className="bg-white border-t border-gray-200 py-6 mt-12">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <p className="text-gray-500 text-sm">© 2025 AgroConecta — Transformando el agro colombiano 🇨🇴</p>
        </div>
      </footer>
    </div>
  );
}
