import { PrismaClient, UserRole } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Inicializando AgroConecta...')

  // Crear categorías iniciales
  console.log('📁 Creando categorías...')
  const categorias = [
    { name: 'Frutas', description: 'Frutas frescas del campo colombiano' },
    { name: 'Verduras', description: 'Verduras y hortalizas frescas' },
    { name: 'Granos', description: 'Granos y cereales' },
    { name: 'Tubérculos', description: 'Papas, yuca, ñame y otros tubérculos' },
    { name: 'Hierbas', description: 'Hierbas aromáticas y medicinales' },
    { name: 'Lácteos', description: 'Productos lácteos artesanales' }
  ]

  for (const categoria of categorias) {
    await prisma.category.upsert({
      where: { name: categoria.name },
      update: {},
      create: categoria
    })
  }

  // Crear usuario administrador
  console.log('👤 Creando usuario administrador...')
  const hashedPassword = await bcrypt.hash('admin123', 10)
  
  await prisma.user.upsert({
    where: { email: 'admin@agroconecta.co' },
    update: {},
    create: {
      email: 'admin@agroconecta.co',
      password: hashedPassword,
      name: 'Administrador AgroConecta',
      role: UserRole.ADMIN,
      phone: '+57 300 123 4567',
      address: 'Bogotá, Colombia'
    }
  })

  // Crear usuario campesino de ejemplo
  console.log('🚜 Creando campesino de ejemplo...')
  const campesinoPassword = await bcrypt.hash('campesino123', 10)
  
  const campesino = await prisma.user.upsert({
    where: { email: 'juan.campesino@gmail.com' },
    update: {},
    create: {
      email: 'juan.campesino@gmail.com',
      password: campesinoPassword,
      name: 'Juan Rodríguez',
      role: UserRole.CAMPESINO,
      phone: '+57 310 987 6543',
      address: 'Finca La Esperanza, Boyacá, Colombia'
    }
  })

  // Crear productos de ejemplo
  console.log('🥕 Creando productos de ejemplo...')
  const frutasCategory = await prisma.category.findFirst({ where: { name: 'Frutas' } })
  const verdurasCategory = await prisma.category.findFirst({ where: { name: 'Verduras' } })

  if (frutasCategory && verdurasCategory) {
    await prisma.product.createMany({
      data: [
        {
          name: 'Mango Tommy',
          description: 'Mango Tommy fresco y dulce, cosechado en su punto óptimo de maduración',
          price: 3500,
          stock: 100,
          unit: 'kg',
          campesinoId: campesino.id,
          categoryId: frutasCategory.id
        },
        {
          name: 'Aguacate Hass',
          description: 'Aguacate Hass premium, ideal para consumo directo o preparaciones',
          price: 4200,
          stock: 80,
          unit: 'kg',
          campesinoId: campesino.id,
          categoryId: frutasCategory.id
        },
        {
          name: 'Tomate Chonto',
          description: 'Tomate chonto fresco, perfecto para ensaladas y salsas',
          price: 2800,
          stock: 150,
          unit: 'kg',
          campesinoId: campesino.id,
          categoryId: verdurasCategory.id
        },
        {
          name: 'Lechuga Crespa',
          description: 'Lechuga crespa hidropónica, cultivada sin pesticidas',
          price: 1500,
          stock: 60,
          unit: 'unidad',
          campesinoId: campesino.id,
          categoryId: verdurasCategory.id
        }
      ]
    })
  }

  console.log('✅ Inicialización completada!')
  console.log('🔐 Credenciales de administrador:')
  console.log('   Email: admin@agroconecta.co')
  console.log('   Password: admin123')
  console.log('🚜 Credenciales de campesino:')
  console.log('   Email: juan.campesino@gmail.com')
  console.log('   Password: campesino123')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
