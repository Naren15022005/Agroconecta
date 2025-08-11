import { UserCircle, ShoppingCart, Box, ChartBar, Cog, Users, Move, FileText, Star, Tractor, Bolt, Wallet } from 'lucide-react';
import DashboardCards from './DashboardCards';
import PagosAgricultoresTable from './PagosAgricultoresTable';
import { Suspense } from 'react';

// Server action para obtener datos reales
async function getAdminDashboardData() {
  const res = await fetch(process.env.NEXT_PUBLIC_API_URL + '/api/admin/dashboard', { cache: 'no-store' });
  if (!res.ok) return null;
  return res.json();
}
export default function AdminHome() {
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
              <a href="/admin" className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-green-800 font-semibold">
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
              <a href="/admin/pagos" className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-green-800">
                <Bolt size={20} />
                Gestión de Pagos
              </a>
            </li>
            <li>
              <a href="/admin/billetera" className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-green-800">
                <Wallet size={20} />
                Mi Billetera
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
        {/* Banner de bienvenida */}
        <section className="bg-gradient-to-br from-green-600 to-green-400 text-white rounded-xl p-8 mb-8 flex flex-col md:flex-row justify-between items-center shadow">
          <div>
            <h2 className="text-3xl font-bold mb-2">Bienvenido al Panel de Administración</h2>
            <p className="text-lg">Gestiona tu plataforma agropecuaria desde un solo lugar</p>
          </div>
        </section>
        {/* Cards de resumen con datos reales */}
        <Suspense fallback={<div>Cargando resumen...</div>}>
          {/* @ts-expect-error Server Component */}
          <DashboardCards />
        </Suspense>
        {/* Tabla de pagos a agricultores con datos reales */}
        <Suspense fallback={<div>Cargando pagos...</div>}>
          {/* @ts-expect-error Server Component */}
          <PagosAgricultoresTable />
        </Suspense>
        {/* Accesos rápidos */}
        <section className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow p-6 flex flex-col items-center cursor-pointer hover:bg-green-50">
            <Box size={32} className="text-green-600 mb-2" />
            <span className="font-semibold">Gestionar Productos</span>
            <span className="text-gray-500 text-sm">Agregar o editar productos</span>
          </div>
          <div className="bg-white rounded-lg shadow p-6 flex flex-col items-center cursor-pointer hover:bg-green-50">
            <Users size={32} className="text-blue-600 mb-2" />
            <span className="font-semibold">Administrar Usuarios</span>
            <span className="text-gray-500 text-sm">Clientes y agricultores</span>
          </div>
          <div className="bg-white rounded-lg shadow p-6 flex flex-col items-center cursor-pointer hover:bg-green-50">
            <Tractor size={32} className="text-orange-600 mb-2" />
            <span className="font-semibold">Agricultores</span>
            <span className="text-gray-500 text-sm">Ver y gestionar agricultores</span>
          </div>
          <div className="bg-white rounded-lg shadow p-6 flex flex-col items-center cursor-pointer hover:bg-green-50">
            <Cog size={32} className="text-purple-600 mb-2" />
            <span className="font-semibold">Configuración</span>
            <span className="text-gray-500 text-sm">Ajustes de la plataforma</span>
          </div>
        </section>
      </main>
    </div>
  );
}
