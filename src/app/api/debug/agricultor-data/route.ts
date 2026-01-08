import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const session = await getServerSession(authOptions as any);
    if (!session?.user?.id) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

    const userId = session.user.id;

    // Find agricultor record
    const agricultor = await prisma.agricultor.findUnique({ where: { user_id: userId } });
    const agricultorId = agricultor?.id ?? null;

    // Gather counts
    const [salesCount, ordersCount, pagosCount, liquidacionesCount, paymentOrdersCount, wallet] = await Promise.all([
      prisma.sale.count({ where: { vendedorId: userId } }),
      prisma.order.count({ where: { buyerId: userId } }),
      prisma.pago.count({ where: { userId } }),
      agricultorId ? prisma.liquidacion.count({ where: { agricultor_id: agricultorId } }) : 0,
      agricultorId ? prisma.paymentOrder.count({ where: { agricultor_id: agricultorId } }) : 0,
      prisma.wallet.findFirst({ where: { userId } }),
    ]);

    // Get some recent rows for inspection
    const [recentSales, recentOrders, recentPagos, recentLiquidaciones, recentPaymentOrders] = await Promise.all([
      prisma.sale.findMany({ where: { vendedorId: userId }, orderBy: { fecha: 'desc' }, take: 5 }),
      prisma.order.findMany({ where: { buyerId: userId }, orderBy: { createdAt: 'desc' }, take: 5 }),
      prisma.pago.findMany({ where: { userId }, orderBy: { fecha: 'desc' }, take: 5 }),
      agricultorId ? prisma.liquidacion.findMany({ where: { agricultor_id: agricultorId }, orderBy: { fecha_pago: 'desc' }, take: 5 }) : [],
      agricultorId ? prisma.paymentOrder.findMany({ where: { agricultor_id: agricultorId }, orderBy: { created_at: 'desc' }, take: 5 }) : [],
    ]);

    return NextResponse.json({
      ok: true,
      userId,
      agricultorId,
      counts: { salesCount, ordersCount, pagosCount, liquidacionesCount, paymentOrdersCount, walletBalance: wallet?.balance ?? 0 },
      recent: { recentSales, recentOrders, recentPagos, recentLiquidaciones, recentPaymentOrders }
    });
  } catch (err: any) {
    console.error('DEBUG agricultor-data error:', err);
    return NextResponse.json({ ok: false, error: err?.message || String(err) }, { status: 500 });
  }
}
