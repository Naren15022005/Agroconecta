import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main(){
  const both = await prisma.$queryRawUnsafe(`
    SELECT u.id, u.correo
    FROM users u
    JOIN clientes c ON c.user_id = u.id
    JOIN agricultores a ON a.user_id = u.id
  `);
  console.log('Found', both.length, 'users with both cliente and agricultor records');
  console.log(both);
}

main().catch(e=>{console.error(e);process.exit(1)}).finally(async ()=>{await prisma.$disconnect();});
