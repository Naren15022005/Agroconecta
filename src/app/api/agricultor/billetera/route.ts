import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    // Obtener información del agricultor
    const agricultor = await prisma.agricultor.findUnique({
      where: { user_id: session.user.id },
      select: { id: true }
    });

    if (!agricultor) {
      return NextResponse.json({ error: 'Agricultor no encontrado' }, { status: 404 });
    }

    const agricultorId = agricultor.id;
    
    // Obtener wallet del usuario
    const wallet = await prisma.wallet.findFirst({
      where: { userId: session.user.id },
      include: {
        transactions: {
          orderBy: { createdAt: 'desc' },
          take: 10
        }
      }
    });

    // Obtener ventas del mes actual (usando vendedorId = user_id)
    const now = new Date();
    const mesInicio = new Date(now.getFullYear(), now.getMonth(), 1);
    const mesFin = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

    const ventasDelMes = await prisma.sale.findMany({
      where: {
        vendedorId: session.user.id,
        fecha: {
          gte: mesInicio,
          lte: mesFin
        }
      }
    });

    // Calcular totales del mes
    const totalVentasMes = ventasDelMes.reduce((sum, sale) => sum + Number(sale.total), 0);

    // Obtener pagos recibidos (últimos 10) - los Pago asociados a este usuario
    const pagosRecibidos = await prisma.pago.findMany({
      where: {
        userId: session.user.id,
        estado: 'LIQUIDADO'
      },
      orderBy: { fecha: 'desc' },
      take: 10
    });

    // Obtener liquidaciones para contar pedidos asociados
    // Nota: `liquidaciones.agricultor_id` referencia el `Agricultor.id`, no `User.id`
    const liquidaciones = await prisma.liquidacion.findMany({
      where: { agricultor_id: agricultorId },
      orderBy: { fecha_pago: 'desc' },
      take: 10
    });

    // Calcular total de ingresos acumulados desde ventas
    const totalIngresosAcumulados = await prisma.sale.aggregate({
      where: { vendedorId: session.user.id },
      _sum: { total: true }
    });

    // Calcular montos bruto, comisión (10%) y neto
    const totalBruto = Number(totalIngresosAcumulados._sum.total || 0);
    const totalBrutoMes = totalVentasMes;
    const comisionPlataforma = totalBruto * 0.10;
    const comisionPlataformaMes = totalBrutoMes * 0.10;
    const totalNeto = totalBruto - comisionPlataforma;
    const totalNetoMes = totalBrutoMes - comisionPlataformaMes;

    // Calcular total de pagos ya recibidos (liquidados)
    const totalPagosRecibidos = pagosRecibidos.reduce((sum, pago) => sum + Number(pago.monto), 0);
    
    // Calcular pendiente de liquidación (ganancia neta - pagos recibidos)
    const pendienteLiquidacion = totalNeto - totalPagosRecibidos;

    // Obtener estadísticas de pedidos
    const pedidosCompletados = await prisma.order.count({
      where: {
        items: {
          some: {
            product: {
              agricultorId
            }
          }
        },
        status: {
          in: ['CONFIRMADO', 'ENTREGADO']
        }
      }
    });

    return NextResponse.json({
      saldoDisponible: Number(wallet?.balance || 0),
      totalVentasMes,
      totalVentasMesNeto: totalNetoMes,
      totalIngresosAcumulados: totalBruto,
      totalIngresosNeto: totalNeto,
      comisionPlataforma,
      comisionPlataformaMes,
      pedidosCompletados,
      totalPagosRecibidos,
      pendienteLiquidacion,
      cantidadPagosRecibidos: pagosRecibidos.length,
      transacciones: wallet?.transactions.map((tx: any) => ({
        id: tx.id,
        type: tx.type === 'income' ? 'income' : 'expense',
        description: tx.description,
        amount: Number(tx.amount),
        fecha: tx.createdAt
      })) || [],
      pagosRecibidos: pagosRecibidos.map((pago: any, index: number) => {
        const liquidacion = liquidaciones.find(l => {
          const pagoDate = new Date(pago.fecha);
          const liqDate = new Date(l.fecha_pago);
          return Math.abs(pagoDate.getTime() - liqDate.getTime()) < 60000; // within 1 minute
        });
        const comprobanteFromLiq = liquidacion?.comprobante_url ?? null;
        return {
          id: pago.id,
          monto: Number(pago.monto),
          fecha: pago.fecha,
          ordenes: liquidacion?.cantidad_pedidos || 0,
          estado: pago.estado,
          referencia: pago.referencia || null,
          metodoPago: pago.metodoPago || pago.metodo_pago || null,
          comprobanteUrl: comprobanteFromLiq || (pago.comprobanteUrl || pago.comprobante_url || null)
        };
      })
    });

  } catch (error: any) {
    console.error('Error en GET /api/agricultor/billetera:', error);
    console.error('Error stack:', error?.stack);
    console.error('Error message:', error?.message);
    return NextResponse.json({ 
      error: 'Error interno del servidor',
      details: error?.message,
      stack: process.env.NODE_ENV === 'development' ? error?.stack : undefined
    }, { status: 500 });
  }
}
