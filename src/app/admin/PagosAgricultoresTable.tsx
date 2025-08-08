import { Users } from 'lucide-react';

export default async function PagosAgricultoresTable() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  let pagos;
  try {
    const res = await fetch(`${baseUrl}/api/admin/dashboard`, { cache: 'no-store' });
    const data = await res.json();
    pagos = data?.pagos;
  } catch (err) {
    pagos = undefined;
  }
  if (!Array.isArray(pagos)) {
    return (
      <div className="bg-white rounded-lg shadow p-6 mb-8 text-center text-red-600">
        Error al cargar pagos a agricultores. Verifica la conexión o intenta más tarde.
      </div>
    );
  }
  return (
    <section className="bg-white rounded-lg shadow p-6 mb-8">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold flex items-center gap-2"><Users size={24} /> Pagos a Agricultores</h3>
        <span className="text-green-700 font-semibold cursor-pointer hover:underline">Ver todos</span>
      </div>
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-gray-100">
            <th className="p-2">ID</th>
            <th className="p-2">Agricultor</th>
            <th className="p-2">Ventas Totales</th>
            <th className="p-2">Comisión</th>
            <th className="p-2">A Pagar</th>
            <th className="p-2">Estado</th>
            <th className="p-2">Acción</th>
          </tr>
        </thead>
        <tbody>
          {pagos.map((p: any) => (
            <tr key={p.id}>
              <td className="p-2">{p.id}</td>
              <td className="p-2">{p.agricultor}</td>
              <td className="p-2">{p.ventas?.toLocaleString('es-CO', { style: 'currency', currency: 'COP' }) ?? '-'}</td>
              <td className="p-2">{p.comision?.toLocaleString('es-CO', { style: 'currency', currency: 'COP' }) ?? '-'}</td>
              <td className="p-2">{typeof p.ventas === 'number' && typeof p.comision === 'number' ? (p.ventas - p.comision).toLocaleString('es-CO', { style: 'currency', currency: 'COP' }) : '-'}</td>
              <td className="p-2">
                {p.estado === 'pendiente' ? (
                  <span className="bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full">Pendiente</span>
                ) : (
                  <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full">Pagado</span>
                )}
              </td>
              <td className="p-2">
                {p.estado === 'pendiente' ? (
                  <button className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700">Pagar</button>
                ) : (
                  <button className="bg-gray-200 text-gray-700 px-3 py-1 rounded">Ver</button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
