import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const since = new Date();
  since.setDate(since.getDate() - 7); // last 7 days

  const cancelled = await prisma.order.findMany({
    where: { status: 'CANCELADO', createdAt: { gte: since } },
    include: {
      items: { include: { product: true } },
      buyer: true,
      paymentTransactions: true
    },
    orderBy: { createdAt: 'desc' }
  });

  if (!cancelled || cancelled.length === 0) {
    console.log('No cancelled orders found in the last 7 days.');
    await prisma.$disconnect();
    return;
  }

  console.log(`Found ${cancelled.length} cancelled orders (last 7 days):`);
  for (const o of cancelled) {
    console.log('---');
    console.log('id:', o.id);
    console.log('buyerId:', o.buyerId);
    console.log('total:', o.total);
    console.log('createdAt:', o.createdAt.toISOString());
    console.log('items count:', (o.items || []).length);
    console.log('paymentTransactions:', (o.paymentTransactions || []).map(p => ({ id: p.id, estado: p.estado, comprobanteUrl: p.comprobanteUrl })) );
    if (o.items && o.items.length > 0) {
      console.log('items:');
      for (const it of o.items) {
        console.log(' -', it.id, '| productId:', it.productId, '| name:', it.product?.name || '-', '| qty:', it.quantity, '| subtotal:', it.subtotal);
      }
    }
  }

  await prisma.$disconnect();
}

main().catch(async (e) => {
  console.error('Script error:', e);
  try { await prisma.$disconnect(); } catch {};
  process.exit(1);
});
