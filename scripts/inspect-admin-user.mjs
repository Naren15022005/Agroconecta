import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main(){
  const adminByEmail = await prisma.user.findUnique({ where: { correo: 'admin@agroconecta.com' }, include: { role: true } }).catch(()=>null);
  const adminById = await prisma.user.findUnique({ where: { id: 'AGRC_USER_ADMIN' }, include: { role: true } }).catch(()=>null);
  const roles = await prisma.role.findMany();
  console.log('adminByEmail:', !!adminByEmail);
  if(adminByEmail) console.log({ id: adminByEmail.id, nombre: adminByEmail.nombre, correo: adminByEmail.correo, roleId: adminByEmail.roleId, roleName: adminByEmail.role?.name });
  console.log('adminById:', !!adminById);
  if(adminById) console.log({ id: adminById.id, nombre: adminById.nombre, correo: adminById.correo, roleId: adminById.roleId, roleName: adminById.role?.name });
  console.log('\nRoles in DB:');
  for(const r of roles) console.log({ id: r.id, name: r.name, displayName: r.displayName });
}

main().catch(e=>{console.error(e);process.exit(1)}).finally(async ()=>{await prisma.$disconnect();});
