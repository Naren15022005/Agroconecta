import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main(){
  const start = new Date('2026-01-01T00:00:00Z');
  const end = new Date('2026-01-03T23:59:59Z');
  const whereRange = { createdAt: { gte: start, lte: end } };
  const res = await prisma.order.groupBy({ by: ['status'], where: whereRange, _count: { _all: true } });
  console.log('groupBy result:');
  console.dir(res, { depth: 3 });
  await prisma.$disconnect();
}

main().catch(async (e)=>{ console.error(e); try{await prisma.$disconnect()}catch{}; process.exit(1); });
