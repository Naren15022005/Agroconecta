import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function markPaid() {
  const id = process.argv[2] || 'AGRC_ORD_mjuyos2ye9wc4l';
  try {
    const pedido = await prisma.order.findUnique({ where: { id } });
    if (!pedido) {
      console.error('Pedido no encontrado:', id);
      return;
    }
    console.log('Pedido actual:', { id: pedido.id, status: pedido.status, pagoVerificado: pedido.pagoVerificado, paymentMethod: pedido.paymentMethod });
    const actualizado = await prisma.order.update({ where: { id }, data: { pagoVerificado: true } });
    console.log('✅ Pedido marcado como pagado (pagoVerificado=true):', actualizado.id);
  } catch (e) {
    console.error('Error:', e);
  } finally {
    await prisma.$disconnect();
  }
}

markPaid();
