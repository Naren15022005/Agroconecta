import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id || 'AGRC_USER_DEFAULT';

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
          const wallet = await prisma.wallet.findFirst({
            where: { userId: userId },
            include: {
              transactions: { orderBy: { createdAt: 'desc' }, take: 10 }
            }
          });

          return NextResponse.json({
            saldoDisponible: Number(wallet?.balance || 0),
            totalVentasMes: 0,
            totalVentasMesNeto: 0,
            totalIngresosAcumulados: 0,
            totalIngresosNeto: 0,
            comisionPlataforma: 0,
            comisionPlataformaMes: 0,
            pedidosCompletados: 0,
            totalPagosRecibidos: 0,
            pendienteLiquidacion: 0,
            cantidadPagosRecibidos: 0,
            transacciones: wallet?.transactions.map((tx: any) => ({
              id: tx.id,
              type: tx.type === 'income' ? 'income' : 'expense',
              description: tx.description,
              amount: Number(tx.amount),
              fecha: tx.createdAt
            })) || [],
            pagosRecibidos: []
          });
        }
      } catch (_) {}
    }

    // Fallback a Firebase Cloud Firestore
    try {
      const { db } = await import('@/lib/firebase');
      const { collection, getDocs, query, where } = await import('firebase/firestore');

      const walletsRef = collection(db, 'wallets');
      const q = query(walletsRef, where('userId', '==', userId));
      const snap = await getDocs(q);

      let balance = 0;
      if (!snap.empty) {
        balance = snap.docs[0].data().balance || 0;
      }

      return NextResponse.json({
        saldoDisponible: balance,
        totalVentasMes: 0,
        totalVentasMesNeto: 0,
        totalIngresosAcumulados: balance,
        totalIngresosNeto: balance,
        comisionPlataforma: 0,
        comisionPlataformaMes: 0,
        pedidosCompletados: 0,
        totalPagosRecibidos: 0,
        pendienteLiquidacion: 0,
        cantidadPagosRecibidos: 0,
        transacciones: [],
        pagosRecibidos: []
      });
    } catch (fbErr) {
      console.error('[billetera] Error leyendo Firebase:', fbErr);
    }

    // Respuesta limpia por defecto
    return NextResponse.json({
      saldoDisponible: 0,
      totalVentasMes: 0,
      totalVentasMesNeto: 0,
      totalIngresosAcumulados: 0,
      totalIngresosNeto: 0,
      comisionPlataforma: 0,
      comisionPlataformaMes: 0,
      pedidosCompletados: 0,
      totalPagosRecibidos: 0,
      pendienteLiquidacion: 0,
      cantidadPagosRecibidos: 0,
      transacciones: [],
      pagosRecibidos: []
    });
  } catch (error) {
    return NextResponse.json({
      saldoDisponible: 0,
      totalVentasMes: 0,
      totalVentasMesNeto: 0,
      totalIngresosAcumulados: 0,
      totalIngresosNeto: 0,
      comisionPlataforma: 0,
      comisionPlataformaMes: 0,
      pedidosCompletados: 0,
      totalPagosRecibidos: 0,
      pendienteLiquidacion: 0,
      cantidadPagosRecibidos: 0,
      transacciones: [],
      pagosRecibidos: []
    });
  }
}
