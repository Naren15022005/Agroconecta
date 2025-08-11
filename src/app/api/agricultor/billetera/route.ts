import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    // Verificar que sea agricultor
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { role: true }
    });

    const roleName = user?.role?.name?.toLowerCase();
    if (!user || (roleName !== 'agricultor' && roleName !== 'campesino')) {
      return NextResponse.json({ error: 'Acceso denegado' }, { status: 403 });
    }

    // Obtener billetera del agricultor
    let wallet = await prisma.wallet.findFirst({
      where: { userId: user.id },
      include: {
        transactions: {
          orderBy: { createdAt: 'desc' },
          take: 20
        }
      }
    });

    // Crear billetera si no existe
    if (!wallet) {
      wallet = await prisma.wallet.create({
        data: {
          userId: user.id,
          balance: 0
        },
        include: {
          transactions: true
        }
      });
    }

    // Obtener pedidos entregados del agricultor
    const deliveredOrders = await prisma.order.findMany({
      where: {
        items: {
          some: {
            product: {
              agricultorId: user.id
            }
          }
        },
        status: 'ENTREGADO'
      },
      include: {
        items: {
          where: {
            product: {
              agricultorId: user.id
            }
          },
          include: {
            product: true
          }
        }
      }
    });

    const totalEarnings = deliveredOrders.reduce((total, order) => {
      return total + order.items.reduce((orderTotal, item) => {
        return orderTotal + (item.quantity * Number(item.price));
      }, 0);
    }, 0);

    // Obtener solicitudes de retiro pendientes
    const pendingWithdrawals = await prisma.withdrawRequest.findMany({
      where: {
        userId: user.id,
        status: 'PENDIENTE'
      }
    });

    const pendingAmount = pendingWithdrawals.reduce((total, request) => {
      return total + Number(request.amount);
    }, 0);

    return NextResponse.json({
      success: true,
      wallet: {
        ...wallet,
        balance: Number(wallet.balance),
        totalEarnings
      },
      statistics: {
        deliveredOrders: deliveredOrders.length,
        totalEarnings,
        pendingWithdrawals: pendingAmount
      },
      pendingWithdrawals
    });

  } catch (error) {
    console.error('Error al obtener billetera:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// POST para solicitudes de retiro
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { action, amount, bankDetails } = await request.json();

    // Verificar que sea agricultor
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { role: true }
    });

    const roleName = user?.role?.name?.toLowerCase();
    if (!user || (roleName !== 'agricultor' && roleName !== 'campesino')) {
      return NextResponse.json({ error: 'Acceso denegado' }, { status: 403 });
    }

    if (action === 'withdraw') {
      // Solicitar retiro
      if (!amount || amount <= 0) {
        return NextResponse.json({ error: 'Monto inválido' }, { status: 400 });
      }

      const wallet = await prisma.wallet.findFirst({
        where: { userId: user.id }
      });

      if (!wallet || Number(wallet.balance) < amount) {
        return NextResponse.json({ error: 'Saldo insuficiente' }, { status: 400 });
      }

      // Crear solicitud de retiro
      await prisma.withdrawRequest.create({
        data: {
          userId: user.id,
          amount: amount,
          status: 'PENDIENTE'
        }
      });

      // Crear transacción en la billetera
      await prisma.walletTransaction.create({
        data: {
          walletId: wallet.id,
          type: 'withdrawal_request',
          amount: -amount,
          description: `Solicitud de retiro por $${amount.toLocaleString()}`
        }
      });

      // Actualizar saldo de la billetera
      await prisma.wallet.update({
        where: { id: wallet.id },
        data: {
          balance: Number(wallet.balance) - amount
        }
      });

      // Crear notificación
      await prisma.notification.create({
        data: {
          id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          userId: user.id,
          message: `Tu solicitud de retiro por $${amount.toLocaleString()} ha sido enviada y está pendiente de aprobación.`
        }
      });

      return NextResponse.json({
        success: true,
        message: 'Solicitud de retiro enviada exitosamente'
      });
    }

    return NextResponse.json({ error: 'Acción no válida' }, { status: 400 });

  } catch (error) {
    console.error('Error en transacción de billetera:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
