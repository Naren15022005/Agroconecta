import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';

// Estructura esperada del body
// {
//   items: [
//     { productoId, nombre, cantidad, precioUnitario, agricultorId, stockDisponible, metodoEntrega, metodoPago }
//   ]
// }

export async function POST(req: NextRequest) {
  const session = await getServerSession();
  if (!session || !session.user) {
    return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
  }

  const { items } = await req.json();
  if (!items || !Array.isArray(items) || items.length === 0) {
    return NextResponse.json({ error: 'Carrito vacío' }, { status: 400 });
  }

  // Agrupar por agricultor (multi-vendor)
  const pedidosPorAgricultor: Record<string, any[]> = {};
  for (const item of items) {
    if (!pedidosPorAgricultor[item.agricultorId]) {
      pedidosPorAgricultor[item.agricultorId] = [];
    }
    pedidosPorAgricultor[item.agricultorId].push(item);
  }

  const pedidosCreados = [];
  for (const agricultorId of Object.keys(pedidosPorAgricultor)) {
    const productos = pedidosPorAgricultor[agricultorId];
    // Validar stock de cada producto
    for (const prod of productos) {
      const dbProd = await prisma.product.findUnique({ where: { id: prod.productoId } });
      if (!dbProd || dbProd.stock < prod.cantidad) {
        return NextResponse.json({ error: `Stock insuficiente para ${prod.nombre}` }, { status: 400 });
      }
    }
    // Crear Order y OrderItems
    const total = productos.reduce((sum, p) => sum + p.precioUnitario * p.cantidad, 0);
    const order = await prisma.order.create({
      data: {
        buyerId: session.user.id,
        total,
        status: 'PENDIENTE',
        deliveryMethod: productos[0].metodoEntrega || 'ENTREGA_DIRECTA',
        paymentMethod: productos[0].metodoPago || 'CONTRAENTREGA',
        items: {
          create: productos.map((p: any) => ({
            productId: p.productoId,
            quantity: Number(p.cantidad),
            price: Number(p.precioUnitario),
            subtotal: Number(p.precioUnitario) * Number(p.cantidad),
          }))
        }
      }
    });
    // Actualizar stock
    for (const prod of productos) {
      await prisma.product.update({
        where: { id: prod.productoId },
        data: { stock: { decrement: prod.cantidad } }
      });
    }
    pedidosCreados.push(order);
  }

  return NextResponse.json({ ok: true, pedidos: pedidosCreados });
}
