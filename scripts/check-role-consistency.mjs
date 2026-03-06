import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main(){
  console.log('Checking role consistency between user.role and related tables...');

  const clientes = await prisma.$queryRawUnsafe(`
    SELECT u.id as userId, u.correo, r.name as roleName, 'clientes' as source
    FROM clientes c
    JOIN users u ON u.id = c.user_id
    LEFT JOIN roles r ON r.id = u.roleId
    WHERE r.name IS NULL OR r.name != 'COMPRADOR'
  `);

  const agricultorMismatch = await prisma.$queryRawUnsafe(`
    SELECT u.id as userId, u.correo, r.name as roleName, 'agricultores' as source
    FROM agricultores a
    JOIN users u ON u.id = a.user_id
    LEFT JOIN roles r ON r.id = u.roleId
    WHERE r.name IS NULL OR r.name != 'CAMPESINO'
  `);

  const empresasMismatch = await prisma.$queryRawUnsafe(`
    SELECT u.id as userId, u.correo, r.name as roleName, 'empresas' as source
    FROM empresas e
    JOIN users u ON u.id = e.user_id
    LEFT JOIN roles r ON r.id = u.roleId
    WHERE r.name IS NULL OR r.name != 'EMPRESA'
  `);

  const results = [...clientes, ...agricultorMismatch, ...empresasMismatch];
  if(results.length===0) {
    console.log('No mismatches found. Roles consistent with related tables.');
  } else {
    console.log('Found mismatches:');
    for(const r of results){
      console.log(r);
    }
  }
}

main().catch(e=>{console.error(e);process.exit(1)}).finally(async ()=>{await prisma.$disconnect();});
