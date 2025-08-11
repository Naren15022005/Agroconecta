import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

// POST /api/admin/pagos/procesar - Procesar un pago recibido
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    // Verificar que sea administrador
    const userRole = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { role: true }
    });

    if (userRole?.role?.name !== 'ADMINISTRADOR') {
      return NextResponse.json({ error: 'Solo administradores pueden procesar pagos' }, { status: 403 });
    }

    const { pedidoId, comprobante, metodoPago, agricultorId, monto } = await request.json();

    console.log('Datos recibidos en procesar:', { pedidoId, agricultorId, monto });

    // Si es un pago directo (sin pedido específico)
    if (agricultorId && monto && !pedidoId) {
      console.log('Procesando pago directo:', { agricultorId, monto });
      return await procesarPagoDirecto(agricultorId, monto);
    }

    // Si es un pago por pedido específico
    if (!pedidoId) {
      console.log('Error: Faltan parámetros requeridos');
      return NextResponse.json({ error: 'ID del pedido o agricultor es requerido' }, { status: 400 });
    }

    // Buscar el pedido
    const pedido = await prisma.order.findUnique({
      where: { id: pedidoId },
      include: {
        items: {
          include: {
            product: {
              include: {
                agricultor: true
              }
            }
          }
        }
      }
    });

    if (!pedido) {
      return NextResponse.json({ error: 'Pedido no encontrado' }, { status: 404 });
    }

    if (pedido.status === 'CONFIRMADO') {
      return NextResponse.json({ error: 'Este pedido ya está confirmado y liquidado' }, { status: 400 });
    }

    const montoTotal = parseFloat(pedido.total.toString());
    const comisionPlataforma = montoTotal * 0.10; // 10% de comisión
    const montoAgricultor = montoTotal - comisionPlataforma;

    // Buscar o crear billetera del administrador
    let billeteraAdmin = await prisma.wallet.findFirst({
      where: { userId: session.user.id }
    });

    if (!billeteraAdmin) {
      billeteraAdmin = await prisma.wallet.create({
        data: {
          userId: session.user.id,
          balance: 0
        }
      });
    }

    // Usar transacción para asegurar consistencia
    const resultado = await prisma.$transaction(async (tx) => {
      // 1. Actualizar estado del pedido a CONFIRMADO (liquidado)
      const pedidoActualizado = await tx.order.update({
        where: { id: pedidoId },
        data: {
          status: 'CONFIRMADO',
          paymentMethod: metodoPago
        }
      });

      // 2. Agregar monto total a billetera del admin
      await tx.wallet.update({
        where: { id: billeteraAdmin!.id },
        data: {
          balance: {
            increment: montoTotal
          }
        }
      });

      // 3. Crear transacción de entrada (pago recibido)
      await tx.walletTransaction.create({
        data: {
          walletId: billeteraAdmin!.id,
          type: 'INGRESO',
          amount: montoTotal,
          description: `Pago recibido por pedido #${pedido.id} - ${metodoPago}`
        }
      });

      // 4. Crear transacción de comisión
      await tx.walletTransaction.create({
        data: {
          walletId: billeteraAdmin!.id,
          type: 'COMISION',
          amount: comisionPlataforma,
          description: `Comisión plataforma (10%) - Pedido #${pedido.id}`
        }
      });

      // 5. Crear transacción pendiente para el agricultor
      await tx.walletTransaction.create({
        data: {
          walletId: billeteraAdmin!.id,
          type: 'PENDIENTE_PAGO',
          amount: -montoAgricultor, // Negativo porque es dinero que debemos
          description: `Pendiente pago a agricultor - Pedido #${pedido.id}`
        }
      });

      return pedidoActualizado;
    });

    return NextResponse.json({
      success: true,
      message: 'Pago procesado exitosamente',
      pedido: resultado,
      resumen: {
        montoTotal,
        comisionPlataforma,
        montoAgricultor,
        metodoPago
      }
    });

  } catch (error) {
    console.error('Error procesando pago:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' }, 
      { status: 500 }
    );
  }
}

// Función para procesar pago directo a agricultor
async function procesarPagoDirecto(agricultorId: string, monto: number) {
  try {
    // Verificar que el agricultor existe
    const agricultor = await prisma.agricultor.findUnique({
      where: { id: agricultorId },
      include: {
        user: true
      }
    });

    if (!agricultor) {
      return NextResponse.json({
        success: false,
        error: 'Agricultor no encontrado'
      }, { status: 404 });
    }

    // Procesar el pago
    await prisma.$transaction(async (tx) => {
      // 1. Buscar o crear billetera del agricultor
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

      // 2. Agregar dinero a la billetera
      await tx.wallet.update({
        where: { id: wallet.id },
        data: {
          balance: {
            increment: monto
          }
        }
      });

      // 3. Crear transacción en la billetera
      await tx.walletTransaction.create({
        data: {
          walletId: wallet.id,
          type: 'PAGO_DIRECTO_ADMIN',
          amount: monto,
          description: `Liquidación directa procesada por administración - ${new Date().toLocaleDateString('es-CO')}`
        }
      });

      // 4. Crear notificación al agricultor
      await tx.notification.create({
        data: {
          id: `NOTIF_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          userId: agricultor.user.id,
          message: `¡Liquidación procesada! Se han agregado ${monto.toLocaleString('es-CO', { style: 'currency', currency: 'COP' })} a tu billetera.`
        }
      });
    });

    return NextResponse.json({
      success: true,
      message: 'Liquidación procesada exitosamente'
    });

  } catch (error) {
    console.error('Error al liquidar pago directo:', error);
    return NextResponse.json({
      success: false,
      error: 'Error interno del servidor'
    }, { status: 500 });
  }
}
