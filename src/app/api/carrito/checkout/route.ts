import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { NotificacionesRepository } from '@/modules/notificaciones/repository';

// Estructura esperada del body
// {
//   items: [
//     { productoId, nombre, cantidad, precioUnitario, agricultorId, stockDisponible }
//   ],
//   deliveryInfo: {
//     method: 'ENTREGA_DIRECTA' | 'PUNTO_ENCUENTRO' | 'COURIER',
//     address?: string,
//     meetingPoint?: string,
//     notes?: string
//   },
//   paymentInfo: {
//     method: 'CONTRAENTREGA' | 'TRANSFERENCIA' | 'NEQUI' | 'DAVIPLATA',
//     details?: string
//   }
// }

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
  }

  const { items, deliveryInfo, paymentInfo } = await req.json();
  if (!items || !Array.isArray(items) || items.length === 0) {
    return NextResponse.json({ error: 'Carrito vacío' }, { status: 400 });
  }

  if (!deliveryInfo || !deliveryInfo.method) {
    return NextResponse.json({ error: 'Información de entrega requerida' }, { status: 400 });
  }

  if (!paymentInfo || !paymentInfo.method) {
    return NextResponse.json({ error: 'Método de pago requerido' }, { status: 400 });
  }

  // Agrupar por agricultor (multi-vendor)
  const pedidosPorAgricultor: Record<string, any[]> = {};
  for (const item of items) {
    // Validar que el productoId sea válido (solo productos reales)
    if (typeof item.productoId !== 'string' || !item.productoId.startsWith('AGRC_PRD_')) {
      return NextResponse.json({ error: 'Producto inválido en el carrito.' }, { status: 400 });
    }
    if (!pedidosPorAgricultor[item.agricultorId]) {
      pedidosPorAgricultor[item.agricultorId] = [];
    }
    pedidosPorAgricultor[item.agricultorId].push(item);
  }

  const pedidosCreados = [];
  const notificacionesRepo = new NotificacionesRepository();
  for (const agricultorId of Object.keys(pedidosPorAgricultor)) {
    const productos = pedidosPorAgricultor[agricultorId];
    // Validar stock de cada producto
    for (const prod of productos) {
      const dbProd = await prisma.product.findUnique({ where: { id: prod.productoId } });
      if (!dbProd || dbProd.stock < prod.cantidad) {
        return NextResponse.json({ error: `Stock insuficiente para ${prod.nombre}` }, { status: 400 });
      }
    }
    // Validar sesión y buyerId
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autenticado. Inicia sesión para comprar.' }, { status: 401 });
    }
    // Crear Order y OrderItems
    const total = productos.reduce((sum, p) => sum + p.precioUnitario * p.cantidad, 0);
    const orderId = `AGRC_ORD_${Date.now().toString(36)}${Math.random().toString(36).substring(2,8)}`;
    const orderItems = productos.map((p: any) => ({
      id: `AGRC_ORDITEM_${Date.now().toString(36)}${Math.random().toString(36).substring(2,8)}`,
      productId: p.productoId,
      quantity: Number(p.cantidad),
      price: Number(p.precioUnitario),
      subtotal: Number(p.precioUnitario) * Number(p.cantidad),
    }));
    const order = await prisma.order.create({
      data: {
        id: orderId,
        buyerId: session.user.id,
        total,
        status: 'PENDIENTE',
        deliveryMethod: deliveryInfo.method,
        paymentMethod: paymentInfo.method,
        deliveryAddress: deliveryInfo.address || null,
        deliveryNotes: deliveryInfo.notes || null,
        notes: paymentInfo.details || null, // Using notes field for payment details
        items: {
          create: orderItems
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
    // Buscar el usuario dueño del perfil agricultor
    const agricultor = await prisma.agricultor.findUnique({ where: { id: agricultorId }, select: { user_id: true } });
    if (!agricultor) continue;
    // Crear notificación para el agricultor (user_id)
    await notificacionesRepo.crearNotificacion({
      id: `AGRC_NOTIF_${Date.now().toString(36)}${Math.random().toString(36).substring(2,8)}`,
      userId: agricultor.user_id,
      pedidoId: orderId,
      message: `Nuevo pedido recibido. Pedido #${orderId} (${productos.length} producto${productos.length > 1 ? 's' : ''})`,
      isRead: false
    });
    pedidosCreados.push(order);
  }

  return NextResponse.json({ ok: true, pedidos: pedidosCreados });
}
