import PedidosStatsClient from './PedidosStatsClient';

export default async function Page() {
  return (
    <div className="space-y-6 p-6">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Estadísticas de Pedidos</h1>
      </header>

      <PedidosStatsClient />
    </div>
  );
}
