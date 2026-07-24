import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || (session.user as any).role !== 'CAMPESINO') {
      return NextResponse.json([]);
    }

    const userId = (session.user as any).id;
    const isVercel = Boolean(process.env.VERCEL) || Boolean(process.env.VERCEL_ENV);
    const dbUrl = process.env.DATABASE_URL || '';
    const isLocalDb = dbUrl.includes('localhost') || dbUrl.includes('127.0.0.1');

    if (!isVercel && !isLocalDb) {
      try {
        const { prisma } = await import('@/lib/prisma');
        const agricultor = await prisma.agricultor.findUnique({
          where: { user_id: userId },
          select: { id: true }
        });

        if (agricultor) {
          const orders = await prisma.order.findMany({
            where: {
              items: {
                some: {
                  product: { agricultorId: agricultor.id }
                }
              },
              status: { not: 'CANCELADO' }
            },
            orderBy: { createdAt: 'desc' },
            include: {
              buyer: { select: { id: true, nombre: true, cliente: { select: { telefono: true, direccion: true } } } },
              items: { include: { product: { select: { name: true, agricultorId: true } } } }
            }
          });

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
            historial: [],
          }));

          return NextResponse.json(data);
        }
      } catch (_) {}
    }

    // Fallback a Firebase Cloud Firestore
    try {
      const { db } = await import('@/lib/firebase');
      const { collection, getDocs } = await import('firebase/firestore');

      const snap = await getDocs(collection(db, 'orders'));
      const ordersData: any[] = [];
      snap.forEach(docSnap => {
        const d = docSnap.data();
        ordersData.push({ id: docSnap.id, ...d });
      });

      return NextResponse.json(ordersData);
    } catch (fbErr) {
      console.error('[pedidos] Error leyendo Firebase:', fbErr);
    }

    return NextResponse.json([]);
  } catch (error) {
    return NextResponse.json([]);
  }
}
