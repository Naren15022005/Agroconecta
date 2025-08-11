import PagosAdminPanel from '@/components/PagosAdminPanel';
import { UserCircle, ShoppingCart, Box, ChartBar, Cog, Users, Tractor, Bolt } from 'lucide-react';

export default function PagosAdminPage() {
  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar fijo */}
      <aside className="w-64 bg-green-900 text-white flex flex-col py-8 px-4 fixed h-screen left-0 top-0 z-20 shadow-xl">
        <div className="flex items-center gap-3 mb-10 px-2">
          <Tractor size={32} className="text-green-300" />
          <span className="text-xl font-bold tracking-wide">AgroConecta</span>
        </div>
        <nav className="flex-1">
          <ul className="space-y-2">
            <li>
              <a href="/admin" className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-green-800">
                <ChartBar size={20} />
                Dashboard
              </a>
            </li>
            <li>
              <a href="/admin/productos" className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-green-800">
                <Box size={20} />
                Productos
              </a>
            </li>
            <li>
              <a href="/admin/agricultores" className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-green-800">
                <Tractor size={20} />
                Agricultores
              </a>
            </li>
            <li>
              <a href="/admin/usuarios" className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-green-800">
                <Users size={20} />
                Usuarios
              </a>
            </li>
            <li>
              <a href="/admin/pedidos" className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-green-800">
                <ShoppingCart size={20} />
                Pedidos
              </a>
            </li>
            <li>
              <a href="/admin/pagos" className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-green-800 font-semibold bg-green-800">
                <Bolt size={20} />
                Gestión de Pagos
              </a>
            </li>
            <li>
              <a href="/admin/configuracion" className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-green-800">
                <Cog size={20} />
                Configuración
              </a>
            </li>
          </ul>
        </nav>
        <div className="mt-auto px-2">
          <div className="flex items-center gap-2">
            <UserCircle size={24} />
            <span className="font-semibold">Administrador</span>
          </div>
        </div>
      </aside>

      {/* Contenido principal */}
      <main className="flex-1 ml-64 p-6">
        {/* Banner de título */}
        <section className="bg-gradient-to-br from-blue-600 to-purple-600 text-white rounded-xl p-8 mb-8 flex flex-col md:flex-row justify-between items-center shadow">
          <div>
            <h1 className="text-3xl font-bold mb-2">Gestión de Pagos</h1>
            <p className="text-lg">Administra los pagos de los agricultores y transacciones de la plataforma</p>
          </div>
          <div className="flex items-center text-6xl">
            <Bolt className="text-yellow-300" />
          </div>
        </section>

        {/* Panel de gestión de pagos */}
        <PagosAdminPanel />
      </main>
    </div>
  );
}
