import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function validatePayments() {
  try {
    const pendientes = await prisma.order.findMany({ where: { status: 'PENDIENTE' } });
    if (pendientes.length === 0) {
      console.log('No hay pedidos pendientes para validar.');
      return;
    }

    console.log(`Pedidos pendientes encontrados: ${pendientes.length}`);
    for (const p of pendientes) {
      console.log(` - ${p.id} | buyer: ${p.buyerId} | total: ${p.total} | metodo: ${p.paymentMethod}`);
    }

    const result = await prisma.order.updateMany({
      where: { status: 'PENDIENTE' },
      data: { status: 'PAGO_VALIDADO', pagoVerificado: true }
    });

    console.log(`\n✅ Actualizados: ${result.count} pedidos a status PAGO_VALIDADO`);
  } catch (error) {
    console.error('Error validando pagos:', error);
  } finally {
    await prisma.$disconnect();
  }
}

validatePayments();
