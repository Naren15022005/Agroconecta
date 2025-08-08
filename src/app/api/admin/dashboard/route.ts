import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // Usar consultas simples y directas
    let resumen = {
      totalRecaudado: 0,
      ganancia: 0,
      aPagar: 0,
      pedidos: 0,
      totalWallets: 0,
      walletsCount: 0,
      ventasCount: 0,
      ventasTotal: 0,
      retirosPendientes: 0,
      retirosAprobados: 0,
      pagosPendientes: 0,
      pagosCompletados: 0,
      comisionesTotal: 0,
      impuestosTotal: 0,
    };

    let pagos: any[] = [];

    try {
      // Obtener conteo de ventas
      const ventasResult = await prisma.$queryRaw`SELECT COUNT(*) as count, COALESCE(SUM(total), 0) as total FROM sales`;
      if (Array.isArray(ventasResult) && ventasResult.length > 0) {
        const venta = ventasResult[0] as any;
        resumen.ventasCount = Number(venta.count) || 0;
        resumen.totalRecaudado = Number(venta.total) || 0;
        resumen.ventasTotal = Number(venta.total) || 0;
        resumen.pedidos = Number(venta.count) || 0;
      }

      // Obtener comisiones
      const comisionesResult = await prisma.$queryRaw`SELECT COALESCE(SUM(monto), 0) as total FROM comisiones`;
      if (Array.isArray(comisionesResult) && comisionesResult.length > 0) {
        const comision = comisionesResult[0] as any;
        resumen.ganancia = Number(comision.total) || 0;
        resumen.comisionesTotal = Number(comision.total) || 0;
      }

      // Obtener billeteras
      const walletsResult = await prisma.$queryRaw`SELECT COUNT(*) as count, COALESCE(SUM(balance), 0) as total FROM wallets`;
      if (Array.isArray(walletsResult) && walletsResult.length > 0) {
        const wallet = walletsResult[0] as any;
        resumen.walletsCount = Number(wallet.count) || 0;
        resumen.totalWallets = Number(wallet.total) || 0;
      }

      // Obtener pagos
      const pagosResult = await prisma.$queryRaw`
        SELECT 
          COUNT(CASE WHEN estado = 'PENDIENTE' THEN 1 END) as pendientes,
          COUNT(CASE WHEN estado = 'COMPLETADO' THEN 1 END) as completados
        FROM pagos
      `;
      if (Array.isArray(pagosResult) && pagosResult.length > 0) {
        const pago = pagosResult[0] as any;
        resumen.pagosPendientes = Number(pago.pendientes) || 0;
        resumen.pagosCompletados = Number(pago.completados) || 0;
      }

      // Obtener retiros
      const retirosResult = await prisma.$queryRaw`
        SELECT 
          COUNT(CASE WHEN status = 'PENDIENTE' THEN 1 END) as pendientes,
          COUNT(CASE WHEN status = 'PROCESADO' THEN 1 END) as procesados
        FROM withdraw_requests
      `;
      if (Array.isArray(retirosResult) && retirosResult.length > 0) {
        const retiro = retirosResult[0] as any;
        resumen.retirosPendientes = Number(retiro.pendientes) || 0;
        resumen.retirosAprobados = Number(retiro.procesados) || 0;
      }

      // Obtener impuestos
      const impuestosResult = await prisma.$queryRaw`SELECT COALESCE(SUM(monto), 0) as total FROM impuestos`;
      if (Array.isArray(impuestosResult) && impuestosResult.length > 0) {
        const impuesto = impuestosResult[0] as any;
        resumen.impuestosTotal = Number(impuesto.total) || 0;
      }

      // Calcular a pagar
      resumen.aPagar = resumen.totalRecaudado - resumen.ganancia;

      // Obtener agricultores
      const agricultoresResult = await prisma.$queryRaw`
        SELECT 
          u.id,
          u.nombre,
          COALESCE(SUM(w.balance), 0) as ventas,
          COALESCE(SUM(p.monto), 0) as totalPagos,
          COUNT(CASE WHEN p.estado = 'PENDIENTE' THEN 1 END) as pagosPendientes
        FROM users u
        INNER JOIN roles r ON u.roleId = r.id
        LEFT JOIN wallets w ON u.id = w.userId
        LEFT JOIN pagos p ON u.id = p.userId
        WHERE r.name = 'CAMPESINO'
        GROUP BY u.id, u.nombre
        LIMIT 10
      `;

      if (Array.isArray(agricultoresResult)) {
        pagos = agricultoresResult.map((agricultor: any) => ({
          id: agricultor.id,
          agricultor: agricultor.nombre || 'Sin nombre',
          ventas: Number(agricultor.ventas) || 0,
          comision: (Number(agricultor.totalPagos) || 0) * 0.05,
          estado: Number(agricultor.pagosPendientes) > 0 ? 'pendiente' : 'pagado',
        }));
      }

    } catch (dbError) {
      console.error('Error en consultas de base de datos:', dbError);
    }

    return NextResponse.json({
      resumen,
      pagos,
      walletTransactions: [],
      transaccionesRecientes: [],
    });

  } catch (error) {
    console.error('Error general en dashboard API:', error);
    return NextResponse.json(
      { 
        error: 'Error interno del servidor',
        message: error instanceof Error ? error.message : 'Error desconocido'
      }, 
      { status: 500 }
    );
  }
}
