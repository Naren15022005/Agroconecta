'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  unit: string;
  imageUrl: string;
  stock: number;
  category: {
    id: string;
    name: string;
  };
  agricultor: {
    id: string;
    user: {
      nombre: string;
      correo: string;
    };
  };
}

export default function MercadoPage() {
  const { data: session } = useSession();
  const [productos, setProductos] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const cargarProductos = async () => {
      try {
        const res = await fetch('/api/productos');
        
        if (res.ok) {
          const data = await res.json();
          setProductos(data);
        } else {
          setError('Error al cargar productos');
        }
      } catch (err) {
        setError('Error de conexión');
        setError('Error de conexión');
      } finally {
        setLoading(false);
      }
    };

    cargarProductos();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando productos...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Mercado AgroConecta</h1>
          <p className="mt-2 text-lg text-gray-600">
            Descubre productos frescos directamente de nuestros agricultores
          </p>
          <div className="mt-4 flex items-center space-x-4">
            <span className="text-sm text-gray-500">
              {productos.length} productos disponibles
            </span>
            {session && (
              <span className="text-sm text-green-600">
                Bienvenido, {session.user?.name}
              </span>
            )}
          </div>
        </div>

        {/* Grid de productos */}
        {productos.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">🥕</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No hay productos disponibles
            </h3>
            <p className="text-gray-500">
              Los agricultores aún no han publicado productos. ¡Vuelve pronto!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {productos.map((producto) => (
              <div 
                key={producto.id} 
                className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden"
              >
                {/* Imagen del producto */}
                <div className="h-48 bg-gray-200 relative">
                  {producto.imageUrl ? (
                    <img
                      src={producto.imageUrl}
                      alt={producto.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.src = '/placeholder-product.jpg';
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      <span className="text-4xl">🥬</span>
                    </div>
                  )}
                  {/* Badge de categoría */}
                  <div className="absolute top-2 left-2">
                    <span className="bg-green-600 text-white text-xs px-2 py-1 rounded-full">
                      {producto.category.name}
                    </span>
                  </div>
                </div>

                {/* Contenido de la tarjeta */}
                <div className="p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-1">
                    {producto.name}
                  </h3>
                  
                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                    {producto.description}
                  </p>

                  {/* Precio */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="text-2xl font-bold text-green-600">
                      ${producto.price.toLocaleString()}
                      <span className="text-sm font-normal text-gray-500">
                        /{producto.unit}
                      </span>
                    </div>
                    <div className="text-sm text-gray-500">
                      Stock: {producto.stock}
                    </div>
                  </div>

                  {/* Agricultor */}
                  <div className="text-xs text-gray-500 mb-3">
                    Por: {producto.agricultor.user.nombre}
                  </div>

                  {/* Botón de acción */}
                  <button className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors duration-200 font-medium">
                    Agregar al Carrito
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
