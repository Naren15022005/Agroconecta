import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main(){
  try {
    const likePatterns = ['%ventaId%','%venta%','%saleId%','%sale%','%venta_id%'];
    for(const pat of likePatterns){
      const rows = await prisma.$queryRawUnsafe(`SELECT TABLE_NAME, COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA=DATABASE() AND COLUMN_NAME LIKE ?`, pat);
      if(rows && rows.length){
        console.log('Matches for', pat);
        for(const r of rows) console.log(' ', r.TABLE_NAME || r.table_name || Object.values(r)[0], '-', r.COLUMN_NAME || r.column_name || Object.values(r)[1]);
      }
    }
  } catch(e){
    console.error('Error querying INFORMATION_SCHEMA:', e);
  } finally {
    await prisma.$disconnect();
  }
}

main();
