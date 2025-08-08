import { Move, ChartBar, Tractor, ShoppingCart, Wallet, FileText, Bolt } from 'lucide-react';

export default async function DashboardCards() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  let r;
  try {
    const res = await fetch(`${baseUrl}/api/admin/dashboard`, { cache: 'no-store' });
    const data = await res.json();
    r = data?.resumen;
  } catch (err) {
    r = undefined;
  }
  if (!r) {
    return (
      <div className="bg-white rounded-lg shadow p-6 mb-8 text-center text-red-600">
        Error al cargar datos del dashboard. Verifica la conexión o intenta más tarde.
      </div>
    );
  }
  return (
    <section className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
      <div className="bg-white rounded-lg shadow p-6 flex flex-col items-start">
        <span className="text-gray-500 mb-2">Total Recaudado</span>
        <span className="text-2xl font-bold text-green-700 mb-2">{r.totalRecaudado?.toLocaleString('es-CO', { style: 'currency', currency: 'COP' }) ?? '-'}</span>
        <Move size={32} className="text-green-400" />
      </div>
      <div className="bg-white rounded-lg shadow p-6 flex flex-col items-start">
        <span className="text-gray-500 mb-2">Ganancia AgroConecta</span>
        <span className="text-2xl font-bold text-blue-700 mb-2">{r.ganancia?.toLocaleString('es-CO', { style: 'currency', currency: 'COP' }) ?? '-'}</span>
        <ChartBar size={32} className="text-blue-400" />
      </div>
      <div className="bg-white rounded-lg shadow p-6 flex flex-col items-start">
        <span className="text-gray-500 mb-2">A Pagar a Agricultores</span>
        <span className="text-2xl font-bold text-orange-700 mb-2">{r.aPagar?.toLocaleString('es-CO', { style: 'currency', currency: 'COP' }) ?? '-'}</span>
        <Tractor size={32} className="text-orange-400" />
      </div>
      <div className="bg-white rounded-lg shadow p-6 flex flex-col items-start">
        <span className="text-gray-500 mb-2">Pedidos Realizados</span>
        <span className="text-2xl font-bold text-purple-700 mb-2">{r.pedidos ?? '-'}</span>
        <ShoppingCart size={32} className="text-purple-400" />
      </div>
      <div className="bg-white rounded-lg shadow p-6 flex flex-col items-start">
        <span className="text-gray-500 mb-2">Saldo Total Billeteras</span>
        <span className="text-2xl font-bold text-green-700 mb-2">{r.totalWallets?.toLocaleString('es-CO', { style: 'currency', currency: 'COP' }) ?? '-'}</span>
        <Wallet size={32} className="text-green-400" />
      </div>
      <div className="bg-white rounded-lg shadow p-6 flex flex-col items-start">
        <span className="text-gray-500 mb-2">Ventas Realizadas</span>
        <span className="text-2xl font-bold text-blue-700 mb-2">{r.ventasCount ?? '-'}</span>
        <FileText size={32} className="text-blue-400" />
      </div>
      <div className="bg-white rounded-lg shadow p-6 flex flex-col items-start">
        <span className="text-gray-500 mb-2">Comisiones Totales</span>
        <span className="text-2xl font-bold text-orange-700 mb-2">{r.comisionesTotal?.toLocaleString('es-CO', { style: 'currency', currency: 'COP' }) ?? '-'}</span>
        <Bolt size={32} className="text-orange-400" />
      </div>
      <div className="bg-white rounded-lg shadow p-6 flex flex-col items-start">
        <span className="text-gray-500 mb-2">Impuestos Totales</span>
        <span className="text-2xl font-bold text-purple-700 mb-2">{r.impuestosTotal?.toLocaleString('es-CO', { style: 'currency', currency: 'COP' }) ?? '-'}</span>
        <ChartBar size={32} className="text-purple-400" />
      </div>
    </section>
  );
}
