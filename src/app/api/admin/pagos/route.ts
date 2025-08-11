import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/admin/pagos - Obtener todos los pagos pendientes y procesados
export async function GET() {
  try {
    // Obtener pedidos con información de pago
    const pedidos = await prisma.order.findMany({
      include: {
        buyer: true, // comprador
        items: {
          include: {
            product: {
              include: {
                agricultor: {
                  include: {
                    user: true
                  }
                }
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Transformar a formato de pagos
    const pagos = pedidos.map(pedido => {
      const total = parseFloat(pedido.total.toString());
      
      // Obtener info del agricultor (del primer producto, asumiendo que todos son del mismo)
      const primerItem = pedido.items[0];
      const agricultor = primerItem?.product?.agricultor;

      return {
        id: pedido.id,
        pedidoId: pedido.id,
        comprador: pedido.buyer.nombre,
        compradorEmail: pedido.buyer.correo,
        agricultor: agricultor?.user?.nombre || 'N/A',
        agricultorId: agricultor?.id || '',
        monto: total,
        estado: mapEstadoPago(pedido.status),
        metodoPago: pedido.paymentMethod || 'CONTRAENTREGA',
        comprobanteUrl: null, // Por implementar
        fecha: pedido.createdAt.toISOString().split('T')[0],
        fechaCreacion: pedido.createdAt,
        productos: pedido.items.map(item => ({
          nombre: item.product.name,
          cantidad: item.quantity,
          precio: parseFloat(item.price.toString())
        }))
      };
    });

    return NextResponse.json({
      success: true,
      data: pagos,
      total: pagos.length,
      pendientes: pagos.filter(p => p.estado === 'pendiente').length,
      liberados: pagos.filter(p => p.estado === 'liberado').length,
      devueltos: pagos.filter(p => p.estado === 'devuelto').length
    });

  } catch (error) {
    console.error('Error al obtener pagos:', error);
    return NextResponse.json({
      success: false,
      error: 'Error interno del servidor'
    }, { status: 500 });
  }
}

// POST /api/admin/pagos - Procesar acción sobre un pago
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { pedidoId, accion, motivo } = body;

    if (!pedidoId || !accion) {
      return NextResponse.json({
        success: false,
        error: 'pedidoId y accion son requeridos'
      }, { status: 400 });
    }

    // Verificar que el pedido existe
    const pedido = await prisma.order.findUnique({
      where: { id: pedidoId },
      include: {
        buyer: true,
        items: {
          include: {
            product: {
              include: {
                agricultor: {
                  include: {
                    user: true
                  }
                }
              }
            }
          }
        }
      }
    });

    if (!pedido) {
      return NextResponse.json({
        success: false,
        error: 'Pedido no encontrado'
      }, { status: 404 });
    }

    const total = parseFloat(pedido.total.toString());
    const primerItem = pedido.items[0];
    const agricultor = primerItem?.product?.agricultor;

    switch (accion) {
      case 'liberar':
        await procesarLiberacionPago(pedido, agricultor, total);
        break;
      case 'devolver':
        await procesarDevolucionPago(pedido, total, motivo);
        break;
      default:
        return NextResponse.json({
          success: false,
          error: 'Acción no válida'
        }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: `Pago ${accion === 'liberar' ? 'liberado' : 'devuelto'} exitosamente`
    });

  } catch (error) {
    console.error('Error al procesar pago:', error);
    return NextResponse.json({
      success: false,
      error: 'Error interno del servidor'
    }, { status: 500 });
  }
}

// Función auxiliar para mapear estados
function mapEstadoPago(status: string): 'pendiente' | 'liberado' | 'devuelto' {
  switch (status) {
    case 'PENDIENTE':
    case 'CONFIRMADO':
      return 'pendiente';
    case 'ENTREGADO':
      return 'liberado';
    case 'CANCELADO':
    case 'NO_ENTREGADO':
      return 'devuelto';
    default:
      return 'pendiente';
  }
}

// Función para procesar liberación de pago
async function procesarLiberacionPago(pedido: any, agricultor: any, total: number) {
  if (!agricultor) {
    throw new Error('No se pudo encontrar el agricultor para este pedido');
  }

  await prisma.$transaction(async (tx) => {
    // 1. Actualizar estado del pedido
    await tx.order.update({
      where: { id: pedido.id },
      data: { 
        status: 'ENTREGADO',
        notes: `Pago liberado el ${new Date().toISOString()}`
      }
    });

    // 2. Buscar o crear billetera del agricultor
    let wallet = await tx.wallet.findFirst({
      where: { userId: agricultor.user.id }
    });

    if (!wallet) {
      wallet = await tx.wallet.create({
        data: {
          userId: agricultor.user.id,
          balance: 0
        }
      });
    }

    // 3. Agregar dinero a la billetera
    await tx.wallet.update({
      where: { id: wallet.id },
      data: {
        balance: {
          increment: total
        }
      }
    });

    // 4. Crear transacción en la billetera
    await tx.walletTransaction.create({
      data: {
        walletId: wallet.id,
        type: 'INGRESO_VENTA',
        amount: total,
        description: `Pago liberado por venta - Pedido ${pedido.id}`
      }
    });

    // 5. Crear notificación al agricultor
    await tx.notification.create({
      data: {
        id: `NOTIF_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        userId: agricultor.user.id,
        pedidoId: pedido.id,
        message: `¡Pago liberado! Se han agregado $${total.toLocaleString()} a tu billetera.`
      }
    });
  });
}

// Función para procesar devolución de pago
async function procesarDevolucionPago(pedido: any, total: number, motivo?: string) {
  await prisma.$transaction(async (tx) => {
    // 1. Actualizar estado del pedido
    await tx.order.update({
      where: { id: pedido.id },
      data: { 
        status: 'CANCELADO',
        notes: `Pago devuelto el ${new Date().toISOString()}. ${motivo ? `Motivo: ${motivo}` : ''}`
      }
    });

    // 2. Crear notificación al comprador
    await tx.notification.create({
      data: {
        id: `NOTIF_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        userId: pedido.buyer.id,
        pedidoId: pedido.id,
        message: `Tu pago de $${total.toLocaleString()} ha sido devuelto. ${motivo ? `Motivo: ${motivo}` : ''}`
      }
    });

    // 3. Crear notificación al agricultor (si hay)
    const primerItem = pedido.items[0];
    const agricultor = primerItem?.product?.agricultor;
    
    if (agricultor) {
      await tx.notification.create({
        data: {
          id: `NOTIF_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          userId: agricultor.user.id,
          pedidoId: pedido.id,
          message: `Pedido ${pedido.id} cancelado - Pago devuelto al comprador.`
        }
      });
    }
  });
}
