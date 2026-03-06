import { prisma } from '../src/lib/prisma';

async function main(){
  try{
    const c = await prisma.favorite.count();
    console.log('favorites count =', c);
  }catch(e){
    console.error('error checking favorites table:', e.message || e);
    process.exitCode = 1;
  }finally{
    await prisma.$disconnect();
  }
}

main();
