import Link from 'next/link'
import BrandIcon from '@/components/BrandIcon'
import { Search, Filter, ShoppingCart } from 'lucide-react'

export default function ProductosPage() {
  // Productos de ejemplo (en el futuro estos vendrán de la base de datos)
  const productos = [
    {
      id: '1',
      name: 'Mango Tommy',
      description: 'Mango Tommy fresco y dulce, cosechado en su punto óptimo',
      price: 3500,
      unit: 'kg',
      campesino: 'Juan Rodríguez',
      stock: 100,
      imageUrl: null
    },
    {
      id: '2',
      name: 'Aguacate Hass',
      description: 'Aguacate Hass premium, ideal para consumo directo',
      price: 4200,
      unit: 'kg',
      campesino: 'Juan Rodríguez',
      stock: 80,
      imageUrl: null
    },
    {
      id: '3',
      name: 'Tomate Chonto',
      description: 'Tomate chonto fresco, perfecto para ensaladas',
      price: 2800,
      unit: 'kg',
      campesino: 'Juan Rodríguez',
      stock: 150,
      imageUrl: null
    },
    {
      id: '4',
      name: 'Lechuga Crespa',
      description: 'Lechuga crespa hidropónica, sin pesticidas',
      price: 1500,
      unit: 'unidad',
      campesino: 'Juan Rodríguez',
      stock: 60,
      imageUrl: null
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center">
              <BrandIcon className="h-9 w-9" />
              <span className="ml-2 text-2xl font-bold text-gray-900">AgroConecta</span>
            </Link>
            <nav className="flex space-x-8">
              <Link href="/productos" className="text-green-600 font-medium">
                Productos
              </Link>
              <Link href="/auth/signin" className="text-gray-500 hover:text-gray-900">
                Iniciar Sesión
              </Link>
              <Link href="/auth/registro" className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700">
                Registrarse
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <div className="bg-green-700 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-extrabold text-white sm:text-5xl">
              Productos del Campo Colombiano
            </h1>
            <p className="mt-4 text-xl text-green-100">
              Encuentra productos frescos directamente de nuestros campesinos
            </p>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Buscar productos..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
            />
          </div>
          <button className="flex items-center px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50">
            <Filter className="h-5 w-5 mr-2" />
            Filtros
          </button>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {productos.map((producto) => (
            <div key={producto.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
              <div className="h-48 bg-gray-200 flex items-center justify-center">
                {producto.imageUrl ? (
                  <img 
                    src={producto.imageUrl} 
                    alt={producto.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="text-gray-400 text-center">
                    <div className="w-16 h-16 mx-auto mb-2 bg-gray-300 rounded-full flex items-center justify-center">
                      🥕
                    </div>
                    <p className="text-sm">Imagen próximamente</p>
                  </div>
                )}
              </div>
              
              <div className="p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-1">{producto.name}</h3>
                <p className="text-sm text-gray-600 mb-2">{producto.description}</p>
                <p className="text-sm text-green-600 mb-2">Por: {producto.campesino}</p>
                
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <span className="text-2xl font-bold text-green-600">
                      ${producto.price.toLocaleString()}
                    </span>
                    <span className="text-sm text-gray-500 ml-1">/{producto.unit}</span>
                  </div>
                  <span className="text-sm text-gray-500">
                    {producto.stock} disponibles
                  </span>
                </div>
                
                <button className="w-full flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors">
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  Agregar al Carrito
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {productos.length === 0 && (
          <div className="text-center py-12">
            <div className="w-24 h-24 mx-auto mb-4 bg-gray-200 rounded-full flex items-center justify-center">
              <Search className="h-12 w-12 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No hay productos disponibles</h3>
            <p className="text-gray-600 mb-4">Intenta con otros filtros o revisa más tarde</p>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="bg-white border-t">
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center">
            <BrandIcon className="h-7 w-7" />
            <span className="ml-2 text-lg font-bold text-gray-900">AgroConecta</span>
          </div>
          <p className="mt-2 text-center text-sm text-gray-400">
            © 2025 AgroConecta. Conectando el campo colombiano.
          </p>
        </div>
      </footer>
    </div>
  )
}
