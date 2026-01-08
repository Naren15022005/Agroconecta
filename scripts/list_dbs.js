const { Client } = require('pg');
require('dotenv').config();

const url = process.env.DATABASE_URL;
if (!url) {
  console.error('No DATABASE_URL in .env');
  process.exit(1);
}

(async () => {
  const client = new Client({ connectionString: url });
  try {
    await client.connect();
    const res = await client.query("SELECT datname FROM pg_database WHERE datistemplate = false;");
    console.log('Databases visible:');
    res.rows.forEach(r => console.log('-', r.datname));
    await client.end();
    process.exit(0);
  } catch (err) {
    console.error('Error connecting/listing DBs:', err.message);
    process.exit(2);
  }
})();
