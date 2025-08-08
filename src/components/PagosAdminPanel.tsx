'use client';
import { useEffect, useState } from 'react';
import { CheckCircle, XCircle, RefreshCw } from 'lucide-react';
import { LoadingModal } from './LoadingModal';

interface Pago {
  id: string;
  comprador: string;
  agricultor: string;
  monto: number;
  estado: 'pendiente' | 'liberado' | 'devuelto';
  comprobanteUrl?: string;
  fecha: string;
}

export default function PagosAdminPanel() {
  const [pagos, setPagos] = useState<Pago[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Simulación de fetch a la API de pagos
    setTimeout(() => {
      setPagos([
        {
          id: 'PAG001',
          comprador: 'Juan Pérez',
          agricultor: 'Carlos Gómez',
          monto: 120000,
          estado: 'pendiente',
          comprobanteUrl: '/uploads/comprobante1.jpg',
          fecha: '2025-08-08',
        },
        {
          id: 'PAG002',
          comprador: 'Empresa XYZ',
          agricultor: 'Ana Torres',
          monto: 350000,
          estado: 'liberado',
          comprobanteUrl: '/uploads/comprobante2.jpg',
          fecha: '2025-08-07',
        },
        {
          id: 'PAG003',
          comprador: 'Luis Martínez',
          agricultor: 'Pedro Ruiz',
          monto: 80000,
          estado: 'devuelto',
          comprobanteUrl: '/uploads/comprobante3.jpg',
          fecha: '2025-08-06',
        },
      ]);
      setLoading(false);
    }, 1200);
  }, []);

  const handleLiberarPago = (id: string) => {
    setPagos((prev) =>
      prev.map((p) => (p.id === id ? { ...p, estado: 'liberado' } : p))
    );
  };

  const handleDevolverPago = (id: string) => {
    setPagos((prev) =>
      prev.map((p) => (p.id === id ? { ...p, estado: 'devuelto' } : p))
    );
  };

  if (loading) return <LoadingModal isOpen={true} title="Cargando pagos" message="Por favor espera mientras se cargan los pagos registrados..." />;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <section className="max-w-4xl mx-auto bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold mb-4">Pagos registrados</h2>
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-gray-100">
            <th className="p-2">ID</th>
            <th className="p-2">Comprador</th>
            <th className="p-2">Agricultor</th>
            <th className="p-2">Monto</th>
            <th className="p-2">Estado</th>
            <th className="p-2">Comprobante</th>
            <th className="p-2">Fecha</th>
            <th className="p-2">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {pagos.map((pago) => (
            <tr key={pago.id} className="border-b">
              <td className="p-2 font-mono">{pago.id}</td>
              <td className="p-2">{pago.comprador}</td>
              <td className="p-2">{pago.agricultor}</td>
              <td className="p-2">${pago.monto.toLocaleString()}</td>
              <td className="p-2">
                {pago.estado === 'pendiente' && (
                  <span className="text-yellow-600 flex items-center gap-1"><RefreshCw size={16} /> Pendiente</span>
                )}
                {pago.estado === 'liberado' && (
                  <span className="text-green-600 flex items-center gap-1"><CheckCircle size={16} /> Liberado</span>
                )}
                {pago.estado === 'devuelto' && (
                  <span className="text-red-600 flex items-center gap-1"><XCircle size={16} /> Devuelto</span>
                )}
              </td>
              <td className="p-2">
                {pago.comprobanteUrl ? (
                  <a href={pago.comprobanteUrl} target="_blank" rel="noopener" className="underline text-blue-600">Ver</a>
                ) : '—'}
              </td>
              <td className="p-2">{pago.fecha}</td>
              <td className="p-2">
                {pago.estado === 'pendiente' && (
                  <div className="flex gap-2">
                    <button
                      className="px-2 py-1 bg-green-100 text-green-700 rounded hover:bg-green-200"
                      onClick={() => handleLiberarPago(pago.id)}
                    >Liberar</button>
                    <button
                      className="px-2 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200"
                      onClick={() => handleDevolverPago(pago.id)}
                    >Devolver</button>
                  </div>
                )}
                {(pago.estado === 'liberado' || pago.estado === 'devuelto') && (
                  <span className="text-gray-400">—</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
