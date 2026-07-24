import { initializeApp } from 'firebase/app';
import { getFirestore, collection, setDoc, doc } from 'firebase/firestore';
import bcrypt from 'bcryptjs';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyCbKDfj8VgIcZhFDH2t6PCZln7YxrXeUKc",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "agroconecta-dev-2026.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "agroconecta-dev-2026",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "agroconecta-dev-2026.firebasestorage.app",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "1050923023396",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:1050923023396:web:b4d5b37716a5a5b7eeacb1"
};

async function seedCompleteFirebase() {
  console.log("🌱 Migrando el esquema completo de Prisma (27 Modelos) a Firebase Cloud Firestore...\n");

  const app = initializeApp(firebaseConfig);
  const db = getFirestore(app);

  async function safeSetDoc(colName, docId, data) {
    try {
      await setDoc(doc(db, colName, String(docId)), data);
      console.log(`  ✅ [${colName}] -> ${docId}`);
    } catch (err) {
      console.error(`  ❌ [${colName}] Error en ${docId}:`, err?.message || err);
    }
  }

  // 1. Roles
  console.log("1. 👥 Colección 'roles'");
  const roles = [
    { id: 'AGRC_ROL_ADMIN', name: 'ADMINISTRADOR', displayName: 'Administrador', description: 'Acceso completo al sistema', isActive: true },
    { id: 'AGRC_ROL_AGRICULTOR', name: 'CAMPESINO', displayName: 'Campesino/Agricultor', description: 'Productor agrícola', isActive: true },
    { id: 'AGRC_ROL_CLIENTE', name: 'COMPRADOR', displayName: 'Comprador', description: 'Comprador individual', isActive: true },
    { id: 'AGRC_ROL_EMPRESA', name: 'EMPRESA', displayName: 'Empresa', description: 'Comprador mayorista', isActive: true }
  ];
  for (const r of roles) await safeSetDoc('roles', r.id, r);

  // 2. Usuarios
  console.log("\n2. 👤 Colección 'users'");
  const adminHash = await bcrypt.hash('admin123', 10);
  const farmerHash = await bcrypt.hash('carlos123', 10);
  const buyerHash = await bcrypt.hash('maria123', 10);

  const users = [
    { id: 'AGRC_USER_ADMIN', nombre: 'Administrador AgroConecta', correo: 'admin@agroconecta.com', contraseña: adminHash, role: 'ADMINISTRADOR', roleId: 'AGRC_ROL_ADMIN', isActive: true, createdAt: new Date().toISOString() },
    { id: 'AGRC_USER_FARMER1', nombre: 'Carlos Mejía', correo: 'carlos@agroconecta.com', contraseña: farmerHash, role: 'CAMPESINO', roleId: 'AGRC_ROL_AGRICULTOR', isActive: true, createdAt: new Date().toISOString() },
    { id: 'AGRC_USER_BUYER1', nombre: 'María Rodríguez', correo: 'maria@agroconecta.com', contraseña: buyerHash, role: 'COMPRADOR', roleId: 'AGRC_ROL_CLIENTE', isActive: true, createdAt: new Date().toISOString() }
  ];
  for (const u of users) await safeSetDoc('users', u.id, u);

  // 3. Agricultores (Perfil)
  console.log("\n3. 🧑‍🌾 Colección 'agricultores'");
  const agricultores = [
    { id: 'AGRC_AGR_001', user_id: 'AGRC_USER_FARMER1', telefono: '3101234567', ubicacion: 'Medellín, Antioquia', descripcion: 'Finca La Montaña', verificado: true, createdAt: new Date().toISOString() }
  ];
  for (const a of agricultores) await safeSetDoc('agricultores', a.id, a);

  // 4. Clientes (Perfil)
  console.log("\n4. 🛒 Colección 'clientes'");
  const clientes = [
    { id: 'AGRC_CLI_001', user_id: 'AGRC_USER_BUYER1', telefono: '3209876543', direccion: 'Calle 10 # 40-20, Cali', createdAt: new Date().toISOString() }
  ];
  for (const c of clientes) await safeSetDoc('clientes', c.id, c);

  // 5. Empresas (Perfil)
  console.log("\n5. 🏢 Colección 'empresas'");
  const empresas = [
    { id: 'AGRC_EMP_001', user_id: 'AGRC_USER_ADMIN', razon_social: 'AgroConecta Corp S.A.S.', nit: '901234567-1', telefono: '6015550000', direccion: 'Carrera 7 # 100-01, Bogotá', verificada: true, createdAt: new Date().toISOString() }
  ];
  for (const e of empresas) await safeSetDoc('empresas', e.id, e);

  // 6. Categorías
  console.log("\n6. 🏷️ Colección 'categories'");
  const categories = [
    { id: 'AGRC_CAT_FRUTAS', name: 'Frutas', description: 'Productos frutales frescos', isActive: true },
    { id: 'AGRC_CAT_VERDURAS', name: 'Verduras', description: 'Hortalizas y verduras', isActive: true },
    { id: 'AGRC_CAT_TUBERCULOS', name: 'Tubérculos', description: 'Papa, yuca, ñame', isActive: true },
    { id: 'AGRC_CAT_CAFE', name: 'Café', description: 'Café especial', isActive: true },
    { id: 'AGRC_CAT_LACTEOS', name: 'Lácteos', description: 'Quesos y derivados', isActive: true },
    { id: 'AGRC_CAT_GRANOS', name: 'Granos', description: 'Frijol, maíz, arroz', isActive: true },
    { id: 'AGRC_CAT_HIERBAS', name: 'Hierbas', description: 'Aromáticas y medicinales', isActive: true }
  ];
  for (const cat of categories) await safeSetDoc('categories', cat.id, cat);

  // 7. Subcategorías
  console.log("\n7. 🔖 Colección 'subcategories'");
  const subcategories = [
    { id: 'AGRC_SUB_CITRICOS', categoryId: 'AGRC_CAT_FRUTAS', name: 'Cítricos', description: 'Limón, naranja, mandarina', isActive: true },
    { id: 'AGRC_SUB_TROPICALES', categoryId: 'AGRC_CAT_FRUTAS', name: 'Tropicales', description: 'Plátano, banano, piña', isActive: true },
    { id: 'AGRC_SUB_HOJAS', categoryId: 'AGRC_CAT_VERDURAS', name: 'Hortalizas de Hoja', description: 'Lechuga, espinaca', isActive: true },
    { id: 'AGRC_SUB_PAPA', categoryId: 'AGRC_CAT_TUBERCULOS', name: 'Papa', description: 'Criolla, pastusa', isActive: true }
  ];
  for (const sub of subcategories) await safeSetDoc('subcategories', sub.id, sub);

  // 8. Productos
  console.log("\n8. 🌾 Colección 'products'");
  const products = [
    {
      id: 'AGRC_PRD_001',
      name: 'Plátano Hartón Premium',
      description: 'Plátanos frescos y maduros, ideales para cocinar. Cultivados de forma orgánica.',
      price: 2500,
      stock: 120,
      unit: 'kg',
      category: 'Frutas',
      categoryId: 'AGRC_CAT_FRUTAS',
      subcategoryId: 'AGRC_SUB_TROPICALES',
      agricultor: 'Carlos Mejía',
      agricultorId: 'AGRC_AGR_001',
      ubicacion: 'Medellín, Antioquia',
      imageUrl: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=500&auto=format&fit=crop&q=80',
      status: 'DISPONIBLE',
      isActive: true,
      createdAt: new Date().toISOString()
    },
    {
      id: 'AGRC_PRD_002',
      name: 'Yuca Criolla Fresca',
      description: 'Yuca recién cosechada, perfecta para preparaciones tradicionales.',
      price: 1800,
      stock: 80,
      unit: 'kg',
      category: 'Tubérculos',
      categoryId: 'AGRC_CAT_TUBERCULOS',
      subcategoryId: 'AGRC_SUB_PAPA',
      agricultor: 'Carlos Mejía',
      agricultorId: 'AGRC_AGR_001',
      ubicacion: 'Cali, Valle del Cauca',
      imageUrl: 'https://images.unsplash.com/photo-1590165482129-1b8b27698780?w=500&auto=format&fit=crop&q=80',
      status: 'DISPONIBLE',
      isActive: true,
      createdAt: new Date().toISOString()
    },
    {
      id: 'AGRC_PRD_003',
      name: 'Café Especial Arábica',
      description: 'Granos de café premium, tostado medio. Aroma intenso.',
      price: 15000,
      stock: 50,
      unit: '500g',
      category: 'Café',
      categoryId: 'AGRC_CAT_CAFE',
      agricultor: 'Carlos Mejía',
      agricultorId: 'AGRC_AGR_001',
      ubicacion: 'Manizales, Caldas',
      imageUrl: 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=500&auto=format&fit=crop&q=80',
      status: 'DISPONIBLE',
      isActive: true,
      createdAt: new Date().toISOString()
    }
  ];
  for (const p of products) await safeSetDoc('products', p.id, p);

  // 9. Carrito (cart_items)
  console.log("\n9. 🛒 Colección 'cart_items'");
  const cartItems = [
    { id: 'AGRC_CRT_001', userId: 'AGRC_USER_BUYER1', productId: 'AGRC_PRD_001', quantity: 2, createdAt: new Date().toISOString() }
  ];
  for (const item of cartItems) await safeSetDoc('cart_items', item.id, item);

  // 10. Pedidos (orders)
  console.log("\n10. 📦 Colección 'orders'");
  const orders = [
    { id: 'AGRC_ORD_001', buyerId: 'AGRC_USER_BUYER1', total: 5000, status: 'PENDIENTE', deliveryMethod: 'ENTREGA_DIRECTA', paymentMethod: 'NEQUI', createdAt: new Date().toISOString() }
  ];
  for (const ord of orders) await safeSetDoc('orders', ord.id, ord);

  // 11. Ítems de Pedidos (order_items)
  console.log("\n11. 📋 Colección 'order_items'");
  const orderItems = [
    { id: 'AGRC_ORI_001', orderId: 'AGRC_ORD_001', productId: 'AGRC_PRD_001', quantity: 2, price: 2500, subtotal: 5000 }
  ];
  for (const ori of orderItems) await safeSetDoc('order_items', ori.id, ori);

  // 12. Transacciones de Pago (payment_transactions)
  console.log("\n12. 💳 Colección 'payment_transactions'");
  const paymentTx = [
    { id: 'AGRC_PTX_001', pedidoId: 'AGRC_ORD_001', compradorId: 'AGRC_USER_BUYER1', agricultorId: 'AGRC_AGR_001', monto: 5000, metodo: 'NEQUI', estado: 'PENDIENTE', createdAt: new Date().toISOString() }
  ];
  for (const ptx of paymentTx) await safeSetDoc('payment_transactions', ptx.id, ptx);

  // 13. Ordenes de Pago Administrativas (payment_orders)
  console.log("\n13. 📑 Colección 'payment_orders'");
  const paymentOrders = [
    { id: 'AGRC_PORD_001', pedido_id: 'AGRC_ORD_001', agricultor_id: 'AGRC_AGR_001', cliente_nombre: 'María Rodríguez', producto_resumen: 'Plátano Hartón x 2kg', monto_bruto: 5000, comision_plataforma: 250, monto_neto: 4750, metodo_pago_cliente: 'NEQUI', estado: 'PENDIENTE', created_at: new Date().toISOString() }
  ];
  for (const pord of paymentOrders) await safeSetDoc('payment_orders', pord.id, pord);

  // 14. Liquidaciones (liquidaciones)
  console.log("\n14. 💰 Colección 'liquidaciones'");
  const liquidaciones = [
    { id: 'AGRC_LIQ_001', agricultor_id: 'AGRC_AGR_001', total_pagado: 4750, cantidad_pedidos: 1, tipo_pago: 'INDIVIDUAL', fecha_pago: new Date().toISOString(), created_at: new Date().toISOString() }
  ];
  for (const liq of liquidaciones) await safeSetDoc('liquidaciones', liq.id, liq);

  // 15. Favoritos (favorites)
  console.log("\n15. ❤️ Colección 'favorites'");
  const favorites = [
    { id: 'AGRC_FAV_001', userId: 'AGRC_USER_BUYER1', productId: 'AGRC_PRD_001', createdAt: new Date().toISOString() }
  ];
  for (const fav of favorites) await safeSetDoc('favorites', fav.id, fav);

  // 16. Billeteras (wallets)
  console.log("\n16. 👛 Colección 'wallets'");
  const wallets = [
    { id: '1', userId: 'AGRC_USER_FARMER1', balance: 4750, createdAt: new Date().toISOString() }
  ];
  for (const w of wallets) await safeSetDoc('wallets', w.id, w);

  // 17. Transacciones de Billetera (wallet_transactions)
  console.log("\n17. 🧾 Colección 'wallet_transactions'");
  const walletTx = [
    { id: '1', walletId: 1, type: 'ABONO_VENTA', amount: 4750, description: 'Venta de Plátano Hartón', createdAt: new Date().toISOString() }
  ];
  for (const wtx of walletTx) await safeSetDoc('wallet_transactions', wtx.id, wtx);

  // 18. Ventas (sales)
  console.log("\n18. 📊 Colección 'sales'");
  const sales = [
    { id: '1', vendedorId: 'AGRC_USER_FARMER1', compradorId: 'AGRC_USER_BUYER1', productoId: 'AGRC_PRD_001', cantidad: 2, precioUnitario: 2500, total: 5000, fecha: new Date().toISOString() }
  ];
  for (const s of sales) await safeSetDoc('sales', s.id, s);

  // 19. Solicitudes de Retiro (withdraw_requests)
  console.log("\n19. 🏦 Colección 'withdraw_requests'");
  const withdraws = [
    { id: '1', userId: 'AGRC_USER_FARMER1', amount: 4000, status: 'PENDIENTE', requestedAt: new Date().toISOString() }
  ];
  for (const w of withdraws) await safeSetDoc('withdraw_requests', w.id, w);

  // 20. Pagos (pagos)
  console.log("\n20. 💵 Colección 'pagos'");
  const pagos = [
    { id: '1', userId: 'AGRC_USER_BUYER1', monto: 5000, metodoPago: 'NEQUI', estado: 'APROBADO', fecha: new Date().toISOString() }
  ];
  for (const p of pagos) await safeSetDoc('pagos', p.id, p);

  // 21. Comisiones (comisiones)
  console.log("\n21. 📈 Colección 'comisiones'");
  const comisiones = [
    { id: '1', ventaId: 1, porcentaje: 5, monto: 250, fecha: new Date().toISOString() }
  ];
  for (const com of comisiones) await safeSetDoc('comisiones', com.id, com);

  // 22. Impuestos (impuestos)
  console.log("\n22. 🏛️ Colección 'impuestos'");
  const impuestos = [
    { id: '1', ventaId: 1, tipo: 'IVA', porcentaje: 0, monto: 0, fecha: new Date().toISOString() }
  ];
  for (const imp of impuestos) await safeSetDoc('impuestos', imp.id, imp);

  // 23. Transacciones (transacciones)
  console.log("\n23. 🔄 Colección 'transacciones'");
  const transacciones = [
    { id: '1', userId: 'AGRC_USER_BUYER1', tipo: 'COMPRA', monto: 5000, referencia: 'AGRC_ORD_001', fecha: new Date().toISOString() }
  ];
  for (const t of transacciones) await safeSetDoc('transacciones', t.id, t);

  // 24. Notificaciones (notifications)
  console.log("\n24. 🔔 Colección 'notifications'");
  const notifications = [
    { id: 'AGRC_NOT_001', userId: 'AGRC_USER_FARMER1', pedidoId: 'AGRC_ORD_001', message: '¡Tienes un nuevo pedido de Plátano Hartón!', isRead: false, createdAt: new Date().toISOString() }
  ];
  for (const n of notifications) await safeSetDoc('notifications', n.id, n);

  // 25. Tokens de Verificación (verification_tokens)
  console.log("\n25. 🔑 Colección 'verification_tokens'");
  const vTokens = [
    { id: 'AGRC_VTK_001', identifier: 'carlos@agroconecta.com', token: 'token-demo-12345', expires: new Date(Date.now() + 86400000).toISOString() }
  ];
  for (const vt of vTokens) await safeSetDoc('verification_tokens', vt.id, vt);

  // 26. Cuentas Vinculadas (accounts)
  console.log("\n26. 🔗 Colección 'accounts'");
  const accounts = [
    { id: 'AGRC_ACC_001', userId: 'AGRC_USER_BUYER1', type: 'oauth', provider: 'google', providerAccountId: '123456789' }
  ];
  for (const acc of accounts) await safeSetDoc('accounts', acc.id, acc);

  // 27. Sesiones (sessions)
  console.log("\n27. 🎟️ Colección 'sessions'");
  const sessions = [
    { id: 'AGRC_SES_001', sessionToken: 'session-demo-token-99', userId: 'AGRC_USER_BUYER1', expires: new Date(Date.now() + 86400000).toISOString() }
  ];
  for (const s of sessions) await safeSetDoc('sessions', s.id, s);

  console.log("\n🎉 ¡MIGRACIÓN DE LAS 27 COLECCIONES DEL MODELO PRISMA A FIREBASE COMPLETADA EXITOSAMENTE!");
}

seedCompleteFirebase().catch(err => {
  console.error("❌ Error en sembrado completo:", err);
});
