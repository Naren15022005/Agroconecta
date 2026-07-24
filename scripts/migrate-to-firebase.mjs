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

async function seedFirebase() {
  console.log("🌱 Iniciando migración y sembrado de modelo Prisma a Firebase Cloud Firestore...\n");

  const app = initializeApp(firebaseConfig);
  const db = getFirestore(app);

  // Helper para guardar con reintento y capturar errores individuales
  async function safeSetDoc(colName, docId, data) {
    try {
      await setDoc(doc(db, colName, docId), data);
      console.log(`  ✅ [${colName}] Migrado: ${data.displayName || data.nombre || data.name || docId}`);
    } catch (err) {
      console.error(`  ❌ [${colName}] Error en ID ${docId}:`, err?.message || err);
    }
  }

  // 1. Roles
  console.log("👥 Sembrando colección 'roles'...");
  const roles = [
    { id: 'AGRC_ROL_ADMIN', name: 'ADMINISTRADOR', displayName: 'Administrador', description: 'Acceso completo al sistema' },
    { id: 'AGRC_ROL_AGRICULTOR', name: 'CAMPESINO', displayName: 'Campesino/Agricultor', description: 'Productor agrícola' },
    { id: 'AGRC_ROL_CLIENTE', name: 'COMPRADOR', displayName: 'Comprador', description: 'Comprador individual de productos' },
    { id: 'AGRC_ROL_EMPRESA', name: 'EMPRESA', displayName: 'Empresa', description: 'Comprador mayorista' }
  ];

  for (const role of roles) {
    await safeSetDoc('roles', role.id, role);
  }

  // 2. Usuarios Iniciales
  console.log("\n👤 Sembrando colección 'users'...");
  const adminPassHash = await bcrypt.hash('admin123', 10);
  const farmerPassHash = await bcrypt.hash('carlos123', 10);
  const buyerPassHash = await bcrypt.hash('maria123', 10);

  const users = [
    {
      id: 'AGRC_USER_ADMIN',
      nombre: 'Administrador AgroConecta',
      correo: 'admin@agroconecta.com',
      contraseña: adminPassHash,
      role: 'ADMINISTRADOR',
      isActive: true,
      createdAt: new Date().toISOString()
    },
    {
      id: 'AGRC_USER_FARMER1',
      nombre: 'Carlos Mejía',
      correo: 'carlos@agroconecta.com',
      contraseña: farmerPassHash,
      role: 'CAMPESINO',
      ubicacion: 'Medellín, Antioquia',
      isActive: true,
      createdAt: new Date().toISOString()
    },
    {
      id: 'AGRC_USER_BUYER1',
      nombre: 'María Rodríguez',
      correo: 'maria@agroconecta.com',
      contraseña: buyerPassHash,
      role: 'COMPRADOR',
      ubicacion: 'Cali, Valle del Cauca',
      isActive: true,
      createdAt: new Date().toISOString()
    }
  ];

  for (const user of users) {
    await safeSetDoc('users', user.id, user);
  }

  // 3. Categorías
  console.log("\n🏷️ Sembrando colección 'categories'...");
  const categories = [
    { id: 'AGRC_CAT_FRUTAS', name: 'Frutas', description: 'Productos frutales frescos', isActive: true },
    { id: 'AGRC_CAT_VERDURAS', name: 'Verduras', description: 'Verduras y hortalizas frescas', isActive: true },
    { id: 'AGRC_CAT_TUBERCULOS', name: 'Tubérculos', description: 'Papa, yuca, ñame, arracacha', isActive: true },
    { id: 'AGRC_CAT_CAFE', name: 'Café', description: 'Café especial en grano o molido', isActive: true },
    { id: 'AGRC_CAT_LACTEOS', name: 'Lácteos', description: 'Quesos y derivados lácteos artesanales', isActive: true },
    { id: 'AGRC_CAT_GRANOS', name: 'Granos', description: 'Arroz, frijol, maíz, garbanzo', isActive: true },
    { id: 'AGRC_CAT_HIERBAS', name: 'Hierbas', description: 'Aromáticas, medicinales y culinarias', isActive: true }
  ];

  for (const cat of categories) {
    await safeSetDoc('categories', cat.id, cat);
  }

  // 4. Productos del Mercado
  console.log("\n🌾 Sembrando colección 'products'...");
  const products = [
    {
      id: 'AGRC_PRD_001',
      name: 'Plátano Hartón Premium',
      description: 'Plátanos frescos y maduros, ideales para cocinar. Cultivados de forma orgánica en las montañas de Antioquia.',
      price: 2500,
      unit: 'kg',
      category: 'Frutas',
      agricultor: 'Carlos Mejía',
      agricultorId: 'AGRC_USER_FARMER1',
      ubicacion: 'Medellín, Antioquia',
      imageUrl: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=500&auto=format&fit=crop&q=80',
      stock: 120,
      rating: 4.8,
      createdAt: new Date().toISOString()
    },
    {
      id: 'AGRC_PRD_002',
      name: 'Yuca Criolla Fresca',
      description: 'Yuca recién cosechada, perfecta para preparaciones tradicionales. Sin químicos, cultivo natural.',
      price: 1800,
      unit: 'kg',
      category: 'Tubérculos',
      agricultor: 'María Rodríguez',
      agricultorId: 'AGRC_USER_BUYER1',
      ubicacion: 'Cali, Valle del Cauca',
      imageUrl: 'https://images.unsplash.com/photo-1590165482129-1b8b27698780?w=500&auto=format&fit=crop&q=80',
      stock: 80,
      rating: 4.6,
      createdAt: new Date().toISOString()
    },
    {
      id: 'AGRC_PRD_003',
      name: 'Café Especial Arábica',
      description: 'Granos de café premium, tostado medio. Aroma intenso y sabor único de la región cafetera.',
      price: 15000,
      unit: '500g',
      category: 'Café',
      agricultor: 'José Herrera',
      agricultorId: 'AGRC_USER_FARMER1',
      ubicacion: 'Manizales, Caldas',
      imageUrl: 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=500&auto=format&fit=crop&q=80',
      stock: 50,
      rating: 4.9,
      createdAt: new Date().toISOString()
    },
    {
      id: 'AGRC_PRD_004',
      name: 'Aguacate Hass Orgánico',
      description: 'Aguacates cremosos y nutritivos, cultivados sin pesticidas. Perfectos para guacamole y ensaladas.',
      price: 3200,
      unit: 'kg',
      category: 'Frutas',
      agricultor: 'Ana López',
      agricultorId: 'AGRC_USER_FARMER1',
      ubicacion: 'Bogotá, Cundinamarca',
      imageUrl: 'https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?w=500&auto=format&fit=crop&q=80',
      stock: 200,
      rating: 4.7,
      createdAt: new Date().toISOString()
    },
    {
      id: 'AGRC_PRD_005',
      name: 'Cilantro Fresco',
      description: 'Cilantro aromático recién cortado, ideal para sazonar comidas típicas colombianas.',
      price: 800,
      unit: 'manojo',
      category: 'Hierbas',
      agricultor: 'Pedro Sánchez',
      agricultorId: 'AGRC_USER_FARMER1',
      ubicacion: 'Bucaramanga, Santander',
      imageUrl: 'https://images.unsplash.com/photo-1588879460618-924d55b0a880?w=500&auto=format&fit=crop&q=80',
      stock: 150,
      rating: 4.5,
      createdAt: new Date().toISOString()
    },
    {
      id: 'AGRC_PRD_006',
      name: 'Maíz Amarillo Tierno',
      description: 'Mazorcas de maíz dulce y tierno, perfectas para arepas y sopas tradicionales.',
      price: 1200,
      unit: 'unidad',
      category: 'Granos',
      agricultor: 'Luis Gómez',
      agricultorId: 'AGRC_USER_FARMER1',
      ubicacion: 'Ibagué, Tolima',
      imageUrl: 'https://images.unsplash.com/photo-1551754655-cd27e38d2076?w=500&auto=format&fit=crop&q=80',
      stock: 300,
      rating: 4.6,
      createdAt: new Date().toISOString()
    },
    {
      id: 'AGRC_PRD_007',
      name: 'Tomate Chonto Rojo',
      description: 'Tomates rojos y jugosos, seleccionados a mano. Excelente para guisos y ensaladas.',
      price: 2200,
      unit: 'kg',
      category: 'Verduras',
      agricultor: 'Carmen Ortiz',
      agricultorId: 'AGRC_USER_FARMER1',
      ubicacion: 'Tunja, Boyacá',
      imageUrl: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=500&auto=format&fit=crop&q=80',
      stock: 100,
      rating: 4.8,
      createdAt: new Date().toISOString()
    },
    {
      id: 'AGRC_PRD_008',
      name: 'Queso Campesino Artesanal',
      description: 'Queso fresco elaborado con leche pura de vaca. Sabor tradicional y textura suave.',
      price: 8500,
      unit: '500g',
      category: 'Lácteos',
      agricultor: 'Fernando Ruiz',
      agricultorId: 'AGRC_USER_FARMER1',
      ubicacion: 'Pasto, Nariño',
      imageUrl: 'https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?w=500&auto=format&fit=crop&q=80',
      stock: 60,
      rating: 4.9,
      createdAt: new Date().toISOString()
    }
  ];

  for (const prod of products) {
    await safeSetDoc('products', prod.id, prod);
  }

  console.log("\n🎉 Proceso de sembrado finalizado.");
}

seedFirebase().catch(err => {
  console.error("❌ Error en sembrado:", err);
});
