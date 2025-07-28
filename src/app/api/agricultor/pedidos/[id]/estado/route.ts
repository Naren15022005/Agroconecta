import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// PATCH /api/agricultor/pedidos/[id]/estado
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'AGRICULTOR') {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  const pedidoId = params.id;
  const { nuevoEstado } = await req.json();

  // Verifica que el agricultor sea dueño de al menos un producto en el pedido
  const pedido = await prisma.order.findUnique({
    where: { id: pedidoId },
    include: {
      items: { include: { product: true } },
    },
  });
  if (!pedido) {
    return NextResponse.json({ error: 'Pedido no encontrado' }, { status: 404 });
  }
  const esDueno = pedido.items.some(
    (item: any) => item.product.agricultorId === session.user.id
  );
  if (!esDueno) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
  }

  // Actualiza el estado del pedido
  const pedidoActualizado = await prisma.order.update({
    where: { id: pedidoId },
    data: { status: nuevoEstado },
  });

  return NextResponse.json(pedidoActualizado);
}
