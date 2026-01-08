import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

    const user = await prisma.user.findUnique({ where: { id: session.user.id }, include: { role: true } });
    if (!user || user.role.name !== 'ADMINISTRADOR') return NextResponse.json({ error: 'Acceso denegado' }, { status: 403 });

    // Optional date range filter: ?start=YYYY-MM-DD&end=YYYY-MM-DD
    const url = new URL(request.url);
    const startParam = url.searchParams.get('start');
    const endParam = url.searchParams.get('end');
    let startDate: Date | null = null;
    let endDate: Date | null = null;
    if (startParam) {
      const s = new Date(startParam + 'T00:00:00Z');
      if (!isNaN(s.getTime())) startDate = s;
    }
    if (endParam) {
      const e = new Date(endParam + 'T23:59:59Z');
      if (!isNaN(e.getTime())) endDate = e;
    }

    // default to last 30 days if no range provided
    if (!startDate || !endDate) {
      endDate = new Date();
      startDate = new Date();
      startDate.setDate(endDate.getDate() - 29);
    }

    const whereRange: any = { createdAt: { gte: startDate, lte: endDate } };

    // For summary totals consider CONFIRMADO and ENTREGADO orders with payment validated
    const paidWhere = { ...whereRange, status: { in: ['CONFIRMADO', 'ENTREGADO'] }, pagoVerificado: true };
    const totalOrders = await prisma.order.count({ where: paidWhere });
    const totalRevenueAgg = await prisma.order.aggregate({ where: paidWhere, _sum: { total: true } });
    const totalRevenue = Number(totalRevenueAgg._sum.total ?? 0);

    const avgOrderAgg = await prisma.order.aggregate({ where: paidWhere, _avg: { total: true } });
    const averageOrder = Number(avgOrderAgg._avg.total ?? 0);

    // Keep full status distribution for admin visibility (use original date range)
    const ordersByStatus = await prisma.order.groupBy({ by: ['status'], where: whereRange, _count: { _all: true } });

    // Orders per day for the selected range
    const msPerDay = 24 * 60 * 60 * 1000;
    const days = Math.ceil((endDate.getTime() - startDate.getTime()) / msPerDay) + 1;
    const cap = Math.min(days, 365);
    const from = new Date(startDate);
    const to = new Date(startDate);
    to.setDate(to.getDate() + (cap - 1));

    // load orders in range but exclude CANCELADO for per-day computations
    const ordersInRange = await prisma.order.findMany({ where: { createdAt: { gte: from, lte: to }, status: { not: 'CANCELADO' } }, select: { createdAt: true, total: true, status: true, pagoVerificado: true } });
    const ordersPerDay: Record<string, { orders: number; revenue: number; statuses: Record<string, number> }> = {};
    for (let i = 0; i < cap; i++) {
      const d = new Date(from);
      d.setDate(from.getDate() + i);
      const key = d.toISOString().slice(0, 10);
      ordersPerDay[key] = { orders: 0, revenue: 0, statuses: {} };
    }
    for (const o of ordersInRange) {
      const k = o.createdAt.toISOString().slice(0, 10);
      if (!ordersPerDay[k]) ordersPerDay[k] = { orders: 0, revenue: 0, statuses: {} };
      // count status per day
      const st = o.status || 'UNKNOWN';
      ordersPerDay[k].statuses[st] = (ordersPerDay[k].statuses[st] || 0) + 1;
      // count revenue/orders for CONFIRMADO or ENTREGADO when pagoVerificado === true
      if ((st === 'CONFIRMADO' || st === 'ENTREGADO') && o.pagoVerificado) {
        ordersPerDay[k].orders += 1;
        ordersPerDay[k].revenue += Number(o.total ?? 0);
      }
    }

    // Top buyers by total spent in range
    const topBuyersRaw = await prisma.order.groupBy({ by: ['buyerId'], where: whereRange, _sum: { total: true }, _count: { _all: true }, orderBy: { _sum: { total: 'desc' } }, take: 5 });
    const topBuyers = [] as any[];
    for (const t of topBuyersRaw) {
      const buyer = await prisma.user.findUnique({ where: { id: t.buyerId } });
      topBuyers.push({ buyer: buyer ? { id: buyer.id, nombre: buyer.nombre, correo: buyer.correo } : { id: t.buyerId }, total: Number(t._sum.total ?? 0), orders: t._count._all });
    }

    return NextResponse.json({ resumen: { totalOrders, totalRevenue, averageOrder, ordersByStatus }, ordersPerDay, topBuyers });
  } catch (err) {
    console.error('GET /api/admin/pedidos/stats', err);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}
