import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

// GET /api/admin/billetera - Obtener el estado de la billetera del administrador
export async function GET() {
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
      return NextResponse.json({ error: 'Solo administradores pueden ver la billetera' }, { status: 403 });
    }

    // Obtener todas las órdenes para calcular la billetera
    const orders = await prisma.order.findMany({
      include: {
        items: {
          include: {
            product: {
              include: {
                agricultor: true
              }
            }
          }
        },
        buyer: true
      },
      orderBy: { createdAt: 'desc' }
    });

    // Calcular resumen financiero basado en órdenes reales
    const totalIngresos = orders.reduce((sum, order) => sum + Number(order.total || 0), 0);
    const totalComisiones = totalIngresos * 0.05; // 5% de comisión
    const pendientesPago = totalIngresos * 0.95;  // 95% a pagar a agricultores
    const balanceDisponible = totalComisiones;    // La comisión es lo que tiene disponible la plataforma

    // Crear transacciones simuladas basadas en las órdenes
    const transacciones = orders.map((order, index) => {
      const comision = Number(order.total || 0) * 0.05;
      return {
        id: index + 1,
        type: 'COMISION',
        amount: comision,
        description: `Comisión por venta - Pedido #${order.id}`,
        createdAt: order.createdAt.toISOString(),
        tipoDescripcion: 'Comisión Recibida'
      };
    });

    // Agregar transacción de entrada total al principio
    if (totalIngresos > 0) {
      transacciones.unshift({
        id: 0,
        type: 'INGRESO',
        amount: totalIngresos,
        description: `Total recaudado de ${orders.length} ventas`,
        createdAt: new Date().toISOString(),
        tipoDescripcion: 'Ingresos Totales'
      });
    }

    const resumen = {
      totalIngresos,
      totalComisiones,
      pendientesPago,
      pagosRealizados: 0, // Por implementar cuando se registren pagos a agricultores
      balanceDisponible
    };

    const billetera = {
      id: 1,
      balance: balanceDisponible,
      updatedAt: new Date().toISOString()
    };

    return NextResponse.json({
      billetera,
      resumen,
      transacciones
    });

  } catch (error) {
    console.error('Error en billetera API:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
