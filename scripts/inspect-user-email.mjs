import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const email = process.argv[2] || 'natalianavarro2408@gmail.com';

async function main(){
  console.log('Inspecting user:', email);
  const user = await prisma.user.findUnique({ where: { correo: email }, include: { role: true } });
  if(!user){
    console.log('User not found');
    return;
  }
  console.log('User:', { id: user.id, nombre: user.nombre, correo: user.correo, roleId: user.roleId, roleName: user.role?.name, isActive: user.isActive, createdAt: user.createdAt });

  const cliente = await prisma.cliente.findUnique({ where: { user_id: user.id } }).catch(()=>null);
  const agricultor = await prisma.agricultor.findUnique({ where: { user_id: user.id } }).catch(()=>null);
  const empresa = await prisma.empresa.findUnique({ where: { user_id: user.id } }).catch(()=>null);
  console.log('Profiles:');
  console.log('  cliente:', cliente ? { id: cliente.id } : null);
  console.log('  agricultor:', agricultor ? { id: agricultor.id } : null);
  console.log('  empresa:', empresa ? { id: empresa.id } : null);

  const sessions = await prisma.session.findMany({ where: { userId: user.id } });
  console.log('Sessions count:', sessions.length);
  sessions.slice(0,10).forEach((s,i)=>console.log(`  [${i}] id=${s.id} expires=${s.expires}`));

  const accounts = await prisma.account.findMany({ where: { userId: user.id } });
  console.log('Accounts linked:', accounts.map(a=>({ provider: a.provider, providerAccountId: a.providerAccountId })));

  const orders = await prisma.order.findMany({ where: { buyerId: user.id }, take: 5 });
  console.log('Sample orders count:', orders.length);

  const cartItems = await prisma.cartItem.findMany({ where: { userId: user.id } });
  console.log('Cart items count:', cartItems.length);

  // Also check if any product is linked to this user's agricultor profile (if exists)
  if(agricultor){
    const products = await prisma.product.findMany({ where: { agricultorId: agricultor.id }, take: 5 });
    console.log('Agricultor products count (sample):', products.length);
  }
}

main().catch(e=>{console.error(e); process.exit(1)}).finally(async ()=>{await prisma.$disconnect();});
