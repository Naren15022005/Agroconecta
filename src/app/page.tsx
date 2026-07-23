import Link from 'next/link'
import BrandIcon from '@/components/BrandIcon'
import MobileMenu from '@/components/MobileMenu'
import CategoryCard from '@/components/CategoryCard'
import { Users, ShoppingCart, TrendingUp, Sparkles, Activity, Package, ArrowRight, CheckCircle2 } from 'lucide-react'

const features = [
  { 
    icon: ShoppingCart, 
    title: 'Mercado Directo', 
    description: 'Conecta sin intermediarios con productores locales' 
  },
  { 
    icon: Package, 
    title: 'Productos Frescos', 
    description: 'Más de 512 productos agrícolas disponibles' 
  },
  { 
    icon: TrendingUp, 
    title: 'Ventas Seguras', 
    description: 'Sistema de pagos y seguimiento confiable' 
  }
]

// Quick stats removed per request (kept topProducts)

const categories = [
  { id: 'frutas', name: 'Frutas', description: 'Frutas frescas y tropicales', count: 120, image: '/categories/frutas.jpg' },
  { id: 'granos', name: 'Granos', description: 'Granos, semillas y cereales', count: 80, image: '/categories/granos.jpg' },
  { id: 'tuberculos', name: 'Tubérculos', description: 'yuca, papa y mas tuberculos', count: 50, image: '/categories/Tubérculos.jpg' },
  { id: 'verduras', name: 'Verduras', description: 'Hortalizas y verduras de temporada', count: 95, image: '/categories/verduraas.jpg' },
  { id: 'lacteos', name: 'Lácteos', description: 'Quesos, yogures y derivados', count: 18, image: '/categories/lacteos.jpg' },
  { id: 'dulces', name: 'Dulces', description: 'Dulces y conservas artesanales', count: 27, image: '/categories/dulces.jpg' }
]

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-900 via-neutral-900 to-neutral-800 text-white">
      {/* Header con glassmorphism (oculto en móviles; usamos el nav móvil) */}
      <header className="hidden md:block sticky top-0 z-50 bg-neutral-900/80 backdrop-blur-md border-b border-neutral-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="hidden md:flex items-center gap-3 group">
              <div className="relative">
                <div className="absolute inset-0 bg-lime-500/20 blur-xl rounded-full group-hover:bg-lime-500/30 transition-all"></div>
                <BrandIcon className="relative h-9 w-9" />
              </div>
              <div>
                <div className="text-lg font-bold bg-gradient-to-r from-lime-500 to-lime-600 bg-clip-text text-transparent">
                  AgroConecta
                </div>
                <div className="text-xs text-neutral-400">Marketplace Agrícola</div>
              </div>
            </Link>

              <nav className="hidden md:flex items-center gap-8">
              <Link href="/comprador/mercado" className="text-sm text-neutral-200 hover:text-white transition-colors">
                Mercado
              </Link>
              <Link href="/auth/signin" className="text-sm text-neutral-200 hover:text-white transition-colors">
                Iniciar sesión
              </Link>
              <Link 
                href="/auth/registro" 
                className="px-4 py-2 bg-gradient-to-r from-lime-600 to-lime-500 rounded-lg text-sm font-medium hover:from-lime-500 hover:to-lime-600 transition-all shadow-lg shadow-lime-900/50"
              >
                Registrarse
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Mobile compact nav (visible on small screens) */}
      <nav className="md:hidden mobile-nav bg-neutral-900 border-b border-neutral-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between py-3">
            <div className="flex items-center gap-3 mobile-brand">
              <Link href="/" className="flex items-center gap-2">
                <BrandIcon className="w-10 h-10" />
                <span className="text-base font-semibold text-white leading-none truncate max-w-[9rem]">AgroConecta</span>
              </Link>
            </div>

            <div className="flex items-center gap-3 mobile-actions">
              {/* Registrarse moved to mobile menu to avoid duplication */}
              {/* Mobile menu button */}
              <div className="sm:hidden">
                {/* MobileMenu is a client component */}
                <MobileMenu />
              </div>
              {/* For slightly larger mobiles show quick links */}
              <div className="hidden sm:flex items-center gap-3">
                <Link href="/comprador/mercado" className="text-sm text-neutral-200 hover:text-white">Mercado</Link>
                <Link href="/auth/signin" className="text-sm text-neutral-200 hover:text-white">Iniciar</Link>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <main>
        {/* Hero Section - Completamente rediseñado */}
        <section className="relative overflow-hidden hero">
          {/* Gradient background effects */}
          <div className="absolute inset-0">
              <div className="absolute top-0 right-0 w-64 h-64 sm:w-96 sm:h-96 bg-lime-500/10 rounded-full blur-3xl"></div>
              <div className="absolute bottom-0 left-0 w-64 h-64 sm:w-96 sm:h-96 bg-lime-500/10 rounded-full blur-3xl"></div>
            </div>

            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-28 md:py-36">
              <div className="text-center space-y-10">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-neutral-800/50 border border-neutral-700 rounded-full text-sm">
                <Sparkles className="w-4 h-4 text-lime-500" />
                <span className="text-neutral-300">Conectando el campo colombiano</span>
              </div>

              {/* Main Headline */}
                <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight leading-tight">
                  <span className="block text-white">Del Campo a</span>
                  <span className="block bg-gradient-to-r from-lime-500 via-lime-600 to-lime-500 bg-clip-text text-transparent">
                    Tu Mesa
                  </span>
                </h1>

                <p className="max-w-3xl mx-auto text-base sm:text-lg text-neutral-300">
                  Marketplace que elimina intermediarios y conecta directamente agricultores con compradores.
                  Productos frescos, precios justos y apoyo al campo — todo desde una sola plataforma.
                </p>

                {/* CTA Buttons (más prominentes) */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-6">
                  <Link 
                    href="/comprador/mercado"
                    className="group inline-flex items-center justify-center px-7 py-3 bg-gradient-to-r from-lime-600 to-lime-500 rounded-2xl text-base font-semibold text-white hover:from-lime-500 hover:to-lime-600 transition-all shadow-2xl shadow-lime-900/60 gap-3 min-w-[14rem]"
                  >
                    Explorar Mercado
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                  <Link 
                    href="/agricultor/mis-productos"
                    className="inline-flex items-center justify-center px-7 py-3 bg-neutral-800 border border-neutral-700 rounded-2xl text-base font-medium text-white hover:bg-neutral-750 transition-all min-w-[14rem]"
                  >
                    Vender Productos
                  </Link>
                </div>

              {/* Quick Stats removed */}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="relative py-20 bg-neutral-900/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                ¿Por qué AgroConecta?
              </h2>
              <p className="text-neutral-400 text-lg">
                Una plataforma diseñada para el ecosistema agrícola colombiano
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {features.map((feature, idx) => (
                <div 
                  key={idx}
                  className="group relative bg-neutral-800/50 border border-neutral-700 rounded-xl p-6 hover:bg-neutral-800 transition-all"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-lime-600/5 to-lime-500/5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    <div className="relative">
                      <div className="w-12 h-12 bg-lime-500/10 rounded-lg flex items-center justify-center mb-4 group-hover:bg-lime-500/20 transition-colors">
                        <feature.icon className="w-5 h-5 sm:w-6 sm:h-6 text-lime-500" />
                      </div>
                    <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
                    <p className="text-sm text-neutral-400">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Products Showcase */}
        <section className="relative py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8">
                  <div className="w-full sm:w-auto">
                    <h2 className="text-3xl font-bold text-white">Categorías Populares</h2>
                    <p className="text-neutral-400 mt-2">Explora tipos de productos disponibles en AgroConecta</p>
                  </div>
                  <Link
                    href="/agricultor/mercado"
                    className="self-end sm:self-auto mt-3 sm:mt-0 text-sm sm:text-base !text-white hover:!text-lime-500 flex items-center gap-2"
                  >
                    Ver todo
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {categories.map((cat) => (
                    <CategoryCard key={cat.id} cat={cat} />
                  ))}
                </div>
          </div>
        </section>

        

        {/* Trust Section */}
        {/* Trust Section - restored vertical layout with descriptions */}
        <section className="py-16 bg-neutral-900/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
              <div className="space-y-2">
                <CheckCircle2 className="w-8 h-8 text-lime-500 mx-auto" />
                <h3 className="text-lg font-semibold text-white">Pagos Seguros</h3>
                <p className="text-sm text-neutral-400">Sistema de validación robusto</p>
              </div>
              <div className="space-y-2">
                <CheckCircle2 className="w-8 h-8 text-lime-500 mx-auto" />
                <h3 className="text-lg font-semibold text-white">Agricultores Verificados</h3>
                <p className="text-sm text-neutral-400">Todos nuestros vendedores son validados</p>
              </div>
              <div className="space-y-2">
                <CheckCircle2 className="w-8 h-8 text-lime-500 mx-auto" />
                <h3 className="text-lg font-semibold text-white">Soporte 24/7</h3>
                <p className="text-sm text-neutral-400">Te ayudamos en cada paso</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="relative bg-neutral-900 border-t border-neutral-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
            {/* Mobile-first layout: brand on top, then two columns (left: Plataforma+Recursos, right: Legal) */}
            <div className="md:hidden">
              <div className="space-y-4 text-center">
                <div className="flex items-center justify-center gap-2">
                  <BrandIcon className="w-7 h-7" />
                  <span className="text-lg font-bold text-white">AgroConecta</span>
                </div>
                <p className="text-sm text-neutral-400">Conectando el campo colombiano con el mundo</p>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-6">
                <div>
                  <h4 className="text-sm font-semibold text-white mb-3 text-center">Plataforma</h4>
                  <ul className="space-y-2 text-sm text-neutral-400 text-center">
                    <li><Link href="/agricultor/mercado" className="hover:text-lime-500 transition-colors">Mercado</Link></li>
                    <li><Link href="/agricultor" className="hover:text-lime-500 transition-colors">Vender</Link></li>
                    <li><Link href="/dashboard" className="hover:text-lime-500 transition-colors">Dashboard</Link></li>
                  </ul>

                  <h4 className="text-sm font-semibold text-white mt-6 mb-3 text-center">Recursos</h4>
                  <ul className="space-y-2 text-sm text-neutral-400 text-center">
                    <li><Link href="/ayuda" className="hover:text-lime-500 transition-colors">Centro de Ayuda</Link></li>
                    <li><Link href="/contacto" className="hover:text-lime-500 transition-colors">Contacto</Link></li>
                    <li><Link href="/terminos" className="hover:text-lime-500 transition-colors">Términos</Link></li>
                  </ul>
                </div>

                <div>
                  <h4 className="text-sm font-semibold text-white mb-3 text-center">Legal</h4>
                  <ul className="space-y-2 text-sm text-neutral-400 text-center">
                    <li><Link href="/privacidad" className="hover:text-lime-500 transition-colors">Privacidad</Link></li>
                    <li><Link href="/cookies" className="hover:text-lime-500 transition-colors">Cookies</Link></li>
                    <li><Link href="/licencias" className="hover:text-lime-500 transition-colors">Licencias</Link></li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Desktop layout (md+) keeps 4-column grid */}
            <div className="hidden md:block">
              <div className="grid grid-cols-4 gap-8">
                <div className="space-y-4 text-left">
                  <div className="flex items-center gap-2">
                    <BrandIcon className="w-7 h-7" />
                    <span className="text-lg font-bold text-white">AgroConecta</span>
                  </div>
                  <p className="text-sm text-neutral-400">Conectando el campo colombiano con el mundo</p>
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-white mb-4">Plataforma</h4>
                  <ul className="space-y-2 text-sm text-neutral-400">
                    <li><Link href="/agricultor/mercado" className="hover:text-lime-500 transition-colors">Mercado</Link></li>
                    <li><Link href="/agricultor" className="hover:text-lime-500 transition-colors">Vender</Link></li>
                    <li><Link href="/dashboard" className="hover:text-lime-500 transition-colors">Dashboard</Link></li>
                  </ul>
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-white mb-4">Recursos</h4>
                  <ul className="space-y-2 text-sm text-neutral-400">
                    <li><Link href="/ayuda" className="hover:text-lime-500 transition-colors">Centro de Ayuda</Link></li>
                    <li><Link href="/contacto" className="hover:text-lime-500 transition-colors">Contacto</Link></li>
                    <li><Link href="/terminos" className="hover:text-lime-500 transition-colors">Términos</Link></li>
                  </ul>
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-white mb-4">Legal</h4>
                  <ul className="space-y-2 text-sm text-neutral-400">
                    <li><Link href="/privacidad" className="hover:text-lime-500 transition-colors">Privacidad</Link></li>
                    <li><Link href="/cookies" className="hover:text-lime-500 transition-colors">Cookies</Link></li>
                    <li><Link href="/licencias" className="hover:text-lime-500 transition-colors">Licencias</Link></li>
                  </ul>
                </div>
              </div>
            </div>
            <div className="mt-12 pt-8 border-t border-neutral-800 flex flex-col items-center gap-4 text-center sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-neutral-400">
              © {new Date().getFullYear()} AgroConecta. Todos los derechos reservados.
            </p>
            <div className="flex items-center gap-4 text-sm text-neutral-400">
              <span>Desarrollado por ArisSystems con amor por Colombia</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
