import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { startOfMonth, endOfMonth } from 'date-fns';

export async function GET(req: NextRequest) {
    // Egresos del mes (logística, otros)
    const egresosMes = await prisma.walletTransaction.aggregate({
      where: {
        walletId: { in: walletIds },
        type: { in: ['egreso', 'logistica'] },
        createdAt: { gte: mesInicio, lte: mesFin },
      },
      _sum: { amount: true },
    });

    // Saldo neto: ingresos - egresos
    const saldoNeto = (ingresosMes._sum?.amount ?? 0) - (egresosMes._sum?.amount ?? 0);
  try {
    // Buscar el rol ADMIN
  const adminRole = await prisma.role.findUnique({ where: { name: 'ADMINISTRADOR' } });
  if (!adminRole) return NextResponse.json({ error: 'Rol ADMINISTRADOR no encontrado' }, { status: 404 });



    // Buscar todas las billeteras de usuarios admin
    const adminUsers = await prisma.user.findMany({ where: { roleId: adminRole.id } });
    const adminUserIds = adminUsers.map(u => u.id);
    const wallets = await prisma.wallet.findMany({ where: { userId: { in: adminUserIds } } });
    if (!wallets.length) {
      return NextResponse.json({ error: 'No hay billeteras de admin' }, { status: 404 });
    }
    // Sumar el saldo de todas las billeteras admin
    const saldoDisponible = wallets.reduce((sum, w) => sum + Number(w.balance), 0);
    const walletIds = wallets.map(w => w.id);

    // Fechas del mes actual
    const now = new Date();
    const mesInicio = startOfMonth(now);
    const mesFin = endOfMonth(now);

    // Ingresos totales del mes (comisiones)
    const ingresosMes = await prisma.walletTransaction.aggregate({
      where: {
        walletId: { in: walletIds },
        type: 'income',
        createdAt: { gte: mesInicio, lte: mesFin },
      },
      _sum: { amount: true },
    });

    // Total liquidado a agricultores en el mes
    const liquidacionesMes = await prisma.walletTransaction.aggregate({
      where: {
        walletId: { in: walletIds },
        type: 'liquidacion',
        createdAt: { gte: mesInicio, lte: mesFin },
      },
      _sum: { amount: true },
    });

    // Transacciones recientes (últimos 10 movimientos de todas las billeteras admin)
    const transacciones = await prisma.walletTransaction.findMany({
      where: { walletId: { in: walletIds } },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });


    // Tarjetas asociadas (mock, puedes hacer que venga de BD si lo tienes)
    const cards = [
      {
        id: 1,
        type: 'Neki',
        number: '**** **** **** 1234',
        holder: 'ADMIN AGRO',
        expiry: '09/28',
        color: 'linear-gradient(45deg, #ff4e50, #f9d423)',
        logo: 'nequi',
      },
      {
        id: 2,
        type: 'Bancolombia',
        number: '**** **** **** 5678',
        holder: 'ADMIN AGRO',
        expiry: '12/29',
        color: 'linear-gradient(45deg, #0057b8, #ffd600)',
        logo: 'bancolombia',
      },
    ];


    return NextResponse.json({
  saldoDisponible,
  ingresosMes: ingresosMes._sum?.amount ?? 0,
  egresosMes: egresosMes._sum?.amount ?? 0,
  saldoNeto,
  liquidacionesMes: liquidacionesMes._sum?.amount ?? 0,
  cards,
  transacciones,
    });
  } catch (error: any) {
    const message = typeof error === 'object' && error !== null && 'message' in error ? (error as any).message : 'Error desconocido';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
