import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
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
          // Primero obtener el registro de agricultor asociado al usuario
          const agricultor = await prisma.agricultor.findUnique({
            where: {
              user_id: usuario.id
            },
            select: {
              id: true
            }
          });
          
          if (!agricultor) {
            // Si no hay registro de agricultor, incluir con ventas 0
            pagos.push({
              id: usuario.id,
              agricultorId: null, // No hay agricultor registrado
              agricultor: usuario.nombre || 'Sin nombre',
              ventas: 0,
              comision: 0,
              aPagar: 0,
              estado: 'sin_ventas',
            });
            continue;
          }
          
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
          
          let totalVentasAgricultor = 0;
          
          // Calcular total de ventas sumando los items de órdenes
          productos.forEach(producto => {
            producto.orderItems.forEach(item => {
              if (item.order && item.order.status !== 'CANCELADO') {
                totalVentasAgricultor += Number(item.subtotal) || 0;
              }
            });
          });
          
          const comision = totalVentasAgricultor * 0.05; // 5% para la plataforma
          const aPagar = totalVentasAgricultor * 0.95;   // 95% para el agricultor
          
          // Verificar si ya existe una liquidación procesada para este agricultor
          let estadoLiquidacion = 'pendiente';
          let fechaLiquidacion = null;
          let numeroTransaccion = null;
          
          if (aPagar <= 0) {
            estadoLiquidacion = 'sin_ventas';
          } else {
            // Buscar la última liquidación directa para este agricultor
            const ultimaLiquidacion = await prisma.walletTransaction.findFirst({
              where: {
                wallet: {
                  userId: usuario.id
                },
                type: 'PAGO_DIRECTO_ADMIN'
              },
              orderBy: {
                createdAt: 'desc'
              }
            });

            if (ultimaLiquidacion) {
              const totalLiquidado = await prisma.walletTransaction.aggregate({
                where: {
                  wallet: {
                    userId: usuario.id
                  },
                  type: 'PAGO_DIRECTO_ADMIN'
                },
                _sum: {
                  amount: true
                }
              });

              const montoLiquidado = Number(totalLiquidado._sum.amount) || 0;
              
              // Si ya se liquidó un monto igual o mayor al que debe cobrar, está liquidado
              if (montoLiquidado >= aPagar) {
                estadoLiquidacion = 'liquidado';
                fechaLiquidacion = ultimaLiquidacion.createdAt.toISOString();
                numeroTransaccion = `TXN-AGRC-USR-${agricultor.id.slice(-8)}-${ultimaLiquidacion.createdAt.getTime().toString().slice(-6)}`;
              }
            }
          }
          
          console.log(`Agricultor ${usuario.nombre}: Ventas=${totalVentasAgricultor}, A pagar=${aPagar}, Estado=${estadoLiquidacion}`);
          
          // Solo incluir agricultores con ventas o mostrar todos
          pagos.push({
            id: usuario.id,
            agricultorId: agricultor.id, // Agregar el ID del agricultor
            agricultor: usuario.nombre || 'Sin nombre',
            ventas: totalVentasAgricultor,
            comision: comision,
            aPagar: aPagar,
            estado: estadoLiquidacion,
            fechaLiquidacion: fechaLiquidacion,
            numeroTransaccion: numeroTransaccion,
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
