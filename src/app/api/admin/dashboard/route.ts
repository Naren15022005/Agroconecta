import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
    // Egresos del admin (logística, otros)
    // Buscar rol admin
    const adminRole = await prisma.role.findUnique({ where: { name: 'ADMINISTRADOR' } });
    let egresosAdmin = 0;
    let ingresosAdmin = 0;
    let saldoNetoAdmin = 0;
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
  try {
    console.log('=== Dashboard API iniciando ===');
    
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
      console.log('Obteniendo datos de órdenes...');
      
      // Obtener datos básicos de órdenes
      const orders = await prisma.order.findMany({
        select: {
          id: true,
          total: true,
          status: true
        }
      });
      
      console.log(`Encontradas ${orders.length} órdenes`);
      
      // Calcular totales
      const totalRecaudado = orders.reduce((sum, order) => sum + Number(order.total || 0), 0);
      
      resumen.ventasCount = orders.length;
      resumen.totalRecaudado = totalRecaudado;
      resumen.ventasTotal = totalRecaudado;
      resumen.pedidos = orders.length;
      resumen.ganancia = totalRecaudado * 0.05; // 5% comisión
      resumen.comisionesTotal = resumen.ganancia;
      resumen.aPagar = totalRecaudado * 0.95; // 95% para agricultores
      
      console.log('Totales calculados:', {
        totalRecaudado: resumen.totalRecaudado,
        ganancia: resumen.ganancia,
        aPagar: resumen.aPagar
      });

      // Obtener agricultores básicos
      try {
        console.log('Obteniendo agricultores...');
        
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
        
        console.log(`Encontrados ${agricultores.length} agricultores`);
        
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
                if (item.order && item.order.status !== 'CANCELADO') {
                  totalVentasAgricultor += Number(item.subtotal) || 0;
                }
              });
            });

            comision = totalVentasAgricultor * 0.05;
            aPagar = totalVentasAgricultor * 0.95;

            estadoPago = 'pendiente';
            let sumaPagos = 0;
            if (aPagar > 0) {
              const pagosRealizados = await prisma.pago.findMany({
                where: {
                  userId: usuario.id,
                  NOT: {
                    estado: 'PENDIENTE'
                  }
                }
              });
              sumaPagos = pagosRealizados.reduce((sum, pago) => sum + Number(pago.monto), 0);
              // Si no hay pagos, revisar el saldo de la wallet
              if (sumaPagos < aPagar) {
                const wallet = await prisma.wallet.findFirst({
                  where: { userId: usuario.id },
                  select: { balance: true }
                });
                if (wallet && Number(wallet.balance) >= aPagar) {
                  sumaPagos = Number(wallet.balance);
                  console.log(`Saldo de wallet para ${usuario.nombre} (${usuario.id}):`, wallet.balance);
                }
              }
              console.log(`Pagos realizados para ${usuario.nombre} (${usuario.id}):`, pagosRealizados);
              console.log(`Suma de pagos (incluyendo wallet): ${sumaPagos} vs aPagar: ${aPagar}`);
              if (sumaPagos >= aPagar) {
                estadoPago = 'liquidado';
              }
            } else {
              estadoPago = 'liquidado';
            }
          }

          pagos.push({
            id: usuario.id,
            agricultor: usuario.nombre || 'Sin nombre',
            ventas: totalVentasAgricultor,
            comision: comision,
            aPagar: aPagar,
            estado: estadoPago,
          });
        }
        
        resumen.walletsCount = agricultores.length;
        
      } catch (agricultorError) {
        console.error('Error obteniendo agricultores:', agricultorError);
      }

    } catch (dbError) {
      console.error('Error en consultas de base de datos:', dbError);
    }

    console.log('=== Dashboard API completado ===');
    
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
