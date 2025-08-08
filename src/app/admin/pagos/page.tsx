import { Suspense } from 'react';
import PagosAdminPanel from '@/components/PagosAdminPanel';
import LoadingModal from '@/components/LoadingModal';

export default function AdminPagosPage() {
  return (
    <main className="min-h-screen bg-gray-50 p-4">
      <h1 className="text-2xl font-bold mb-6 text-center">Gestión de Pagos y Pedidos</h1>
      <Suspense fallback={<LoadingModal mensaje="Cargando pagos..." />}>
        <PagosAdminPanel />
      </Suspense>
    </main>
  );
}
