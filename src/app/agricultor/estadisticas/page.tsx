"use client";
import { useEffect, useState } from "react";
import { Wallet, TrendingUp, DollarSign, CheckCircle, Clock, Calendar } from "lucide-react";

interface BilleteraStats {
  saldoDisponible: number;
  totalVentasMes: number;
  totalVentasMesNeto: number;
  totalIngresosAcumulados: number;
  totalIngresosNeto: number;
  comisionPlataforma: number;
  comisionPlataformaMes: number;
  pedidosCompletados: number;
  totalPagosRecibidos: number;
  pendienteLiquidacion: number;
  cantidadPagosRecibidos: number;
}

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(amount || 0);

export default function EstadisticasPage() {
  const [data, setData] = useState<BilleteraStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("/api/agricultor/billetera");
        if (!res.ok) throw new Error("Error al cargar estadísticas");
        const json = await res.json();
        setData(json);
      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-900 flex items-center justify-center text-neutral-200">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-neutral-700 border-t-green-600 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-neutral-300">Cargando estadísticas...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-neutral-900 flex items-center justify-center text-neutral-200">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-600/20 border border-red-700 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">⚠️</span>
          </div>
          <p className="text-red-400">{error || "No se encontraron datos"}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-900 text-neutral-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center gap-3 mb-8">
          <div className="p-2 bg-green-600 rounded-lg">
            <TrendingUp className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Estadísticas</h1>
            <p className="text-sm text-neutral-400">Cifras y balances generales</p>
          </div>
        </div>

        {/* Resumen principal */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <StatCard title="Saldo en billetera" value={formatCurrency(data.saldoDisponible)} icon={<Wallet className="w-5 h-5 text-green-400" />} />
          <StatCard title="Ingresos netos acumulados" value={formatCurrency(data.totalIngresosNeto)} icon={<DollarSign className="w-5 h-5 text-green-400" />} />
          <StatCard title="Ventas brutas acumuladas" value={formatCurrency(data.totalIngresosAcumulados)} icon={<TrendingUp className="w-5 h-5 text-green-400" />} />
          <StatCard title="Ventas netas este mes" value={formatCurrency(data.totalVentasMesNeto || data.totalVentasMes)} icon={<Calendar className="w-5 h-5 text-green-400" />} />
          <StatCard title="Pendiente de liquidación" value={formatCurrency(data.pendienteLiquidacion)} icon={<Clock className="w-5 h-5 text-yellow-300" />} accent="yellow" />
          <StatCard title="Pedidos completados" value={String(data.pedidosCompletados)} icon={<CheckCircle className="w-5 h-5 text-green-400" />} />
          <StatCard title="Pagos recibidos" value={String(data.cantidadPagosRecibidos)} icon={<DollarSign className="w-5 h-5 text-green-400" />} />
          <StatCard title="Total pagado" value={formatCurrency(data.totalPagosRecibidos)} icon={<DollarSign className="w-5 h-5 text-green-400" />} />
        </div>

        {/* Resumen del mes eliminado por solicitud */}
      </div>
    </div>
  );
}

function StatCard({ title, value, icon, accent }: { title: string; value: string; icon: React.ReactNode; accent?: "red" | "yellow" }) {
  return (
    <div className="rounded-xl p-5 bg-neutral-800 border border-neutral-700">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm text-neutral-300">{title}</span>
        <div className={`p-2 rounded-lg ${accent === "red" ? "bg-red-600/15 border border-red-700/40" : accent === "yellow" ? "bg-yellow-600/15 border border-yellow-700/40" : "bg-neutral-900/60 border border-neutral-700"}`}>{icon}</div>
      </div>
      <div className={`text-2xl font-bold ${accent === "red" ? "text-red-300" : accent === "yellow" ? "text-yellow-300" : "text-neutral-100"}`}>{value}</div>
    </div>
  );
}

function MiniStat({ label, value, accent }: { label: string; value: string; accent?: "red" | "yellow" }) {
  return (
    <div className="rounded-lg p-4 bg-neutral-900/60 border border-neutral-700">
      <div className="text-xs text-neutral-400 mb-1">{label}</div>
      <div className={`text-lg font-semibold ${accent === "red" ? "text-red-300" : accent === "yellow" ? "text-yellow-300" : "text-neutral-100"}`}>{value}</div>
    </div>
  );
}
