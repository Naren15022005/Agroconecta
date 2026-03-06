const { PrismaClient } = require('@prisma/client');

(async () => {
  const prisma = new PrismaClient();
  try {
    const c = await prisma.favorite.count();
    console.log('favorites count =', c);
  } catch (e) {
    console.error('error checking favorites table:', e);
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
})();
