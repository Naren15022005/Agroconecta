import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
const userId = process.argv[2];
if (!userId) {
  console.error('Usage: node delete-user-and-deps-force.mjs <AGRC_USER_ID>');
  process.exit(1);
}

async function main(){
  console.log('Force-delete sequence start for', userId);
  try {
    let res;

    res = await prisma.paymentTransaction.deleteMany({ where: { compradorId: userId } });
    console.log('paymentTransaction deleted:', res.count);

    // find sales ids where this user is comprador or vendedor
    const salesComprador = await prisma.sale.findMany({ where: { compradorId: userId }, select: { id: true } });
    const saleIds = salesComprador.map(s => s.id);
    if (saleIds.length) {
      // delete dependent rows in comisiones/impuestos that reference ventaId
      try {
        const delCom = await prisma.$executeRawUnsafe(`DELETE FROM \`comisiones\` WHERE ventaId IN (${saleIds.map(()=>'?').join(',')})`, ...saleIds);
        console.log('comisiones deleted for ventas:', delCom);
      } catch(e){ /* ignore */ }
      try {
        const delImp = await prisma.$executeRawUnsafe(`DELETE FROM \`impuestos\` WHERE ventaId IN (${saleIds.map(()=>'?').join(',')})`, ...saleIds);
        console.log('impuestos deleted for ventas:', delImp);
      } catch(e){ /* ignore */ }
    }

    res = await prisma.sale.deleteMany({ where: { compradorId: userId } });
    console.log('sales (comprador) deleted:', res.count);

    res = await prisma.sale.deleteMany({ where: { vendedorId: userId } });
    console.log('sales (vendedor) deleted:', res.count);

    res = await prisma.order.deleteMany({ where: { buyerId: userId } });
    console.log('orders deleted:', res.count);

    res = await prisma.cartItem.deleteMany({ where: { userId } });
    console.log('cart items deleted:', res.count);

    res = await prisma.pago.deleteMany({ where: { userId } }).catch(()=>({count:0}));
    console.log('pagos deleted:', res.count);

    res = await prisma.transaccion.deleteMany({ where: { userId } }).catch(()=>({count:0}));
    console.log('transacciones deleted:', res.count);

    // wallets and wallet transactions
    const wallets = await prisma.wallet.findMany({ where: { userId } }).catch(()=>[]);
    for(const w of wallets){
      res = await prisma.walletTransaction.deleteMany({ where: { walletId: w.id } }).catch(()=>({count:0}));
      console.log('walletTransactions deleted for', w.id, res.count);
    }
    res = await prisma.wallet.deleteMany({ where: { userId } }).catch(()=>({count:0}));
    console.log('wallets deleted:', res.count);

    res = await prisma.account.deleteMany({ where: { userId } }).catch(()=>({count:0}));
    console.log('accounts deleted:', res.count);
    res = await prisma.session.deleteMany({ where: { userId } }).catch(()=>({count:0}));
    console.log('sessions deleted:', res.count);

    res = await prisma.cliente.deleteMany({ where: { user_id: userId } }).catch(()=>({count:0}));
    console.log('cliente profiles deleted:', res.count);
    res = await prisma.agricultor.deleteMany({ where: { user_id: userId } }).catch(()=>({count:0}));
    console.log('agricultor profiles deleted:', res.count);
    res = await prisma.empresa.deleteMany({ where: { user_id: userId } }).catch(()=>({count:0}));
    console.log('empresa profiles deleted:', res.count);

    // final attempt to delete user
    res = await prisma.user.delete({ where: { id: userId } }).catch((e)=>{ throw e; });
    console.log('user deleted:', res);

    console.log('Force-delete sequence completed.');
  } catch (err) {
    console.error('Error during forced deletion:', err);
  } finally {
    await prisma.$disconnect();
  }
}

main();
