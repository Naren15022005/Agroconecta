import { prisma } from '../src/lib/prisma';

function getArgValue(flag: string) {
  const idx = process.argv.indexOf(flag);
  if (idx === -1) return undefined;
  return process.argv[idx + 1];
}

async function main() {
  const userId = getArgValue('--userId');
  const agricultorId = getArgValue('--agricultorId');
  const confirm = process.argv.includes('--confirm');

  if (!userId || !agricultorId) {
    throw new Error('Uso: npx tsx scripts/reset-agricultor-financials.ts --userId <USER_ID> --agricultorId <AGRIC_ID> --confirm');
  }
  if (!confirm) {
    throw new Error('Falta --confirm (operación destructiva).');
  }

  const result = await prisma.$transaction(async (tx) => {
    const wallet = await tx.wallet.findFirst({ where: { userId } });
    if (wallet) {
      await tx.walletTransaction.deleteMany({ where: { walletId: wallet.id } });
      await tx.wallet.update({ where: { id: wallet.id }, data: { balance: 0 } });
    }

    // Sales may have dependent rows (comisiones/impuestos). Delete dependents first.
    const saleIds = (await tx.sale.findMany({ where: { vendedorId: userId }, select: { id: true } })).map(s => s.id);
    if (saleIds.length > 0) {
      await tx.comision.deleteMany({ where: { ventaId: { in: saleIds } } });
      await tx.impuesto.deleteMany({ where: { ventaId: { in: saleIds } } });
    }
    const deletedSales = await tx.sale.deleteMany({ where: { vendedorId: userId } });
    const deletedPagos = await tx.pago.deleteMany({ where: { userId } });
    const deletedLiquidaciones = await tx.liquidacion.deleteMany({ where: { agricultor_id: agricultorId } });
    const deletedPaymentOrders = await tx.paymentOrder.deleteMany({ where: { agricultor_id: agricultorId } });
    const deletedNotifications = await tx.notification.deleteMany({ where: { userId } });
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

  const [salesCount, pagosCount, liqCount, poCount, wallet] = await Promise.all([
    prisma.sale.count({ where: { vendedorId: userId } }),
    prisma.pago.count({ where: { userId } }),
    prisma.liquidacion.count({ where: { agricultor_id: agricultorId } }),
    prisma.paymentOrder.count({ where: { agricultor_id: agricultorId } }),
    prisma.wallet.findFirst({ where: { userId } }),
  ]);

  console.log(JSON.stringify({ ok: true, userId, agricultorId, result, after: { salesCount, pagosCount, liquidacionesCount: liqCount, paymentOrdersCount: poCount, walletBalance: wallet?.balance ?? 0 } }, null, 2));
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
