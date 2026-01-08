import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

function formatCurrency(n: number) {
  return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(n);
}

export default async function PedidosStats() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) return <div className="p-6 text-red-500">No autenticado</div>;

  const user = await prisma.user.findUnique({ where: { id: session.user.id }, include: { role: true } });
  if (!user || user.role.name !== 'ADMINISTRADOR') return <div className="p-6 text-red-500">Acceso denegado</div>;

  // Consider only confirmed & payment-validated orders for summary metrics
  const confirmedWhere = { status: 'CONFIRMADO', pagoVerificado: true } as any;
  const totalOrders = await prisma.order.count({ where: confirmedWhere });
  const totalRevenueAgg = await prisma.order.aggregate({ where: confirmedWhere, _sum: { total: true } });
  const totalRevenue = Number(totalRevenueAgg._sum.total ?? 0);

  const avgOrderAgg = await prisma.order.aggregate({ where: confirmedWhere, _avg: { total: true } });
  const averageOrder = Number(avgOrderAgg._avg.total ?? 0);

  // Keep full status distribution for admin visibility
  const ordersByStatus = await prisma.order.groupBy({ by: ['status'], _count: { _all: true } });

  // last 30 days orders per day
  const since = new Date();
  since.setDate(since.getDate() - 29);
  const ordersLast30 = await prisma.order.findMany({ where: { createdAt: { gte: since } }, select: { createdAt: true, total: true, status: true, pagoVerificado: true } });
  const ordersPerDay: Array<{ date: string; orders: number; revenue: number; statuses: Record<string, number> }> = [];
  for (let i = 0; i < 30; i++) {
    const d = new Date(since);
    d.setDate(since.getDate() + i);
    const key = d.toISOString().slice(0, 10);
    ordersPerDay.push({ date: key, orders: 0, revenue: 0, statuses: {} });
  }
  const mapIdx: Record<string, number> = {};
  ordersPerDay.forEach((v, i) => (mapIdx[v.date] = i));
  for (const o of ordersLast30) {
    const k = o.createdAt.toISOString().slice(0, 10);
    if (mapIdx[k] === undefined) continue;
    // Track status counts per day
    const entry = ordersPerDay[mapIdx[k]];
    const st = o.status || 'UNKNOWN';
    entry.statuses[st] = (entry.statuses[st] || 0) + 1;
    // Only count as 'pedido' and revenue if confirmed and payment validated
    if (st === 'CONFIRMADO' && o.pagoVerificado) {
      entry.orders += 1;
      entry.revenue += Number(o.total ?? 0);
    }
  }

  const topBuyersRaw = await prisma.order.groupBy({ by: ['buyerId'], _sum: { total: true }, _count: { _all: true }, orderBy: { _sum: { total: 'desc' } }, take: 5 });
  const topBuyers = [] as any[];
  for (const t of topBuyersRaw) {
    const buyer = await prisma.user.findUnique({ where: { id: t.buyerId } });
    topBuyers.push({ buyer: buyer ? { id: buyer.id, nombre: buyer.nombre, correo: buyer.correo } : { id: t.buyerId }, total: Number(t._sum.total ?? 0), orders: t._count._all });
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-4 gap-4">
        <div className="p-4 rounded-md" style={{ background: 'var(--card)' }}>
          <div className="text-sm" style={{ color: 'var(--muted)' }}>Pedidos Totales</div>
          <div className="text-2xl font-semibold" style={{ color: '#fff' }}>{totalOrders}</div>
        </div>
        <div className="p-4 rounded-md" style={{ background: 'var(--card)' }}>
          <div className="text-sm" style={{ color: 'var(--muted)' }}>Ingresos Totales</div>
          <div className="text-2xl font-semibold" style={{ color: '#fff' }}>{formatCurrency(totalRevenue)}</div>
        </div>
        <div className="p-4 rounded-md" style={{ background: 'var(--card)' }}>
          <div className="text-sm" style={{ color: 'var(--muted)' }}>Ticket Promedio</div>
          <div className="text-2xl font-semibold" style={{ color: '#fff' }}>{formatCurrency(averageOrder)}</div>
        </div>
        <div className="p-4 rounded-md" style={{ background: 'var(--card)' }}>
          <div className="text-sm" style={{ color: 'var(--muted)' }}>Estados</div>
          <div className="mt-2 space-y-1">
            {ordersByStatus.map(s => (
              <div key={s.status} style={{ color: 'var(--muted)', display: 'flex', justifyContent: 'space-between' }}>
                <span>{s.status}</span>
                <span style={{ color: 'var(--accent)' }}>{s._count._all}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <section className="p-4 rounded-md" style={{ background: 'var(--card)' }}>
        <h3 className="font-semibold" style={{ color: '#fff' }}>Pedidos últimos 30 días</h3>
        <div className="text-sm" style={{ color: 'var(--muted)' }}>Total por día (gráfico simplificado)</div>
        <div className="mt-4 overflow-auto">
          <table className="w-full table-auto">
            <thead>
              <tr>
                <th className="text-left text-xs" style={{ color: 'var(--muted)' }}>Fecha</th>
                <th className="text-right text-xs" style={{ color: 'var(--muted)' }}>Pedidos</th>
                <th className="text-right text-xs" style={{ color: 'var(--muted)' }}>Ingresos</th>
                <th className="text-right text-xs" style={{ color: 'var(--muted)' }}>Estados</th>
              </tr>
            </thead>
            <tbody>
              {ordersPerDay.map(r => (
                <tr key={r.date} style={{ borderTop: '1px solid rgba(255,255,255,0.03)' }}>
                  <td className="px-3 py-2" style={{ color: 'var(--muted)' }}>{r.date}</td>
                  <td className="px-3 py-2 text-right" style={{ color: 'var(--accent)' }}>{r.orders}</td>
                    <td className="px-3 py-2 text-right" style={{ color: '#fff' }}>{formatCurrency(r.revenue)}</td>
                    <td className="px-3 py-2 text-right" style={{ color: 'var(--muted)' }}>
                      {Object.keys(r.statuses).length === 0 ? '-' : Object.entries(r.statuses).map(([s,c])=>(`${s}: ${c}`)).join(' • ')}
                    </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="p-4 rounded-md" style={{ background: 'var(--card)' }}>
        <h3 className="font-semibold" style={{ color: '#fff' }}>Top Compradores</h3>
        <div className="mt-3 space-y-2">
          {topBuyers.map(t => (
            <div key={t.buyer.id} style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--muted)' }}>
              <div>
                <div style={{ color: '#fff' }}>{t.buyer.nombre || t.buyer.id}</div>
                <div style={{ color: 'var(--muted)', fontSize: 12 }}>{t.buyer.correo}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ color: 'var(--accent)' }}>{formatCurrency(t.total)}</div>
                <div style={{ color: 'var(--muted)', fontSize: 12 }}>{t.orders} pedidos</div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
