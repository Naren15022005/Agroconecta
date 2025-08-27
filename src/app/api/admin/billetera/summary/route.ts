import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { startOfMonth, endOfMonth } from 'date-fns';

export async function GET(req: NextRequest) {
  try {
    const now = new Date();
    const mesInicio = startOfMonth(now);
    const mesFin = endOfMonth(now);

    const ORDER_STATUS_ENTREGADO = 'ENTREGADO';

    const ventasMes = await prisma.order.aggregate({
      where: {
        status: ORDER_STATUS_ENTREGADO,
        createdAt: { gte: mesInicio, lte: mesFin },
      },
      _sum: { total: true },
      _count: { id: true },
    });

    // Filtrar por la fecha de la comisión directamente
    const comisionesMes = await prisma.comision.aggregate({
      where: {
        fecha: { gte: mesInicio, lte: mesFin }
      },
      _sum: { monto: true }
    });

    const pagosAgricultoresMes = await prisma.sale.aggregate({
      where: {
        fecha: { gte: mesInicio, lte: mesFin }
      },
      _sum: { total: true }
    });

    // Obtenemos transacciones sin incluir información del usuario
    const transacciones = await prisma.walletTransaction.findMany({
      orderBy: { createdAt: 'desc' },
      take: 10,
    });

    const tarjetas = [
      {
        id: 1,
        tipo: 'Nequi',
        numero: '**** **** **** 1234',
        titular: 'ADMIN AGRO',
        vencimiento: '09/28',
        color: 'linear-gradient(45deg, #ff4e50, #f9d423)',
        logo: 'nequi',
      },
      {
        id: 2,
        tipo: 'Bancolombia',
        numero: '**** **** **** 5678',
        titular: 'ADMIN AGRO',
        vencimiento: '12/29',
        color: 'linear-gradient(45deg, #0057b8, #ffd600)',
        logo: 'bancolombia',
      },
    ];

    const saldoComision = comisionesMes._sum?.monto ?? 0;
    const totalPagosAgricultores = pagosAgricultoresMes._sum?.total ?? 0;

    return NextResponse.json({
      saldoDisponible: saldoComision,
      saldoApp: saldoComision,
      totalRecaudado: ventasMes._sum?.total ?? 0,
      aPagarAgricultores: Math.max(0, totalPagosAgricultores - saldoComision),
      saldoTotalBilleteras: saldoComision,
      ventasRealizadas: ventasMes._count?.id ?? 0,
      comisionesTotales: saldoComision,
      tarjetas,
      cards: tarjetas,
      transacciones,
    });
  } catch (error: any) {
    console.error('API admin/billetera/summary error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}