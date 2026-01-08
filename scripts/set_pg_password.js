const { Client } = require('pg');
require('dotenv').config();

const newPw = process.argv[2];
if (!newPw) {
  console.error('Usage: node set_pg_password.js <new-password>');
  process.exit(1);
}

const dbUrl = process.env.DATABASE_URL;
if (!dbUrl) {
  console.error('.env DATABASE_URL not found');
  process.exit(1);
}

(async () => {
  const client = new Client({ connectionString: dbUrl });
  try {
    await client.connect();
    await client.query(`ALTER USER postgres WITH PASSWORD '${newPw}'`);
    console.log('Password changed to', newPw);
    await client.end();
    process.exit(0);
  } catch (err) {
    console.error('Error changing password:', err.message);
    process.exit(2);
  }
})();