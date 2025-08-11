'use client';
import { useState, useEffect } from 'react';
import { UserCircle, ShoppingCart, Box, ChartBar, Cog, Users, Wallet, Tractor, Bolt, TrendingUp, TrendingDown, DollarSign, Clock } from 'lucide-react';

interface BilleteraData {
  billetera: {
    id: number;
    balance: number;
    updatedAt: string;
  };
  resumen: {
    totalIngresos: number;
    totalComisiones: number;
    pendientesPago: number;
    pagosRealizados: number;
    balanceDisponible: number;
  };
  transacciones: Array<{
    id: number;
    type: string;
    amount: number;
    description: string;
    createdAt: string;
    tipoDescripcion: string;
  }>;
}

export default function BilleteraAdmin() {
  const [data, setData] = useState<BilleteraData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchBilleteraData();
  }, []);

  const fetchBilleteraData = async () => {
    try {
      const response = await fetch('/api/admin/billetera');
      if (!response.ok) {
        throw new Error('Error al cargar datos de billetera');
      }
      const result = await response.json();
      setData(result);
    } catch (err) {
      setError('Error al cargar la billetera');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-CO', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <aside className="w-64 bg-green-900 text-white flex flex-col py-8 px-4 fixed h-screen left-0 top-0 z-20 shadow-xl">
          <div className="flex items-center gap-3 mb-10 px-2">
            <Tractor size={32} className="text-green-300" />
            <span className="text-xl font-bold tracking-wide">AgroConecta</span>
          </div>
          <nav className="flex-1">
            <ul className="space-y-2">
              <li><a href="/admin" className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-green-800"><ChartBar size={20} />Dashboard</a></li>
              <li><a href="/admin/productos" className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-green-800"><Box size={20} />Productos</a></li>
              <li><a href="/admin/agricultores" className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-green-800"><Tractor size={20} />Agricultores</a></li>
              <li><a href="/admin/usuarios" className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-green-800"><Users size={20} />Usuarios</a></li>
              <li><a href="/admin/pedidos" className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-green-800"><ShoppingCart size={20} />Pedidos</a></li>
              <li><a href="/admin/pagos" className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-green-800"><Bolt size={20} />Gestión de Pagos</a></li>
              <li><a href="/admin/billetera" className="flex items-center gap-3 px-3 py-2 rounded-lg bg-green-800 font-semibold"><Wallet size={20} />Mi Billetera</a></li>
              <li><a href="/admin/configuracion" className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-green-800"><Cog size={20} />Configuración</a></li>
            </ul>
          </nav>
        </aside>
        <main className="flex-1 ml-64 p-6">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-300 rounded w-1/4 mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              {[1,2,3,4].map(i => (
                <div key={i} className="bg-white p-6 rounded-xl shadow h-32"></div>
              ))}
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen bg-gray-50 items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button 
            onClick={fetchBilleteraData}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-green-900 text-white flex flex-col py-8 px-4 fixed h-screen left-0 top-0 z-20 shadow-xl">
        <div className="flex items-center gap-3 mb-10 px-2">
          <Tractor size={32} className="text-green-300" />
          <span className="text-xl font-bold tracking-wide">AgroConecta</span>
        </div>
        <nav className="flex-1">
          <ul className="space-y-2">
            <li><a href="/admin" className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-green-800"><ChartBar size={20} />Dashboard</a></li>
            <li><a href="/admin/productos" className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-green-800"><Box size={20} />Productos</a></li>
            <li><a href="/admin/agricultores" className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-green-800"><Tractor size={20} />Agricultores</a></li>
            <li><a href="/admin/usuarios" className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-green-800"><Users size={20} />Usuarios</a></li>
            <li><a href="/admin/pedidos" className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-green-800"><ShoppingCart size={20} />Pedidos</a></li>
            <li><a href="/admin/pagos" className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-green-800"><Bolt size={20} />Gestión de Pagos</a></li>
            <li><a href="/admin/billetera" className="flex items-center gap-3 px-3 py-2 rounded-lg bg-green-800 font-semibold"><Wallet size={20} />Mi Billetera</a></li>
            <li><a href="/admin/configuracion" className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-green-800"><Cog size={20} />Configuración</a></li>
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
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Mi Billetera</h1>
          <p className="text-gray-600">Gestiona las finanzas de tu plataforma</p>
        </div>

        {/* Tarjetas de resumen */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Balance Disponible</p>
                <p className="text-2xl font-bold text-green-600">{formatCurrency(data?.resumen.balanceDisponible || 0)}</p>
              </div>
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Ingresos</p>
                <p className="text-2xl font-bold text-blue-600">{formatCurrency(data?.resumen.totalIngresos || 0)}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-blue-600" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Comisiones Ganadas</p>
                <p className="text-2xl font-bold text-purple-600">{formatCurrency(data?.resumen.totalComisiones || 0)}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-600" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pendientes Pago</p>
                <p className="text-2xl font-bold text-orange-600">{formatCurrency(data?.resumen.pendientesPago || 0)}</p>
              </div>
              <Clock className="h-8 w-8 text-orange-600" />
            </div>
          </div>
        </div>

        {/* Tabla de transacciones */}
        <div className="bg-white rounded-xl shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Historial de Transacciones</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipo</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Descripción</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Monto</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {data?.transacciones.map((transaccion) => (
                  <tr key={transaccion.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        transaccion.type === 'INGRESO' ? 'bg-green-100 text-green-800' :
                        transaccion.type === 'COMISION' ? 'bg-purple-100 text-purple-800' :
                        transaccion.type === 'PENDIENTE_PAGO' ? 'bg-orange-100 text-orange-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {transaccion.tipoDescripcion}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">{transaccion.description}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`text-sm font-medium ${
                        transaccion.amount >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {transaccion.amount >= 0 ? '+' : ''}{formatCurrency(transaccion.amount)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(transaccion.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {data?.transacciones.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500">No hay transacciones registradas</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
