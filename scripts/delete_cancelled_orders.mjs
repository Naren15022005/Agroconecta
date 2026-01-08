import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const ORDER_IDS = [
  'AGRC_ORD_mjwgosogerdg4y',
  'AGRC_ORD_mjwfm3fpn0nb6j'
];

async function main() {
  console.log('Deleting orders:', ORDER_IDS);
  try {
    const result = await prisma.$transaction(async (tx) => {
      for (const id of ORDER_IDS) {
        const order = await tx.order.findUnique({ where: { id }, include: { items: true, paymentTransactions: true } });
        if (!order) {
          console.log('Order not found:', id);
          continue;
        }
        // Restore stock / reservedStock
        for (const it of order.items || []) {
          try {
            await tx.product.update({ where: { id: it.productId }, data: { stock: { increment: it.quantity }, reservedStock: { decrement: it.quantity } } });
            console.log(`Restored stock for product ${it.productId} (+${it.quantity})`);
          } catch (e) {
            console.warn('Failed restoring stock for', it.productId, e.message || e);
          }
        }
        // Delete payment transactions
        await tx.paymentTransaction.deleteMany({ where: { pedidoId: id } });
        // Delete notifications
        await tx.notification.deleteMany({ where: { pedidoId: id } });
        // Delete order items then order
        await tx.orderItem.deleteMany({ where: { orderId: id } });
        await tx.order.delete({ where: { id } });
        console.log('Deleted order:', id);
      }
      return { ok: true };
    });
    console.log('Transaction result:', result);
  } catch (err) {
    console.error('Error deleting orders:', err);
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
}

main();
