import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Safe logger to avoid JSON serialization errors in Next dev streaming
function safeStringify(obj: any) {
  const seen = new WeakSet();
  return JSON.stringify(obj, function (_key, value) {
    if (typeof value === 'bigint') return value.toString();
    if (typeof value === 'object' && value !== null) {
      if (seen.has(value)) return '[Circular]';
      seen.add(value);
    }
    return value;
  });
}

function safeLog(...args: any[]) {
  try {
    const parts = args.map(a => (typeof a === 'object' ? safeStringify(a) : String(a)));
    console.log(parts.join(' '));
  } catch (e) {
    console.log('safeLog error:', String(e));
  }
}

export async function GET() {
    let egresosAdmin = 0;
    let ingresosAdmin = 0;
    let saldoNetoAdmin = 0;
  try {
    safeLog('=== Dashboard API iniciando ===');

    // Egresos del admin (logística, otros)
    try {
      const adminRole = await prisma.role.findUnique({ where: { name: 'ADMINISTRADOR' } });
      if (adminRole) {
        const adminUsers = await prisma.user.findMany({ where: { roleId: adminRole.id } });
        const adminUserIds = adminUsers.map(u => u.id);
        const wallets = await prisma.wallet.findMany({ where: { userId: { in: adminUserIds } } });
        const walletIds = wallets.map(w => w.id);
        // Ingresos (comisiones)
        const ingresosMes = await prisma.walletTransaction.aggregate({
          where: {
            walletId: { in: walletIds },
            type: 'income',
          },
          _sum: { amount: true },
        });
        // Egresos (logística, otros)
        const egresosMes = await prisma.walletTransaction.aggregate({
          where: {
            walletId: { in: walletIds },
            type: { in: ['egreso', 'logistica'] },
          },
          _sum: { amount: true },
        });
        ingresosAdmin = ingresosMes._sum?.amount ?? 0;
        egresosAdmin = egresosMes._sum?.amount ?? 0;
        saldoNetoAdmin = ingresosAdmin - egresosAdmin;
      }
    } catch (adminErr) {
      safeLog('Error calculating admin finances:', String(adminErr));
    }
    
    // Inicializar resumen con valores por defecto
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
      safeLog('Obteniendo datos de órdenes...');
      
      // Obtener datos básicos de órdenes: pedidos confirmados/entregados con pago verificado
      const orders = await prisma.order.findMany({
        where: { 
          status: { in: ['CONFIRMADO', 'ENTREGADO'] }, 
          pagoVerificado: true 
        },
        select: {
          id: true,
          total: true,
          status: true,
          pagoVerificado: true,
          createdAt: true
        }
      });
      
      safeLog(`Encontradas ${orders.length} órdenes`);
      
      // Calcular totales
      const totalRecaudado = orders.reduce((sum, order) => sum + Number(order.total || 0), 0);

      resumen.ventasCount = orders.length;
      resumen.totalRecaudado = totalRecaudado;
      resumen.ventasTotal = totalRecaudado;
      resumen.pedidos = orders.length;
      resumen.ganancia = totalRecaudado * 0.10; // 10% comisión
      resumen.comisionesTotal = resumen.ganancia;
      resumen.aPagar = totalRecaudado * 0.90; // 90% para agricultores
      resumen.ticketPromedio = orders.length > 0 ? (totalRecaudado / orders.length) : 0;
      
      safeLog('Totales calculados:', {
        totalRecaudado: resumen.totalRecaudado,
        ganancia: resumen.ganancia,
        aPagar: resumen.aPagar
      });

      // Obtener agricultores básicos
      try {
        safeLog('Obteniendo agricultores...');
        
        const agricultores = await prisma.user.findMany({
          where: {
            role: {
              name: 'CAMPESINO'
            }
          },
          select: {
            id: true,
            nombre: true
          }
        });
        
        safeLog(`Encontrados ${agricultores.length} agricultores`);
        
        // Calcular ventas reales por agricultor
        pagos = [];
        
        for (const usuario of agricultores) {
          // Obtener el registro de agricultor asociado al usuario
          const agricultor = await prisma.agricultor.findUnique({
            where: {
              user_id: usuario.id
            },
            select: {
              id: true
            }
          });

          let totalVentasAgricultor = 0;
          let comision = 0;
          let aPagar = 0;
          let estadoPago = 'sin_ventas';

          if (agricultor) {
            // Obtener productos del agricultor
            const productos = await prisma.product.findMany({
              where: {
                agricultorId: agricultor.id
              },
              select: {
                id: true,
                orderItems: {
                  include: {
                    order: true
                  }
                }
              }
            });

            productos.forEach(producto => {
            producto.orderItems.forEach(item => {
              // Contar items cuya orden esté confirmada/entregada y con pago verificado
              if (item.order && ['CONFIRMADO', 'ENTREGADO'].includes(item.order.status) && item.order.pagoVerificado) {
                totalVentasAgricultor += Number(item.subtotal) || 0;
              }
            });
            });

            comision = totalVentasAgricultor * 0.10;
            aPagar = totalVentasAgricultor * 0.90;

            // Determine payment status
            if (totalVentasAgricultor === 0) {
              estadoPago = 'sin_ventas';
            } else {
              estadoPago = 'pendiente';
              let sumaPagos = 0;

              // Sum Liquidacion records for this agricultor
              const liquidaciones = await prisma.liquidacion.findMany({ where: { agricultor_id: agricultor?.id } });
              sumaPagos += liquidaciones.reduce((sum, l) => sum + Number(l.total_pagado), 0);

              // Also check Pago table (completed payments)
              const pagosRealizados = await prisma.pago.findMany({
                where: {
                  userId: usuario.id,
                  NOT: { estado: 'PENDIENTE' }
                }
              });
              sumaPagos += pagosRealizados.reduce((sum, pago) => sum + Number(pago.monto), 0);

              safeLog(`Liquidaciones para ${usuario.nombre} (${usuario.id}): liquidaciones=${liquidaciones.length}, sumaPagos=${sumaPagos} vs aPagar=${aPagar}`);

              if (sumaPagos >= aPagar) {
                estadoPago = 'liquidado';
              }
            }
          }

          pagos.push({
            id: usuario.id,
            agricultorId: agricultor?.id,
            agricultor: usuario.nombre || 'Sin nombre',
            ventas: totalVentasAgricultor,
            comision: comision,
            aPagar: aPagar,
            estado: estadoPago,
          });
        }
        
        resumen.walletsCount = agricultores.length;
        
      } catch (agricultorError) {
        safeLog('Error obteniendo agricultores:', String(agricultorError));
      }

    } catch (dbError) {
      safeLog('Error en consultas de base de datos:', String(dbError));
    }

    // Ensure ingresosAdmin reflects commission from confirmed & validated orders
    ingresosAdmin = resumen.ganancia;
    saldoNetoAdmin = ingresosAdmin - egresosAdmin;

    safeLog('=== Dashboard API completado ===');
    
    return NextResponse.json({
      resumen: {
        ...resumen,
        ingresosAdmin,
        egresosAdmin,
        saldoNetoAdmin,
      },
      pagos,
      walletTransactions: [],
      transaccionesRecientes: [],
    });

  } catch (error) {
    safeLog('Error general en dashboard API:', String(error));
    return NextResponse.json(
      { 
        error: 'Error interno del servidor',
        message: error instanceof Error ? error.message : 'Error desconocido'
      }, 
      { status: 500 }
    );
  }
}
