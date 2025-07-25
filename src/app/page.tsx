import Link from 'next/link'
import { Tractor, Users, ShoppingCart, TrendingUp } from 'lucide-react'

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Tractor className="h-8 w-8 text-green-600" />
              <span className="ml-2 text-2xl font-bold text-gray-900">AgroConecta</span>
            </div>
            <nav className="flex space-x-8">
              <Link href="/productos" className="text-gray-500 hover:text-gray-900">
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
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          <h1 className="text-4xl tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
            <span className="block">Conectando el Campo</span>
            <span className="block text-green-600">con tu Mesa</span>
          </h1>
          <p className="mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
            Marketplace agrícola que conecta directamente a campesinos colombianos con compradores, 
            eliminando intermediarios y promoviendo el comercio justo.
          </p>
          <div className="mt-5 max-w-md mx-auto sm:flex sm:justify-center md:mt-8">
            <div className="rounded-md shadow">
              <Link
                href="/productos"
                className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-green-600 hover:bg-green-700 md:py-4 md:text-lg md:px-10"
              >
                Ver Productos
              </Link>
            </div>
            <div className="mt-3 rounded-md shadow sm:mt-0 sm:ml-3">
              <Link
                href="/auth/registro?role=CAMPESINO"
                className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-green-600 bg-white hover:bg-gray-50 md:py-4 md:text-lg md:px-10"
              >
                Soy Campesino
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:text-center">
            <h2 className="text-base text-green-600 font-semibold tracking-wide uppercase">Características</h2>
            <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
              Una plataforma diseñada para todos
            </p>
          </div>

          <div className="mt-10">
            <div className="space-y-10 md:space-y-0 md:grid md:grid-cols-3 md:gap-x-8 md:gap-y-10">
              {/* Feature 1 */}
              <div className="relative">
                <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-green-500 text-white">
                  <Users className="h-6 w-6" />
                </div>
                <p className="ml-16 text-lg leading-6 font-medium text-gray-900">Para Campesinos</p>
                <p className="mt-2 ml-16 text-base text-gray-500">
                  Publica tus productos, gestiona inventario y recibe pedidos directamente de los compradores.
                </p>
              </div>

              {/* Feature 2 */}
              <div className="relative">
                <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-green-500 text-white">
                  <ShoppingCart className="h-6 w-6" />
                </div>
                <p className="ml-16 text-lg leading-6 font-medium text-gray-900">Para Compradores</p>
                <p className="mt-2 ml-16 text-base text-gray-500">
                  Encuentra productos frescos del campo, compra directo al productor con precios justos.
                </p>
              </div>

              {/* Feature 3 */}
              <div className="relative">
                <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-green-500 text-white">
                  <TrendingUp className="h-6 w-6" />
                </div>
                <p className="ml-16 text-lg leading-6 font-medium text-gray-900">Para Empresas</p>
                <p className="mt-2 ml-16 text-base text-gray-500">
                  Abastécete con productos agrícolas de calidad, directamente desde el origen.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-green-700">
        <div className="max-w-2xl mx-auto text-center py-16 px-4 sm:py-20 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
            <span className="block">¿Listo para comenzar?</span>
            <span className="block">Únete a AgroConecta hoy.</span>
          </h2>
          <p className="mt-4 text-lg leading-6 text-green-200">
            Forma parte de la revolución agrícola digital y conecta directamente con el campo colombiano.
          </p>
          <Link
            href="/auth/registro"
            className="mt-8 w-full inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-green-600 bg-white hover:bg-green-50 sm:w-auto"
          >
            Registrarse Ahora
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 md:flex md:items-center md:justify-between lg:px-8">
          <div className="flex justify-center space-x-6 md:order-2">
            <p className="text-center text-sm text-gray-400">
              © 2025 AgroConecta. Conectando el campo colombiano.
            </p>
          </div>
          <div className="mt-8 md:mt-0 md:order-1">
            <div className="flex items-center justify-center md:justify-start">
              <Tractor className="h-6 w-6 text-green-600" />
              <span className="ml-2 text-lg font-bold text-gray-900">AgroConecta</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
