import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    // Obtener datos de órdenes - MISMO CÁLCULO QUE DASHBOARD
    const orders = await prisma.order.findMany({
      select: { id: true, total: true, status: true }
    });

    const totalRecaudado = orders.reduce((sum, order) => sum + Number(order.total || 0), 0);
    const comisionPlataforma = totalRecaudado * 0.05; // 5% para plataforma
    const aPagarAgricultores = totalRecaudado * 0.95; // 95% para agricultores

    // DATOS EXACTOS DEL DASHBOARD
    const resumen = {
      totalIngresos: totalRecaudado,      // 9000
      totalComisiones: comisionPlataforma, // 450
      pendientesPago: aPagarAgricultores,  // 8550
      pagosRealizados: 0,
      balanceDisponible: comisionPlataforma // 450
    };

    const billetera = {
      id: 1,
      balance: comisionPlataforma, // 450
      updatedAt: new Date().toISOString()
    };

    const transacciones = [{
      id: 1,
      type: 'COMISION',
      amount: comisionPlataforma,
      description: 'Comisiones del 5% sobre ventas',
      createdAt: new Date().toISOString(),
      tipoDescripcion: 'Comisión Recibida'
    }];

    return NextResponse.json({ billetera, resumen, transacciones });

  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}
