'use client';
import { useState, useEffect } from 'react';
import { Wallet, DollarSign, TrendingUp, Clock, ArrowUp, ArrowDown } from 'lucide-react';
import { LoadingModal } from './LoadingModal';

interface WalletData {
  id: number;
  balance: number;
  totalEarnings: number;
  transactions: Array<{
    id: number;
    type: string;
    amount: number;
    description: string;
    createdAt: string;
  }>;
}

interface Statistics {
  deliveredOrders: number;
  totalEarnings: number;
  pendingWithdrawals: number;
}

interface WithdrawRequest {
  id: number;
  amount: number;
  status: string;
  requestedAt: string;
}

export default function BilleteraAgricultor() {
  const [walletData, setWalletData] = useState<WalletData | null>(null);
  const [statistics, setStatistics] = useState<Statistics | null>(null);
  const [pendingWithdrawals, setPendingWithdrawals] = useState<WithdrawRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadWalletData();
  }, []);

  const loadWalletData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/agricultor/billetera');
      const data = await response.json();

      if (data.success) {
        setWalletData(data.wallet);
        setStatistics(data.statistics);
        setPendingWithdrawals(data.pendingWithdrawals || []);
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError('Error al cargar datos de la billetera');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingModal isOpen={true} title="Cargando billetera" message="Obteniendo información de tu billetera..." />;
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600">{error}</p>
        <button 
          onClick={loadWalletData}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
      <div className="max-w-4xl mx-auto py-12 px-6">
        
        {/* Header con título y decoración */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold text-gray-900 mb-2">Mi Billetera</h1>
          <p className="text-xl text-gray-600">Gestiona tus ganancias de manera inteligente</p>
        </div>

        {/* Tarjeta principal del saldo */}
        <div className="bg-gradient-to-r from-emerald-500 via-green-500 to-teal-500 rounded-2xl shadow-lg p-8 mb-8 relative overflow-hidden group">
          {/* Efectos de fondo */}
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-600/20 via-green-600/20 to-teal-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -mr-20 -mt-20 group-hover:scale-110 transition-transform duration-500"></div>
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full -ml-16 -mb-16 group-hover:scale-110 transition-transform duration-500"></div>
          
          <div className="relative z-10 flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                  <DollarSign className="w-5 h-5 text-white" />
                </div>
                <p className="text-emerald-100 text-lg font-medium">Saldo Disponible</p>
              </div>
              <p className="text-5xl font-black text-white mb-2 tracking-tight">
                ${walletData?.balance?.toLocaleString() ?? 0}
              </p>
              <p className="text-emerald-100 text-sm flex items-center gap-1">
                <span className="w-2 h-2 bg-emerald-300 rounded-full animate-pulse"></span>
                Ganancias de tus ventas exitosas
              </p>
            </div>
            
            <div className="bg-white/15 backdrop-blur-sm p-6 rounded-2xl border border-white/20 group-hover:bg-white/20 transition-all duration-300">
              <Wallet className="w-12 h-12 text-white drop-shadow-sm" />
            </div>
          </div>
          
          {/* Barra de progreso decorativa */}
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20">
            <div className="h-full bg-white/40 w-3/4 rounded-full"></div>
          </div>
        </div>

        {/* Estadísticas útiles y acciones rápidas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Última transacción</p>
                <p className="text-lg font-semibold text-gray-900">
                  {walletData?.transactions && walletData.transactions.length > 0 
                    ? new Date(walletData.transactions[0].createdAt).toLocaleDateString('es-CO', {
                        month: 'short',
                        day: 'numeric'
                      })
                    : 'Sin actividad'
                  }
                </p>
              </div>
              <Clock className="w-8 h-8 text-blue-500" />
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total transacciones</p>
                <p className="text-lg font-semibold text-gray-900">
                  {walletData?.transactions?.length || 0}
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-500" />
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl shadow-sm p-6 border border-emerald-100 hover:shadow-md transition-shadow cursor-pointer group">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-emerald-700 mb-1">Solicitar retiro</p>
                <p className="text-lg font-semibold text-emerald-800 group-hover:text-emerald-900 transition-colors">
                  Disponible
                </p>
              </div>
              <div className="bg-emerald-100 p-2 rounded-lg group-hover:bg-emerald-200 transition-colors">
                <ArrowUp className="w-6 h-6 text-emerald-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Historial de transacciones mejorado */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100">
          <div className="bg-gray-50 px-6 py-4 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-emerald-100 p-2 rounded-lg">
                  <ArrowDown className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Historial de Transacciones</h2>
                  <p className="text-gray-500 text-sm">Últimos movimientos</p>
                </div>
              </div>
              <span className="bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full text-sm font-medium">
                {walletData?.transactions?.length || 0} registros
              </span>
            </div>
          </div>

          {walletData?.transactions && walletData.transactions.length > 0 ? (
            <div className="divide-y divide-gray-100">
              {walletData.transactions.map((transaction, index) => (
                <div 
                  key={transaction.id} 
                  className="p-4 hover:bg-gray-50 transition-colors duration-200 cursor-pointer"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        transaction.amount > 0 
                          ? 'bg-green-100 text-green-600' 
                          : 'bg-red-100 text-red-600'
                      }`}>
                        {transaction.amount > 0 ? 
                          <ArrowUp className="w-5 h-5" /> : 
                          <ArrowDown className="w-5 h-5" />
                        }
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{transaction.description}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-gray-500">#{transaction.id}</span>
                          <span className="text-xs text-gray-400">•</span>
                          <span className="text-xs text-gray-500">{transaction.type}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`text-lg font-semibold ${
                        transaction.amount > 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {transaction.amount > 0 ? '+' : ''}${Math.abs(transaction.amount).toLocaleString()}
                      </div>
                      <div className="text-sm text-gray-500">
                        {new Date(transaction.createdAt).toLocaleDateString('es-CO', {
                          month: 'short',
                          day: 'numeric'
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center">
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <Clock className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No hay transacciones</h3>
                <p className="text-gray-500 mb-4">
                  Cuando realices ventas, aquí aparecerá el historial completo de tus ganancias y movimientos.
                </p>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <p className="text-blue-700 text-sm">
                    💡 Cada venta completada generará automáticamente un registro aquí
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer con información */}
        <div className="mt-10 text-center">
          <p className="text-gray-500 text-sm">
            💡 <strong>Tip:</strong> Cada venta exitosa se refleja automáticamente en tu saldo disponible
          </p>
        </div>

      </div>
    </div>
  );
}
