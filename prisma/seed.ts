import { PrismaClient, ProductStatus } from '@prisma/client'
import bcrypt from 'bcrypt'
import { AgroConectaIdGenerator } from '../src/lib/id-generator'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Inicializando AgroConecta...')

  // Crear roles del sistema
  console.log('🔐 Creando roles del sistema...')
  const roles = [
    { 
      id: AgroConectaIdGenerator.generateId('ROL'),
      name: 'agricultor', 
      displayName: 'Agricultor', 
      description: 'Productor agrícola que vende productos' 
    },
    { 
      id: AgroConectaIdGenerator.generateId('ROL'),
      name: 'cliente', 
      displayName: 'Cliente', 
      description: 'Comprador de productos agrícolas' 
    },
    { 
      id: AgroConectaIdGenerator.generateId('ROL'),
      name: 'empresa', 
      displayName: 'Empresa', 
      description: 'Empresa compradora de productos' 
    },
    { 
      id: AgroConectaIdGenerator.generateId('ROL'),
      name: 'admin', 
      displayName: 'Administrador', 
      description: 'Administrador del sistema' 
    }
  ]

  for (const role of roles) {
    await prisma.role.upsert({
      where: { name: role.name },
      update: {},
      create: role
    })
  }

  // Crear categorías
  console.log('📁 Creando categorías...')
  const categories = [
    { name: 'Frutas', description: 'Frutas frescas de cosecha local' },
    { name: 'Verduras', description: 'Verduras frescas y orgánicas' },
    { name: 'Hortalizas', description: 'Hortalizas variadas de temporada' },
    { name: 'Legumbres', description: 'Legumbres y granos frescos' },
    { name: 'Hierbas Aromáticas', description: 'Hierbas frescas para cocinar' },
    { name: 'Cereales', description: 'Cereales y granos integrales' }
  ]

  for (const category of categories) {
    await prisma.category.upsert({
      where: { name: category.name },
      update: {},
      create: {
        id: AgroConectaIdGenerator.generateCategoryId(),
        ...category
      }
    })
  }

  // Obtener roles para referenciar
  const adminRole = await prisma.role.findUnique({ where: { name: 'admin' } })
  const agricultorRole = await prisma.role.findUnique({ where: { name: 'agricultor' } })
  const clienteRole = await prisma.role.findUnique({ where: { name: 'cliente' } })

  // Crear usuario administrador
  console.log('👤 Creando usuario administrador...')
  const hashedPassword = await bcrypt.hash('admin123', 10)
  
  const admin = await prisma.user.upsert({
    where: { correo: 'admin@agroconecta.co' },
    update: {},
    create: {
      id: AgroConectaIdGenerator.generateUserId(),
      correo: 'admin@agroconecta.co',
      contraseña: hashedPassword,
      nombre: 'Administrador AgroConecta',
      roleId: adminRole!.id
    }
  })

  // Crear usuario agricultor de ejemplo
  console.log('🚜 Creando agricultor de ejemplo...')
  const agricultorPassword = await bcrypt.hash('agricultor123', 10)
  
  const agricultorUser = await prisma.user.upsert({
    where: { correo: 'juan.agricultor@gmail.com' },
    update: {},
    create: {
      id: AgroConectaIdGenerator.generateUserId(),
      correo: 'juan.agricultor@gmail.com',
      contraseña: agricultorPassword,
      nombre: 'Juan Rodríguez',
      roleId: agricultorRole!.id
    }
  })

  // Crear perfil de agricultor
  const agricultor = await prisma.agricultor.upsert({
    where: { user_id: agricultorUser.id },
    update: {},
    create: {
      id: AgroConectaIdGenerator.generateAgricultorId(),
      user_id: agricultorUser.id,
      telefono: '+57 310 987 6543',
      ubicacion: 'Finca La Esperanza, Boyacá, Colombia',
      descripcion: 'Agricultor con 15 años de experiencia en cultivos orgánicos',
      verificado: true
    }
  })

  // Crear usuario cliente de ejemplo
  console.log('🛒 Creando cliente de ejemplo...')
  const clientePassword = await bcrypt.hash('cliente123', 10)
  
  const clienteUser = await prisma.user.upsert({
    where: { correo: 'maria.cliente@gmail.com' },
    update: {},
    create: {
      id: AgroConectaIdGenerator.generateUserId(),
      correo: 'maria.cliente@gmail.com',
      contraseña: clientePassword,
      nombre: 'María González',
      roleId: clienteRole!.id
    }
  })

  // Crear perfil de cliente
  await prisma.cliente.upsert({
    where: { user_id: clienteUser.id },
    update: {},
    create: {
      id: AgroConectaIdGenerator.generateClienteId(),
      user_id: clienteUser.id,
      telefono: '+57 300 123 4567',
      direccion: 'Calle 123 #45-67, Bogotá',
      preferencias: 'Productos orgánicos, frutas tropicales'
    }
  })

  // Crear productos de ejemplo
  console.log('🥕 Creando productos de ejemplo...')
  const frutasCategory = await prisma.category.findFirst({ where: { name: 'Frutas' } })
  const verdurasCategory = await prisma.category.findFirst({ where: { name: 'Verduras' } })

  if (frutasCategory && verdurasCategory && agricultor) {
    const productos = [
      {
        id: AgroConectaIdGenerator.generateProductId(),
        name: 'Mango Tommy',
        description: 'Mango Tommy fresco y dulce, cosechado en su punto óptimo de maduración',
        price: 2500,
        stock: 50,
        reservedStock: 0,
        unit: 'lb',
        status: ProductStatus.DISPONIBLE,
        agricultorId: agricultor.id,
        categoryId: frutasCategory.id
      },
      {
        id: AgroConectaIdGenerator.generateProductId(),
        name: 'Aguacate Hass',
        description: 'Aguacate Hass cremoso y nutritivo, ideal para ensaladas y preparaciones',
        price: 1800,
        stock: 30,
        reservedStock: 5,
        unit: 'unidad',
        status: ProductStatus.DISPONIBLE,
        agricultorId: agricultor.id,
        categoryId: frutasCategory.id
      },
      {
        id: AgroConectaIdGenerator.generateProductId(),
        name: 'Lechuga Crespa',
        description: 'Lechuga crespa fresca, cultivada sin pesticidas',
        price: 1200,
        stock: 25,
        reservedStock: 0,
        unit: 'unidad',
        status: ProductStatus.DISPONIBLE,
        agricultorId: agricultor.id,
        categoryId: verdurasCategory.id
      },
      {
        id: AgroConectaIdGenerator.generateProductId(),
        name: 'Tomate Cherry',
        description: 'Tomates cherry dulces y jugosos, perfectos para ensaladas',
        price: 3000,
        stock: 40,
        reservedStock: 2,
        unit: 'lb',
        status: ProductStatus.DISPONIBLE,
        agricultorId: agricultor.id,
        categoryId: verdurasCategory.id
      }
    ]

    for (const producto of productos) {
      await prisma.product.upsert({
        where: { id: producto.id },
        update: {},
        create: producto
      })
    }
  }

  console.log('✅ Base de datos inicializada correctamente!')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
