import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Endpoint para liquidar a un agricultor
export async function POST(req: NextRequest) {
  try {
    const { userId, monto } = await req.json();
    if (!userId || !monto) {
      return NextResponse.json({ error: 'Faltan datos requeridos' }, { status: 400 });
    }

    // Buscar wallet del agricultor
    const wallet = await prisma.wallet.findFirst({ where: { userId } });
    if (!wallet) {
      return NextResponse.json({ error: 'Wallet no encontrada para el agricultor' }, { status: 404 });
    }

    // Validar que el saldo sea suficiente
    if (Number(wallet.balance) < Number(monto)) {
      return NextResponse.json({ error: 'Saldo insuficiente en la wallet del agricultor' }, { status: 400 });
    }

    // Registrar la liquidación como un pago
    const pago = await prisma.pago.create({
      data: {
        userId,
        monto: Number(monto),
        metodoPago: 'LIQUIDACION',
        estado: 'LIQUIDADO',
        fecha: new Date(),
      }
    });

    // Descontar el saldo de la wallet
    await prisma.wallet.update({
      where: { id: wallet.id },
      data: {
        balance: { decrement: Number(monto) }
      }
    });

    // Registrar la transacción en la wallet
    await prisma.walletTransaction.create({
      data: {
        walletId: wallet.id,
        type: 'LIQUIDACION',
        amount: -Number(monto),
        description: `Liquidación realizada al agricultor (${userId})`,
      }
    });

    return NextResponse.json({ ok: true, pago });
  } catch (error) {
    console.error('Error en liquidación:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
