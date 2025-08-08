import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// Devuelve los pedidos recibidos por el agricultor autenticado
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'CAMPESINO') {
    return NextResponse.json([], { status: 401 });
  }
  const userId = session.user.id;
  // Buscar el perfil de agricultor

  const agricultor = await prisma.agricultor.findUnique({
    where: { user_id: userId },
    select: { id: true }
  });
  if (!agricultor) return NextResponse.json([], { status: 200 });

  // Buscar pedidos donde al menos un OrderItem.product.agricultorId = agricultor.id
  const orders = await prisma.order.findMany({
    where: {
      items: {
        some: {
          product: {
            agricultorId: agricultor.id
          }
        }
      }
    },
    orderBy: { createdAt: 'desc' },
    include: {
      buyer: { select: { id: true, nombre: true, cliente: { select: { telefono: true, direccion: true } } } },
      items: {
        include: {
          product: { select: { name: true, agricultorId: true } }
        }
      },
    },
  });

  // Adaptar formato para frontend
  const data = orders.map((o: any) => ({
    id: o.id,
    cliente: {
      id: o.buyer.id,
      nombre: o.buyer.nombre,
      telefono: o.buyer.cliente?.telefono || '',
      direccion: o.buyer.cliente?.direccion || '',
    },
    estado: o.status.toLowerCase(),
    productos: o.items
      .filter((item: any) => item.product.agricultorId === agricultor.id)
      .map((item: any) => ({
        productoId: item.productId,
        nombre: item.product.name,
        cantidad: item.quantity,
        precioUnitario: Number(item.price),
      })),
    total: Number(o.total),
    metodoPago: o.paymentMethod,
    metodoEntrega: o.deliveryMethod,
    fechaPedido: o.createdAt,
    fechaEntrega: o.updatedAt,
    historial: [], // TODO: implementar historial de estados si existe
  }));

  return NextResponse.json(data);
}
