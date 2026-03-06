import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function info(table, column='id'){
  const countUser = await prisma.$queryRawUnsafe(`SELECT COUNT(*) as c FROM ${table} WHERE ${column} LIKE 'AGRC_USER_%'`);
  const countLegacy = await prisma.$queryRawUnsafe(`SELECT COUNT(*) as c FROM ${table} WHERE ${column} LIKE 'AGRC_%' AND ${column} NOT LIKE 'AGRC_USER_%'`);
  const sampleUser = await prisma.$queryRawUnsafe(`SELECT ${column} as id FROM ${table} WHERE ${column} LIKE 'AGRC_USER_%' LIMIT 10`);
  const sampleLegacy = await prisma.$queryRawUnsafe(`SELECT ${column} as id FROM ${table} WHERE ${column} LIKE 'AGRC_%' AND ${column} NOT LIKE 'AGRC_USER_%' LIMIT 10`);
  return {table, column, countUser: countUser[0]?.c ?? 0, countLegacy: countLegacy[0]?.c ?? 0, sampleUser, sampleLegacy};
}

async function main(){
  console.log('Verifying normalization status...');
  const tables = [];
  tables.push(await info('agricultores','id'));
  tables.push(await info('clientes','id'));
  tables.push(await info('empresas','id'));
  // references
  const prodAgr = await info('products','agricultorId');

  const results = [...tables, prodAgr];
  for(const r of results){
    console.log(`\nTable: ${r.table} (column: ${r.column})`);
    console.log(`  AGRC_USER_* count: ${r.countUser}`);
    console.log(`  Legacy AGRC_* (non-user) count: ${r.countLegacy}`);
    console.log('  Sample AGRC_USER_* IDs:');
    for(const s of r.sampleUser) console.log('    -', s.id);
    if(r.sampleLegacy.length>0){
      console.log('  Sample legacy AGRC_* IDs still present:');
      for(const s of r.sampleLegacy) console.log('    -', s.id);
    } else {
      console.log('  No legacy sample IDs found.');
    }
  }
}

main().catch(e=>{console.error(e);process.exit(1)}).finally(async ()=>{await prisma.$disconnect();});
