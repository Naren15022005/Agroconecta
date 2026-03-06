import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
const userId = process.argv[2] || 'AGRC_USER_MLHDVR6AENCW';

async function main(){
  console.log('Checking dependencies for user', userId);
  const ordersCount = await prisma.order.count({ where: { buyerId: userId } });
  const cartCount = await prisma.cartItem.count({ where: { userId: userId } });
  const salesCompradorCount = await prisma.sale.count({ where: { compradorId: userId } });
  const salesVendedorCount = await prisma.sale.count({ where: { vendedorId: userId } });
  const pagosCount = await prisma.pago.count({ where: { userId: userId } });
  const transCount = await prisma.transaccion.count({ where: { userId: userId } });
  const sessionsCount = await prisma.session.count({ where: { userId: userId } });
  const accountsCount = await prisma.account.count({ where: { userId: userId } });
  const clientesCount = await prisma.cliente.count({ where: { user_id: userId } });
  const agricultorCount = await prisma.agricultor.count({ where: { user_id: userId } });
  const empresasCount = await prisma.empresa.count({ where: { user_id: userId } });
  const walletsCount = await prisma.wallet.count({ where: { userId: userId } });
  let walletTxCount = 0;
  try { walletTxCount = await prisma.walletTransaction.count({ where: { wallet: { userId: userId } } }); } catch (e) { walletTxCount = 0; }
  let paymentTxCount = 0;
  try { paymentTxCount = await prisma.paymentTransaction.count({ where: { compradorId: userId } }); } catch (e) { paymentTxCount = 0; }

  console.log({ ordersCount, cartCount, salesCompradorCount, salesVendedorCount, pagosCount, transCount, sessionsCount, accountsCount, clientesCount, agricultorCount, empresasCount, walletsCount, walletTxCount, paymentTxCount });

  // sample rows for each relevant table (non exhaustive)
  if(ordersCount>0){
    const orders = await prisma.order.findMany({ where: { buyerId: userId }, take: 5 });
    console.log('Sample orders:', orders);
  }
  if(salesCompradorCount>0){
    const sales = await prisma.sale.findMany({ where: { compradorId: userId }, take: 5 });
    console.log('Sample sales as comprador:', sales);
  }
  if(salesVendedorCount>0){
    const salesv = await prisma.sale.findMany({ where: { vendedorId: userId }, take: 5 });
    console.log('Sample sales as vendedor:', salesv);
  }

  await prisma.$disconnect();
}

main().catch(e=>{console.error(e);process.exit(1)});
