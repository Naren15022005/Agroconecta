import { TrendingUp, DollarSign, Users, Package, Activity, Zap, Activity as ActivityIcon } from 'lucide-react';

interface CardData {
  title: string;
  valueDisplay: string | number;
  valueNumeric?: number;
  icon: any;
}

export default async function DashboardCards() {
  const siteBase = process.env.NEXT_PUBLIC_SITE_URL || `http://localhost:${process.env.PORT || 3000}`;
  const url = new URL('/api/admin/dashboard', siteBase).toString();

  let resumen: any = null;
  let errorDetails = '';

  // Fetch with safer error handling (include response body on non-OK and stringify errors)
  try {
    const res = await fetch(url, { cache: 'no-store' });
    if (!res.ok) {
      let body = '<unavailable>';
      try {
        body = await res.text();
      } catch {}
      throw new Error(`HTTP ${res.status}: ${res.statusText} - ${body}`);
    }

    try {
      const data = await res.json();
      resumen = data?.resumen ?? null;
    } catch (parseErr) {
      const raw = await res.text().catch(() => '<unreadable>');
      throw new Error(`Failed to parse JSON: ${String(parseErr)} - body: ${raw}`);
    }
  } catch (rawErr) {
    const errMsg = rawErr instanceof Error ? rawErr.message : String(rawErr ?? 'null');
    // log only strings to avoid Next dev stream parsing issues
    try { console.error('DashboardCards: Error fetching data:', errMsg); } catch { console.error('DashboardCards: Error fetching data: (logging failed) ' + String(errMsg)); }
    errorDetails = errMsg;
    resumen = null;
  }

  if (!resumen) {
    return (
      <div className="rounded-lg p-6 text-center" style={{ background: '#232a34', border: '1px solid rgba(239,68,68,0.15)' }}>
        <div className="w-12 h-12 mx-auto mb-3 rounded-lg flex items-center justify-center" style={{ background: 'rgba(239,68,68,0.06)' }}>
          <ActivityIcon size={20} style={{ color: '#ef4444' }} />
        </div>
        <p className="text-sm font-semibold mb-1" style={{ color: '#ef4444' }}>Error al cargar datos</p>
        {errorDetails && <p className="text-xs" style={{ color: '#94a3b8' }}>Detalles: {errorDetails}</p>}
      </div>
    );
  }

  const formatCurrency = (val?: number | null) => {
    if (val == null) return '$ 0';
    const rounded = Math.round(val * 100) / 100;
    const cents = Math.round((Math.abs(rounded) - Math.floor(Math.abs(rounded))) * 100);
    const options: Intl.NumberFormatOptions = {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: cents === 0 ? 0 : 2,
      maximumFractionDigits: cents === 0 ? 0 : 2,
    };
    return new Intl.NumberFormat('es-CO', options).format(rounded);
  };

  const total = typeof resumen.totalRecaudado === 'number' ? resumen.totalRecaudado : Number(resumen.totalRecaudado) || 0;

  const cards: CardData[] = [
    { title: 'Total Recaudado', valueDisplay: formatCurrency(resumen.totalRecaudado ?? 0), valueNumeric: Number(resumen.totalRecaudado) || 0, icon: TrendingUp },
    { title: 'Ganancia AgroConecta', valueDisplay: formatCurrency(resumen.ganancia ?? 0), valueNumeric: Number(resumen.ganancia) || 0, icon: DollarSign },
    { title: 'A Pagar a Agricultores', valueDisplay: formatCurrency(resumen.aPagar ?? 0), valueNumeric: Number(resumen.aPagar) || 0, icon: Users },
    { title: 'Pedidos Realizados', valueDisplay: resumen.pedidos ?? 0, valueNumeric: Number(resumen.pedidos) || 0, icon: Package },
    { title: 'Ventas Realizadas', valueDisplay: resumen.ventasCount ?? 0, valueNumeric: Number(resumen.ventasCount) || 0, icon: Activity },
    { title: 'Comisiones Totales', valueDisplay: formatCurrency(resumen.comisionesTotal ?? 0), valueNumeric: Number(resumen.comisionesTotal) || 0, icon: Zap },
  ];

  return (
    <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {cards.map((card, index) => {
        const Icon = card.icon;
        let percent = 60;
        if (total > 0 && typeof card.valueNumeric === 'number') {
          percent = Math.min(100, Math.round((card.valueNumeric / total) * 100));
          if (Number.isNaN(percent)) percent = 0;
        }

        return (
          <div
            key={index}
            className="rounded-lg p-3"
            style={{
              background: '#232a34',
              border: '1px solid rgba(28,198,228,0.12)',
              boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.02)',
              minHeight: 110,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between'
            }}
          >
            <div className="flex flex-col gap-2 mb-2">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-md flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.02)' }}>
                  <Icon size={16} style={{ color: 'var(--accent)' }} />
                </div>
                <div style={{ flex: 1 }}>
                  <p className="text-xs font-medium mb-0" style={{ color: '#94a3b8' }}>{card.title}</p>
                </div>
              </div>

              <div>
                <p className="text-2xl font-semibold mt-1" style={{ color: '#ffffff' }}>{card.valueDisplay}</p>
              </div>
            </div>

            <div className="mt-1">
              <div className="h-1 w-full rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.03)' }}>
                <div className="h-full rounded-full" style={{ width: `${percent}%`, background: 'var(--accent)' }} />
              </div>
            </div>
          </div>
        );
      })}
    </section>
  );
}
