"use client";

import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { ShoppingBag, Leaf, Heart, Star, ArrowRight, Users, Truck, CheckCircle } from 'lucide-react';
import { useCartStore } from '@/store/cart';
import { useState, useEffect } from 'react';

export default function CompradorHome() {
  const { data: session } = useSession();
  const { getTotalItems, getTotalPrice } = useCartStore();

  const featuredCategories = [
    {
      name: 'Frutas Frescas',
      description: 'Las mejores frutas de temporada',
      icon: '🍎',
      href: '/comprador/mercado?categoria=Frutas',
      gradient: 'from-red-400 to-orange-500'
    },
    {
      name: 'Verduras',
      description: 'Verduras orgánicas y frescas',
      icon: '🥬',
      href: '/comprador/mercado?categoria=Verduras',
      gradient: 'from-green-400 to-green-600'
    },
    {
      name: 'Lácteos',
      description: 'Productos lácteos artesanales',
      icon: '🥛',
      href: '/comprador/mercado?categoria=Lácteos',
      gradient: 'from-blue-400 to-blue-600'
    },
    {
      name: 'Cereales',
      description: 'Granos y cereales naturales',
      icon: '🌾',
      href: '/comprador/mercado?categoria=Cereales',
      gradient: 'from-yellow-400 to-orange-500'
    }
  ];

  const benefits = [
    {
      icon: Leaf,
      title: 'Productos 100% Naturales',
      description: 'Sin químicos ni conservantes, directo del campo a tu mesa'
    },
    {
      icon: Users,
      title: 'Apoyo a Agricultores',
      description: 'Tu compra beneficia directamente a familias campesinas'
    },
    {
      icon: Truck,
      title: 'Entrega Fresca',
      description: 'Productos recién cosechados entregados en tu puerta'
    },
    {
      icon: CheckCircle,
      title: 'Calidad Garantizada',
      description: 'Cada producto es verificado por nuestro equipo de calidad'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-green-600 via-green-700 to-green-800 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-black bg-opacity-20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-4 mb-8">
              <div className="w-20 h-20 bg-white bg-opacity-20 rounded-full flex items-center justify-center backdrop-blur-sm">
                <span className="text-4xl">🌱</span>
              </div>
              <div>
                <h1 className="text-5xl md:text-6xl font-bold tracking-tight mb-4">
                  ¡Hola, {session?.user?.name?.split(' ')[0] || 'Naren'}! 👋
                </h1>
                <p className="text-2xl text-green-100 font-light">
                  Descubre el sabor auténtico de Colombia
                </p>
              </div>
            </div>
            
            <p className="text-xl text-green-100 mb-8 max-w-3xl mx-auto leading-relaxed">
              Conecta directamente con agricultores locales y disfruta de productos frescos, 
              naturales y llenos de sabor. ¡Tu mesa merece lo mejor del campo colombiano!
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/comprador/mercado"
                className="bg-white text-green-700 px-8 py-4 rounded-xl font-bold text-lg hover:bg-green-50 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center justify-center space-x-2"
              >
                <ShoppingBag size={24} />
                <span>Explorar Mercado</span>
                <ArrowRight size={20} />
              </Link>
              
              {getTotalItems() > 0 && (
                <Link
                  href="/comprador/mercado"
                  className="bg-orange-500 text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-orange-600 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center justify-center space-x-2"
                >
                  <span>Finalizar Compra ({getTotalItems()})</span>
                  <span className="bg-white bg-opacity-20 px-2 py-1 rounded-lg text-sm">
                    ${getTotalPrice().toLocaleString()}
                  </span>
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Categorías Destacadas */}
        <section className="py-16">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Categorías Populares</h2>
            <p className="text-xl text-gray-600">Explora nuestras categorías más buscadas</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {featuredCategories.map((category, index) => (
              <Link
                key={index}
                href={category.href}
                className="group block"
              >
                <div className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:scale-105 border border-gray-100">
                  <div className={`h-32 bg-gradient-to-br ${category.gradient} flex items-center justify-center`}>
                    <span className="text-6xl filter drop-shadow-lg">{category.icon}</span>
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-green-600 transition-colors">
                      {category.name}
                    </h3>
                    <p className="text-gray-600">
                      {category.description}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Beneficios */}
        <section className="py-16">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">¿Por qué elegir AgroConecta?</h2>
            <p className="text-xl text-gray-600">Compromiso con la calidad y el apoyo a nuestros agricultores</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {benefits.map((benefit, index) => (
              <div key={index} className="text-center group">
                <div className="bg-gradient-to-br from-green-100 to-green-200 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                  <benefit.icon className="text-green-600" size={40} />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  {benefit.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {benefit.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Call to Action */}
        <section className="py-16">
          <div className="bg-gradient-to-r from-green-600 to-blue-600 rounded-3xl text-white p-12 text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-black bg-opacity-10"></div>
            <div className="relative">
              <h2 className="text-4xl font-bold mb-6">
                ¡Comienza tu experiencia AgroConecta hoy!
              </h2>
              <p className="text-xl text-green-100 mb-8 max-w-2xl mx-auto">
                Únete a miles de familias que ya disfrutan de productos frescos y apoyan a agricultores colombianos
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
                <div className="text-center">
                  <div className="text-3xl font-bold mb-2">500+</div>
                  <div className="text-green-100">Agricultores asociados</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold mb-2">10k+</div>
                  <div className="text-green-100">Familias satisfechas</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold mb-2">100%</div>
                  <div className="text-green-100">Productos naturales</div>
                </div>
              </div>
              
              <Link
                href="/comprador/mercado"
                className="inline-flex items-center space-x-3 bg-white text-green-700 px-10 py-4 rounded-xl font-bold text-lg hover:bg-green-50 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                <span>Explorar Productos</span>
                <ArrowRight size={24} />
              </Link>
            </div>
          </div>
        </section>

        {/* Testimonios */}
        <section className="py-16">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Lo que dicen nuestros clientes</h2>
            <p className="text-xl text-gray-600">Experiencias reales de familias como la tuya</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                name: "María González",
                comment: "Los productos son increíblemente frescos. Mi familia nota la diferencia en cada comida.",
                rating: 5,
                location: "Bogotá"
              },
              {
                name: "Carlos Ruiz",
                comment: "Excelente servicio y calidad. Apoyo directo a nuestros agricultores colombianos.",
                rating: 5,
                location: "Medellín"
              },
              {
                name: "Ana Martínez",
                comment: "La entrega es puntual y los precios son justos. Muy recomendado para toda la familia.",
                rating: 5,
                location: "Cali"
              }
            ].map((testimonial, index) => (
              <div key={index} className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="text-yellow-400 fill-current" size={20} />
                  ))}
                </div>
                <p className="text-gray-700 mb-6 italic leading-relaxed">
                  "{testimonial.comment}"
                </p>
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                    {testimonial.name.charAt(0)}
                  </div>
                  <div className="ml-4">
                    <div className="font-semibold text-gray-900">{testimonial.name}</div>
                    <div className="text-gray-500 text-sm">{testimonial.location}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
