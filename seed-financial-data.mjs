import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedFinancialData() {
  try {
    console.log('🌱 Agregando datos financieros de prueba...');

    // Obtener usuarios existentes
    const users = await prisma.user.findMany({
      select: { id: true, nombre: true }
    });

    if (users.length === 0) {
      console.log('❌ No hay usuarios en la base de datos. Ejecuta el seed principal primero.');
      return;
    }

    const agricultorUser = users.find(u => u.nombre.includes('agricultor') || u.nombre.includes('farmer'));
    const compradorUser = users.find(u => u.nombre.includes('comprador') || u.nombre.includes('buyer'));
    
    // Si no encontramos usuarios específicos, usar los primeros disponibles
    const vendedor = agricultorUser || users[0];
    const comprador = compradorUser || users[1] || users[0];

    console.log(`👤 Usando vendedor: ${vendedor.nombre} (${vendedor.id})`);
    console.log(`👤 Usando comprador: ${comprador.nombre} (${comprador.id})`);

    // 1. Crear billeteras
    console.log('💰 Creando billeteras...');
    const walletVendedor = await prisma.wallet.create({
      data: {
        userId: vendedor.id,
        balance: 2500000 // $2,500,000
      }
    });

    const walletComprador = await prisma.wallet.create({
      data: {
        userId: comprador.id,
        balance: 5000000 // $5,000,000
      }
    });

    // 2. Crear ventas
    console.log('🛒 Creando ventas...');
    const sale1 = await prisma.sale.create({
      data: {
        vendedorId: vendedor.id,
        compradorId: comprador.id,
        productoId: 1, // Asumiendo que existe un producto con ID 1
        cantidad: 5,
        precioUnitario: 80000,
        total: 400000
      }
    });

    const sale2 = await prisma.sale.create({
      data: {
        vendedorId: vendedor.id,
        compradorId: comprador.id,
        productoId: 2, // Asumiendo que existe un producto con ID 2
        cantidad: 10,
        precioUnitario: 25000,
        total: 250000
      }
    });

    const sale3 = await prisma.sale.create({
      data: {
        vendedorId: vendedor.id,
        compradorId: comprador.id,
        productoId: 3, // Asumiendo que existe un producto con ID 3
        cantidad: 8,
        precioUnitario: 45000,
        total: 360000
      }
    });

    // 3. Crear transacciones de billetera
    console.log('💳 Creando transacciones de billetera...');
    await prisma.walletTransaction.create({
      data: {
        walletId: walletVendedor.id,
        type: 'INGRESO',
        amount: 400000,
        description: 'Venta de Café Premium'
      }
    });

    await prisma.walletTransaction.create({
      data: {
        walletId: walletVendedor.id,
        type: 'INGRESO',
        amount: 250000,
        description: 'Venta de Banano Orgánico'
      }
    });

    await prisma.walletTransaction.create({
      data: {
        walletId: walletComprador.id,
        type: 'EGRESO',
        amount: 650000,
        description: 'Compra de productos agrícolas'
      }
    });

    // 4. Crear solicitudes de retiro
    console.log('🏦 Creando solicitudes de retiro...');
    await prisma.withdrawRequest.create({
      data: {
        userId: vendedor.id,
        amount: 300000,
        status: 'PENDIENTE'
      }
    });

    await prisma.withdrawRequest.create({
      data: {
        userId: vendedor.id,
        amount: 150000,
        status: 'PROCESADO'
      }
    });

    // 5. Crear pagos
    console.log('💸 Creando pagos...');
    await prisma.pago.create({
      data: {
        userId: vendedor.id,
        monto: 400000,
        metodoPago: 'TRANSFERENCIA',
        estado: 'COMPLETADO'
      }
    });

    await prisma.pago.create({
      data: {
        userId: vendedor.id,
        monto: 250000,
        metodoPago: 'NEQUI',
        estado: 'PENDIENTE'
      }
    });

    // 6. Crear comisiones
    console.log('📊 Creando comisiones...');
    await prisma.comision.create({
      data: {
        ventaId: sale1.id,
        monto: 20000, // 5% de 400,000
        porcentaje: 5.0
      }
    });

    await prisma.comision.create({
      data: {
        ventaId: sale2.id,
        monto: 12500, // 5% de 250,000
        porcentaje: 5.0
      }
    });

    // 7. Crear impuestos
    console.log('🧾 Creando impuestos...');
    await prisma.impuesto.create({
      data: {
        ventaId: sale1.id,
        monto: 76000, // 19% IVA de 400,000
        porcentaje: 19.0,
        tipo: 'IVA'
      }
    });

    await prisma.impuesto.create({
      data: {
        ventaId: sale2.id,
        monto: 47500, // 19% IVA de 250,000
        porcentaje: 19.0,
        tipo: 'IVA'
      }
    });

    // 8. Crear transacciones generales
    console.log('📋 Creando transacciones generales...');
    await prisma.transaccion.create({
      data: {
        userId: vendedor.id,
        tipo: 'VENTA',
        monto: 400000,
        referencia: `SALE_${sale1.id}`
      }
    });

    await prisma.transaccion.create({
      data: {
        userId: comprador.id,
        tipo: 'COMPRA',
        monto: 400000,
        referencia: `SALE_${sale1.id}`
      }
    });

    await prisma.transaccion.create({
      data: {
        userId: vendedor.id,
        tipo: 'VENTA',
        monto: 250000,
        referencia: `SALE_${sale2.id}`
      }
    });

    console.log('✅ Datos financieros agregados exitosamente!');
    console.log('📊 Resumen:');
    console.log('   - 2 billeteras creadas');
    console.log('   - 3 ventas creadas');
    console.log('   - 3 transacciones de billetera');
    console.log('   - 2 solicitudes de retiro');
    console.log('   - 2 pagos');
    console.log('   - 2 comisiones');
    console.log('   - 2 impuestos');
    console.log('   - 3 transacciones generales');

  } catch (error) {
    console.error('❌ Error al agregar datos financieros:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seedFinancialData();
