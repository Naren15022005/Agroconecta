import { Bolt } from 'lucide-react';
import PagosTabs from './PagosTabs';

export default function PagosAdminPage() {
  return (
    <div className="p-6">
      <section className="bg-gradient-to-br from-blue-600 to-purple-600 text-white rounded-xl p-8 mb-8 flex flex-col md:flex-row justify-between items-center shadow">
        <div>
          <h1 className="text-3xl font-bold mb-2">Gestión de Pagos</h1>
          <p className="text-lg">Administra los pagos de los agricultores y transacciones de la plataforma</p>
        </div>
        <div className="flex items-center text-6xl">
          <Bolt className="text-yellow-300" />
        </div>
      </section>

      <PagosTabs />
    </div>
  );
}
