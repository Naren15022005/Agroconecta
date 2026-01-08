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

    // Calcular comisiones como 10% de los subtotales de los items de pedidos
    // que están en CONFIRMADO o ENTREGADO y con pago verificado.
    // Aggregate only items inside the selected month to match `pagosAgricultoresMes`
    const itemsAgg = await prisma.orderItem.aggregate({
      where: {
        order: {
          status: { in: ['CONFIRMADO', 'ENTREGADO'] },
          pagoVerificado: true,
          createdAt: { gte: mesInicio, lte: mesFin }
        }
      },
      _sum: { subtotal: true }
    });

    // comisiones totales (10% de la suma de subtotales)
    const comisionesTotales = Number(((itemsAgg._sum?.subtotal ?? 0) * 0.10).toFixed(2));

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

    const saldoComision = comisionesTotales;
    const totalPagosAgricultores = pagosAgricultoresMes._sum?.total ?? 0;

    // Saldo actual de comisiones después de restar los pagos ya realizados a agricultores
    const saldoActualComisiones = Number((saldoComision - totalPagosAgricultores).toFixed(2));

    return NextResponse.json({
      saldoDisponible: saldoActualComisiones,
      saldoApp: saldoActualComisiones,
      totalRecaudado: ventasMes._sum?.total ?? 0,
      aPagarAgricultores: Math.max(0, totalPagosAgricultores - saldoComision),
      // Exponer tanto el total de comisiones como el saldo neto
      saldoTotalBilleteras: saldoActualComisiones,
      ventasRealizadas: ventasMes._count?.id ?? 0,
      comisionesTotales: saldoComision,
      totalPagosAgricultores,
      saldoActualComisiones,
      tarjetas,
      cards: tarjetas,
      transacciones,
    });
  } catch (error: any) {
    console.error('API admin/billetera/summary error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}