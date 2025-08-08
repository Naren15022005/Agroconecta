import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedRoles() {
  console.log('🌱 Poblando roles...');

  const roles = [
    {
      id: 'AGRC_ROL_ADMIN',
      name: 'ADMINISTRADOR',
      displayName: 'Administrador',
      description: 'Administrador del sistema con acceso completo',
      isActive: true
    },
    {
      id: 'AGRC_ROL_AGRICULTOR',
      name: 'CAMPESINO',
      displayName: 'Campesino/Agricultor',
      description: 'Productor agrícola que vende productos',
      isActive: true
    },
    {
      id: 'AGRC_ROL_CLIENTE',
      name: 'COMPRADOR',
      displayName: 'Comprador',
      description: 'Comprador individual de productos agrícolas',
      isActive: true
    },
    {
      id: 'AGRC_ROL_EMPRESA',
      name: 'EMPRESA',
      displayName: 'Empresa',
      description: 'Empresa compradora de productos al por mayor',
      isActive: true
    }
  ];

  for (const role of roles) {
    try {
      const existingRole = await prisma.role.findUnique({
        where: { id: role.id }
      });

      if (!existingRole) {
        await prisma.role.create({
          data: role
        });
        console.log(`✅ Rol creado: ${role.displayName}`);
      } else {
        console.log(`ℹ️  Rol ya existe: ${role.displayName}`);
      }
    } catch (error) {
      console.error(`❌ Error creando rol ${role.displayName}:`, error);
    }
  }

  console.log('✅ Roles poblados exitosamente\n');
}

if (require.main === module) {
  seedRoles()
    .catch((e) => {
      console.error('❌ Error poblando roles:', e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}

export { seedRoles };
