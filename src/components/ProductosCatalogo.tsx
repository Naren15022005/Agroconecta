"use client";
import { useState } from 'react';
import { Heart, Star, MapPin, Calendar, User } from 'lucide-react';

interface Producto {
  id: number;
  nombre: string;
  descripcion: string;
  precio: number;
  unidad: string;
  categoria: string;
  agricultor: string;
  ubicacion: string;
  fecha: string;
  imagen: string;
  rating: number;
  isFavorite: boolean;
}

const productosDemo: Producto[] = [
  {
    id: 1,
    nombre: "Plátano Hartón Premium",
    descripcion: "Plátanos frescos y maduros, ideales para cocinar. Cultivados de forma orgánica en las montañas de Antioquia.",
    precio: 2500,
    unidad: "kg",
    categoria: "Frutas",
    agricultor: "Carlos Mejía",
    ubicacion: "Medellín, Antioquia",
    fecha: "Hace 2 horas",
    imagen: "🍌",
    rating: 4.8,
    isFavorite: false
  },
  {
    id: 2,
    nombre: "Yuca Criolla Fresca",
    descripcion: "Yuca recién cosechada, perfecta para preparaciones tradicionales. Sin químicos, cultivo natural.",
    precio: 1800,
    unidad: "kg",
    categoria: "Tubérculos",
    agricultor: "María Rodríguez",
    ubicacion: "Cali, Valle del Cauca",
    fecha: "Hace 5 horas",
    imagen: "🥔",
    rating: 4.6,
    isFavorite: true
  },
  {
    id: 3,
    nombre: "Café Especial Arábica",
    descripcion: "Granos de café premium, tostado medio. Aroma intenso y sabor único de la región cafetera.",
    precio: 15000,
    unidad: "500g",
    categoria: "Café",
    agricultor: "José Herrera",
    ubicacion: "Manizales, Caldas",
    fecha: "Hace 1 día",
    imagen: "☕",
    rating: 4.9,
    isFavorite: false
  },
  {
    id: 4,
    nombre: "Aguacate Hass Orgánico",
    descripcion: "Aguacates cremosos y nutritivos, cultivados sin pesticidas. Perfectos para guacamole y ensaladas.",
    precio: 3200,
    unidad: "kg",
    categoria: "Frutas",
    agricultor: "Ana López",
    ubicacion: "Bogotá, Cundinamarca",
    fecha: "Hace 3 horas",
    imagen: "🥑",
    rating: 4.7,
    isFavorite: true
  },
  {
    id: 5,
    nombre: "Cilantro Fresco",
    descripcion: "Cilantro aromático recién cortado, ideal para sazonar comidas típicas colombianas.",
    precio: 800,
    unidad: "manojo",
    categoria: "Hierbas",
    agricultor: "Pedro Sánchez",
    ubicacion: "Bucaramanga, Santander",
    fecha: "Hace 6 horas",
    imagen: "🌿",
    rating: 4.5,
    isFavorite: false
  },
  {
    id: 6,
    nombre: "Maíz Amarillo Tierno",
    descripcion: "Mazorcas de maíz dulce y tierno, perfectas para arepas y sopas tradicionales.",
    precio: 1200,
    unidad: "unidad",
    categoria: "Cereales",
    agricultor: "Luis García",
    ubicacion: "Barranquilla, Atlántico",
    fecha: "Hace 4 horas",
    imagen: "🌽",
    rating: 4.4,
    isFavorite: false
  },
  {
    id: 7,
    nombre: "Queso Campesino Fresco",
    descripcion: "Queso artesanal elaborado con leche fresca de vacas criollas. Sabor auténtico y textura cremosa.",
    precio: 8500,
    unidad: "kg",
    categoria: "Lácteos",
    agricultor: "Esperanza Morales",
    ubicacion: "Boyacá, Cundinamarca",
    fecha: "Hace 1 hora",
    imagen: "🧀",
    rating: 4.8,
    isFavorite: false
  },
  {
    id: 8,
    nombre: "Leche Fresca de Vaca",
    descripcion: "Leche entera recién ordeñada, sin procesar. Rica en nutrientes y con el sabor tradicional del campo.",
    precio: 3500,
    unidad: "litro",
    categoria: "Lácteos",
    agricultor: "Roberto Jiménez",
    ubicacion: "Ubaté, Cundinamarca",
    fecha: "Hace 30 minutos",
    imagen: "🥛",
    rating: 4.9,
    isFavorite: true
  }
];

