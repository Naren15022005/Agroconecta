import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();
const userId = process.argv[2];
if (!userId) {
  console.error('Usage: node delete-user-and-deps.mjs <AGRC_USER_ID>');
  process.exit(1);
}

async function main(){
  console.log('Preparing to delete user and dependencies for', userId);
  const outDir = path.join(process.cwd(), 'reports', 'deletions');
  fs.mkdirSync(outDir, { recursive: true });
  const ts = new Date().toISOString().replace(/[:.]/g,'-');
  const outFile = path.join(outDir, `deleted-user-${userId}-${ts}.json`);

  // Collect affected rows
  const data = {};
  data.user = await prisma.user.findUnique({ where: { id: userId } });
  data.cliente = await prisma.cliente.findMany({ where: { user_id: userId } });
  data.agricultor = await prisma.agricultor.findMany({ where: { user_id: userId } });
  data.empresa = await prisma.empresa.findMany({ where: { user_id: userId } });
  data.orders = await prisma.order.findMany({ where: { buyerId: userId } });
  data.sales_comprador = await prisma.sale.findMany({ where: { compradorId: userId } });
  data.sales_vendedor = await prisma.sale.findMany({ where: { vendedorId: userId } });
  data.payment_transactions = await prisma.paymentTransaction.findMany({ where: { compradorId: userId } }).catch(()=>[]);
  data.cart_items = await prisma.cartItem.findMany({ where: { userId } }).catch(()=>[]);
  data.pagos = await prisma.pago.findMany({ where: { userId } }).catch(()=>[]);
  data.transacciones = await prisma.transaccion.findMany({ where: { userId } }).catch(()=>[]);
  data.accounts = await prisma.account.findMany({ where: { userId } }).catch(()=>[]);
  data.sessions = await prisma.session.findMany({ where: { userId } }).catch(()=>[]);
  data.wallets = await prisma.wallet.findMany({ where: { userId } }).catch(()=>[]);
  data.wallet_transactions = [];
  for(const w of data.wallets){
    const txs = await prisma.walletTransaction.findMany({ where: { walletId: w.id } }).catch(()=>[]);
    data.wallet_transactions.push(...txs);
  }

  fs.writeFileSync(outFile, JSON.stringify(data, null, 2));
  console.log('Backed up affected rows to', outFile);

  // Confirm destructive action
  console.log('Deleting records in a single transaction...');
  try {
    await prisma.$transaction(async (tx) => {
      // Delete payment transactions for this comprador
      await tx.paymentTransaction.deleteMany({ where: { compradorId: userId } }).catch(()=>{});
      // Delete sales where comprador or vendedor is this user
      await tx.sale.deleteMany({ where: { compradorId: userId } }).catch(()=>{});
      await tx.sale.deleteMany({ where: { vendedorId: userId } }).catch(()=>{});
      // Delete orders (order_items should cascade)
      await tx.order.deleteMany({ where: { buyerId: userId } }).catch(()=>{});
      // Delete cart items
      await tx.cartItem.deleteMany({ where: { userId } }).catch(()=>{});
      // Delete pagos
      await tx.pago.deleteMany({ where: { userId } }).catch(()=>{});
      // Delete transacciones
      await tx.transaccion.deleteMany({ where: { userId } }).catch(()=>{});
      // Delete wallet transactions and wallets
      for(const w of data.wallets){
        await tx.walletTransaction.deleteMany({ where: { walletId: w.id } }).catch(()=>{});
      }
      await tx.wallet.deleteMany({ where: { userId } }).catch(()=>{});
      // Delete accounts and sessions
      await tx.account.deleteMany({ where: { userId } }).catch(()=>{});
      await tx.session.deleteMany({ where: { userId } }).catch(()=>{});
      // Delete cliente/agricultor/empresa profiles
      await tx.cliente.deleteMany({ where: { user_id: userId } }).catch(()=>{});
      await tx.agricultor.deleteMany({ where: { user_id: userId } }).catch(()=>{});
      await tx.empresa.deleteMany({ where: { user_id: userId } }).catch(()=>{});
      // Extra safety: ensure any remaining tables with a compradorId column are cleaned
      // (covers edge cases where model names differ or we missed a table)
      try {
        const tablas = await tx.$queryRaw`SELECT TABLE_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA=DATABASE() AND COLUMN_NAME='compradorId'`;
        for (const row of tablas) {
          const tableName = row.TABLE_NAME || row.table_name || Object.values(row)[0];
          if (!tableName) continue;
          try {
            await tx.$executeRawUnsafe(`DELETE FROM \`${tableName}\` WHERE compradorId = ?`, userId);
          } catch(e){ /* ignore per-table errors */ }
        }
      } catch(e){ /* ignore schema inspection failures */ }

      // Finally delete user
      await tx.user.delete({ where: { id: userId } });
    });
    console.log('Deletion transaction committed. User and dependents removed.');
  } catch (err) {
    console.error('Error during deletion transaction:', err);
    console.error('You can inspect the backup file and decide manual steps.');
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch(e=>{console.error(e); process.exit(1)});
