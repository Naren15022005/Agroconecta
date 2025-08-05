"use client";

import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { ShoppingBag, Package, Users, TrendingUp, Heart, Clock } from 'lucide-react';
import { useCartStore } from '@/store/cart';
import { useState, useEffect } from 'react';

interface DashboardStats {
  totalPedidos: number;
  pedidosPendientes: number;
  productosEnCarrito: number;
  totalGastado: number;
}

export default function CompradorHome() {
  const { data: session } = useSession();
  const { getTotalItems, getTotalPrice } = useCartStore();
  const [stats, setStats] = useState<DashboardStats>({
    totalPedidos: 0,
    pedidosPendientes: 0,
    productosEnCarrito: getTotalItems(),
    totalGastado: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const cargarEstadisticas = async () => {
      try {
        if (session?.user?.id || session?.user?.email) {
          const buyerId = session.user.id || session.user.email;
          const res = await fetch(`/api/pedidos?buyerId=${buyerId}`);
          
          if (res.ok) {
            const pedidos = await res.json();
            const totalPedidos = pedidos.length;
            const pedidosPendientes = pedidos.filter((p: any) => 
              ['PENDIENTE', 'CONFIRMADO', 'EN_PREPARACION', 'EN_CAMINO', 'EN_PUNTO'].includes(p.status)
            ).length;
            const totalGastado = pedidos
              .filter((p: any) => p.status === 'ENTREGADO')
              .reduce((sum: number, p: any) => sum + p.total, 0);
            
            setStats({
              totalPedidos,
              pedidosPendientes,
              productosEnCarrito: getTotalItems(),
              totalGastado
            });
          }
        }
      } catch (error) {
        console.error('Error cargando estadísticas:', error);
      } finally {
        setLoading(false);
      }
    };

    cargarEstadisticas();
  }, [session, getTotalItems]);

  // Actualizar stats cuando cambie el carrito
  useEffect(() => {
    setStats(prev => ({
      ...prev,
      productosEnCarrito: getTotalItems()
    }));
  }, [getTotalItems()]);

  const quickActions = [
    {
      title: 'Explorar Mercado',
      description: 'Descubre productos frescos de agricultores locales',
      icon: ShoppingBag,
      href: '/comprador/mercado',
      color: 'bg-green-500',
      hoverColor: 'hover:bg-green-600'
    },
    {
      title: 'Mis Pedidos',
      description: 'Revisa el estado de tus compras',
      icon: Package,
      href: '/comprador/pedidos',
      color: 'bg-blue-500',
      hoverColor: 'hover:bg-blue-600'
    },
    {
      title: 'Favoritos',
      description: 'Productos que has marcado como favoritos',
      icon: Heart,
      href: '/comprador/favoritos',
      color: 'bg-red-500',
      hoverColor: 'hover:bg-red-600'
    }
  ];

  const statsCards = [
    {
      title: 'Total Pedidos',
      value: stats.totalPedidos,
      icon: Package,
      color: 'text-blue-600 bg-blue-100'
    },
    {
      title: 'Pedidos Activos',
      value: stats.pedidosPendientes,
      icon: Clock,
      color: 'text-orange-600 bg-orange-100'
    },
    {
      title: 'En Mi Carrito',
      value: stats.productosEnCarrito,
      icon: ShoppingBag,
      color: 'text-green-600 bg-green-100'
    },
    {
      title: 'Total Gastado',
      value: `$${stats.totalGastado.toLocaleString()}`,
      icon: TrendingUp,
      color: 'text-purple-600 bg-purple-100'
    }
  ];

  return (
    <div className="py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header de bienvenida */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            ¡Hola, {session?.user?.name?.split(' ')[0] || 'Comprador'}! 👋
          </h1>
          <p className="mt-2 text-gray-600">
            Bienvenido a tu panel de comprador. Aquí puedes gestionar tus pedidos y descubrir productos frescos.
          </p>
        </div>

        {/* Estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statsCards.map((stat, index) => (
            <div key={index} className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center">
                <div className={`p-3 rounded-full ${stat.color}`}>
                  <stat.icon size={24} />
                </div>
                <div className="ml-4">
                  <h3 className="text-sm font-medium text-gray-500">{stat.title}</h3>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Acciones rápidas */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Acciones Rápidas</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {quickActions.map((action, index) => (
              <Link
                key={index}
                href={action.href}
                className="group block bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
              >
                <div className="p-6">
                  <div className="flex items-center">
                    <div className={`p-3 rounded-full ${action.color} ${action.hoverColor} text-white transition-colors`}>
                      <action.icon size={24} />
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-semibold text-gray-900 group-hover:text-green-600 transition-colors">
                        {action.title}
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">
                        {action.description}
                      </p>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Información del carrito actual */}
        {getTotalItems() > 0 && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <ShoppingBag className="text-green-600" size={24} />
                <div className="ml-3">
                  <h3 className="text-lg font-semibold text-green-800">
                    Tienes productos en tu carrito
                  </h3>
                  <p className="text-green-600">
                    {getTotalItems()} productos por ${getTotalPrice().toLocaleString()}
                  </p>
                </div>
              </div>
              <Link
                href="/comprador/mercado"
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
              >
                Finalizar Compra
              </Link>
            </div>
          </div>
        )}

        {/* Tips para compradores */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            💡 Tips para una mejor experiencia
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-2 h-2 bg-green-500 rounded-full mt-2"></div>
              <div>
                <h4 className="font-medium text-gray-900">Productos Frescos</h4>
                <p className="text-sm text-gray-600">
                  Todos nuestros productos vienen directamente de agricultores locales
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
              <div>
                <h4 className="font-medium text-gray-900">Entrega Flexible</h4>
                <p className="text-sm text-gray-600">
                  Elige entre entrega directa, punto de encuentro o recogida
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
              <div>
                <h4 className="font-medium text-gray-900">Apoyo Local</h4>
                <p className="text-sm text-gray-600">
                  Con cada compra apoyas directamente a agricultores colombianos
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-2 h-2 bg-orange-500 rounded-full mt-2"></div>
              <div>
                <h4 className="font-medium text-gray-900">Seguimiento en Tiempo Real</h4>
                <p className="text-sm text-gray-600">
                  Rastrea tus pedidos desde la preparación hasta la entrega
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
