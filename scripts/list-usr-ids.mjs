import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main(){
  const rows = await prisma.$queryRawUnsafe("SELECT id, nombre, correo, createdAt FROM users WHERE id LIKE 'AGRC_USR_%' OR id LIKE 'AGRC_USER_%' ORDER BY createdAt DESC");
  console.log('Found', rows.length, 'users matching AGRC_USR_/AGRC_USER_ patterns');
  for(const r of rows){
    console.log(r.id, '|', r.nombre, '|', r.correo, '|', r.createdAt);
  }
}

main().catch(e=>{console.error(e);process.exit(1)}).finally(async ()=>{await prisma.$disconnect();});