export default function ProductosCatalogo({ viewMode = 'grid' }: { viewMode?: 'grid' | 'list' }) {
  const [productos, setProductos] = useState<Producto[]>(productosDemo);
  const [filtroCategoria, setFiltroCategoria] = useState<string>("Todas");
  const [ordenPor, setOrdenPor] = useState<string>("recientes");

  const categorias = ["Todas", "Frutas", "Tubérculos", "Café", "Hierbas", "Cereales", "Lácteos"];

  const toggleFavorite = (id: number) => {
    setProductos(prev => 
      prev.map(producto => 
        producto.id === id ? { ...producto, isFavorite: !producto.isFavorite } : producto
      )
    );
  };

  const productosFiltrados = productos
    .filter(producto => filtroCategoria === "Todas" || producto.categoria === filtroCategoria)
    .sort((a, b) => {
      switch (ordenPor) {
        case "precio-asc":
          return a.precio - b.precio;
        case "precio-desc":
          return b.precio - a.precio;
        case "rating":
          return b.rating - a.rating;
        default:
          return 0;
      }
    });

  const formatearPrecio = (precio: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(precio);
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${
          i < Math.floor(rating) 
            ? 'fill-yellow-400 text-yellow-400' 
            : 'text-gray-300'
        }`}
      />
    ));
  };

  return (
    <div className="space-y-8">
      {/* Filtros y ordenamiento */}
      <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Filtrar por categoría</h3>
            <div className="flex flex-wrap gap-2">
              {categorias.map(categoria => (
                <button
                  key={categoria}
                  onClick={() => setFiltroCategoria(categoria)}
                  className={`px-4 py-2 rounded-full transition-all duration-300 font-medium hover:scale-105 active:scale-95 ${
                    filtroCategoria === categoria
                      ? 'bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg hover:shadow-xl'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:shadow-md'
                  }`}
                >
                  {categoria}
                </button>
              ))}
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Ordenar por
            </label>
            <select
              value={ordenPor}
              onChange={(e) => setOrdenPor(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white"
            >
              <option value="recientes">Más recientes</option>
              <option value="precio-asc">Precio: menor a mayor</option>
              <option value="precio-desc">Precio: mayor a menor</option>
              <option value="rating">Mejor calificados</option>
            </select>
          </div>
        </div>
      </div>

      {/* Grid/Lista de productos */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {productosFiltrados.map((producto) => (
            <div
              key={producto.id}
              className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 overflow-hidden group"
            >
              {/* Imagen del producto */}
              <div className="relative bg-gradient-to-br from-green-50 to-orange-50 p-8 text-center">
                <div className="text-6xl mb-4 hover:scale-110 transition-transform duration-300 cursor-pointer">
                  {producto.imagen}
                </div>
                <button
                  onClick={() => toggleFavorite(producto.id)}
                  className={`absolute top-4 right-4 p-2 rounded-full transition-all duration-300 hover:scale-110 active:scale-95 ${
                    producto.isFavorite
                      ? 'bg-red-500 text-white shadow-lg hover:bg-red-600'
                      : 'bg-white text-gray-400 hover:text-red-500 hover:bg-red-50 shadow-md'
                  }`}
                >
                  <Heart className={`w-5 h-5 ${producto.isFavorite ? 'fill-current' : ''}`} />
                </button>
              </div>

              {/* Contenido del producto */}
              <div className="p-6 space-y-4">
                {/* Header con nombre y precio */}
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900 mb-1 hover:text-green-600 transition-colors duration-200 cursor-pointer">
                      {producto.nombre}
                    </h3>
                    <div className="flex items-center space-x-1 mb-2">
                      {renderStars(producto.rating)}
                      <span className="text-sm text-gray-600 ml-2">({producto.rating})</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-green-600 hover:text-green-700 transition-colors duration-200">
                      {formatearPrecio(producto.precio)}
                    </div>
                    <div className="text-sm text-gray-500">por {producto.unidad}</div>
                  </div>
                </div>

                {/* Descripción */}
                <p className="text-gray-600 text-sm leading-relaxed line-clamp-2">
                  {producto.descripcion}
                </p>

                {/* Información del agricultor */}
                <div className="space-y-2 pt-2 border-t border-gray-100">
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <User className="w-4 h-4 text-green-500" />
                    <span className="font-medium">{producto.agricultor}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <MapPin className="w-4 h-4 text-orange-500" />
                    <span>{producto.ubicacion}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Calendar className="w-4 h-4 text-blue-500" />
                    <span>{producto.fecha}</span>
                  </div>
                </div>

                {/* Botón de acción */}
                <div className="pt-4">
                  <button className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]">
                    Comprar Ahora
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {productosFiltrados.map((producto) => (
            <div
              key={producto.id}
              className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 overflow-hidden"
            >
              <div className="flex flex-col md:flex-row">
                {/* Imagen en vista lista */}
                <div className="relative bg-gradient-to-br from-green-50 to-orange-50 p-6 md:w-48 flex items-center justify-center">
                  <div className="text-4xl hover:scale-110 transition-transform duration-300 cursor-pointer">
                    {producto.imagen}
                  </div>
                  <button
                    onClick={() => toggleFavorite(producto.id)}
                    className={`absolute top-3 right-3 p-2 rounded-full transition-all duration-300 hover:scale-110 active:scale-95 ${
                      producto.isFavorite
                        ? 'bg-red-500 text-white shadow-lg hover:bg-red-600'
                        : 'bg-white text-gray-400 hover:text-red-500 hover:bg-red-50 shadow-md'
                    }`}
                  >
                    <Heart className={`w-4 h-4 ${producto.isFavorite ? 'fill-current' : ''}`} />
                  </button>
                </div>

                {/* Contenido en vista lista */}
                <div className="flex-1 p-6">
                  <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-4">
                    {/* Información principal */}
                    <div className="flex-1">
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 mb-3">
                        <h3 className="text-xl font-bold text-gray-900 hover:text-green-600 transition-colors duration-200 cursor-pointer">
                          {producto.nombre}
                        </h3>
                        <div className="text-right">
                          <div className="text-xl font-bold text-green-600">
                            {formatearPrecio(producto.precio)}
                          </div>
                          <div className="text-sm text-gray-500">por {producto.unidad}</div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-1 mb-3">
                        {renderStars(producto.rating)}
                        <span className="text-sm text-gray-600 ml-2">({producto.rating})</span>
                      </div>

                      <p className="text-gray-600 text-sm leading-relaxed mb-4 line-clamp-2">
                        {producto.descripcion}
                      </p>

                      {/* Información del agricultor en línea */}
                      <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-4">
                        <div className="flex items-center space-x-1">
                          <User className="w-4 h-4 text-green-500" />
                          <span className="font-medium">{producto.agricultor}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <MapPin className="w-4 h-4 text-orange-500" />
                          <span>{producto.ubicacion}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Calendar className="w-4 h-4 text-blue-500" />
                          <span>{producto.fecha}</span>
                        </div>
                      </div>
                    </div>

                    {/* Botón de acción */}
                    <div className="lg:ml-6">
                      <button className="w-full lg:w-auto bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] whitespace-nowrap">
                        Comprar Ahora
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Mensaje cuando no hay productos */}
      {productosFiltrados.length === 0 && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🌾</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            No hay productos en esta categoría
          </h3>
          <p className="text-gray-600">
            Intenta seleccionar una categoría diferente o ajustar los filtros.
          </p>
        </div>
      )}
    </div>
  );
}
