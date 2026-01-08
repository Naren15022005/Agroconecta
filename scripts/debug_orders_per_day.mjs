import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const start = new Date('2026-01-01T00:00:00Z');
  const end = new Date('2026-01-03T23:59:59Z');

  const whereRange = { createdAt: { gte: start, lte: end } };
  const from = new Date(start);
  const to = new Date(end);
  const msPerDay = 24 * 60 * 60 * 1000;
  const days = Math.ceil((to.getTime() - from.getTime()) / msPerDay) + 1;
  const cap = Math.min(days, 365);

  const ordersInRange = await prisma.order.findMany({ where: { createdAt: { gte: from, lte: to } }, select: { createdAt: true, total: true, status: true, pagoVerificado: true } });
  const ordersPerDay = {};
  for (let i = 0; i < cap; i++) {
    const d = new Date(from);
    d.setDate(from.getDate() + i);
    const key = d.toISOString().slice(0,10);
    ordersPerDay[key] = { orders: 0, revenue: 0, statuses: {} };
  }

  for (const o of ordersInRange) {
    const k = o.createdAt.toISOString().slice(0,10);
    if (!ordersPerDay[k]) ordersPerDay[k] = { orders: 0, revenue: 0, statuses: {} };
    const st = o.status || 'UNKNOWN';
    ordersPerDay[k].statuses[st] = (ordersPerDay[k].statuses[st] || 0) + 1;
    if (st === 'CONFIRMADO' && o.pagoVerificado) {
      ordersPerDay[k].orders += 1;
      ordersPerDay[k].revenue += Number(o.total ?? 0);
    }
  }

  console.log('Orders In Range:', ordersInRange.length);
  console.log('Orders Per Day:');
  console.dir(ordersPerDay, { depth: 3, maxArrayLength: null });

  await prisma.$disconnect();
}

main().catch(async (e) => { console.error(e); try{await prisma.$disconnect()}catch{}; process.exit(1); });
