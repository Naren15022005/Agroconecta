import { Suspense } from 'react';
import ProductosStats from './ProductosStats';

export const metadata = {
  title: 'Estadísticas de Productos | Admin - AgroConecta',
  description: 'Estadísticas y análisis de productos registrados en la plataforma'
};

export default function ProductosAdminPage() {
  return (
    <main className="p-6 animate-fadeIn" style={{ background: 'var(--bg)', minHeight: '100vh' }}>
      <div className="max-w-7xl mx-auto">
        <header className="mb-6">
          <h1 className="text-3xl font-bold mb-2" style={{ color: '#ffffff' }}>
            Estadísticas de Productos
          </h1>
          <p className="text-sm" style={{ color: '#94a3b8' }}>
            Análisis completo de productos, ventas y categorías en la plataforma
          </p>
        </header>

        <Suspense
          fallback={
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: 'var(--accent)' }}></div>
            </div>
          }
        >
          <ProductosStats />
        </Suspense>
      </div>
    </main>
  );
}
