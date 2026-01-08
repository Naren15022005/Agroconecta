import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  // Safety: only allow in development
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'No disponible en producción' }, { status: 403 });
  }

  const session = await getServerSession(authOptions as any);
  if (!session?.user?.id) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  if (!body?.confirm) {
    return NextResponse.json({ error: 'Falta confirm=true' }, { status: 400 });
  }

  const userId = session.user.id;

  const agricultor = await prisma.agricultor.findUnique({ where: { user_id: userId }, select: { id: true } });
  const agricultorId = agricultor?.id;
  if (!agricultorId) return NextResponse.json({ error: 'Agricultor no encontrado' }, { status: 404 });

  const result = await prisma.$transaction(async (tx) => {
    // Wallet + transactions
    const wallet = await tx.wallet.findFirst({ where: { userId } });
    if (wallet) {
      await tx.walletTransaction.deleteMany({ where: { walletId: wallet.id } });
      await tx.wallet.update({ where: { id: wallet.id }, data: { balance: 0 } });
    }

    // Delete financial records for this agricultor
    const deletedSales = await tx.sale.deleteMany({ where: { vendedorId: userId } });
    const deletedPagos = await tx.pago.deleteMany({ where: { userId } });
    const deletedLiquidaciones = await tx.liquidacion.deleteMany({ where: { agricultor_id: agricultorId } });
    const deletedPaymentOrders = await tx.paymentOrder.deleteMany({ where: { agricultor_id: agricultorId } });

    // Optional: clear notifications for this user to avoid showing old payment notifications
    const deletedNotifications = await tx.notification.deleteMany({ where: { userId } });

    // Optional: clear withdraw requests for this user
    const deletedWithdrawRequests = await tx.withdrawRequest.deleteMany({ where: { userId } });

    return {
      walletReset: Boolean(wallet),
      deleted: {
        sales: deletedSales.count,
        pagos: deletedPagos.count,
        liquidaciones: deletedLiquidaciones.count,
        paymentOrders: deletedPaymentOrders.count,
        notifications: deletedNotifications.count,
        withdrawRequests: deletedWithdrawRequests.count,
      },
    };
  });

  return NextResponse.json({ ok: true, userId, agricultorId, ...result });
}
