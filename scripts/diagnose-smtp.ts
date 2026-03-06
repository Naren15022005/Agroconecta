import dotenv from 'dotenv';
dotenv.config({ path: '.env' });

console.log('=== SMTP DIAGNOSTIC ===\n');

const host = process.env.SMTP_HOST;
const port = Number(process.env.SMTP_PORT) || 587;
const userRaw = process.env.SMTP_USER;
const passRaw = process.env.SMTP_PASS;

console.log('Raw values from .env:');
console.log('SMTP_HOST:', host || '❌ NOT SET');
console.log('SMTP_PORT:', port);
console.log('SMTP_USER:', userRaw || '❌ NOT SET');
console.log('SMTP_PASS:', passRaw ? `"${passRaw}"` : '❌ NOT SET');
console.log('');

const user = userRaw?.replace(/\s+/g, '');
const pass = passRaw?.replace(/\s+/g, '');

console.log('After sanitization (spaces removed):');
console.log('SMTP_USER:', user || '❌ EMPTY');
console.log('SMTP_PASS:', pass ? `${pass.substring(0, 4)}...${pass.substring(pass.length - 4)} (${pass.length} chars)` : '❌ EMPTY');
console.log('');

if (!host || !user || !pass) {
  console.error('❌ SMTP configuration incomplete. Check your .env file.');
  process.exit(1);
}

if (pass.length !== 16) {
  console.warn(`⚠️  WARNING: Gmail app passwords are typically 16 characters. Your password is ${pass.length} characters.`);
}

console.log('✓ SMTP configuration looks complete.');
console.log('\nNext: Run "npx ts-node scripts/check-smtp.ts" to test authentication.');
console.log('If authentication fails, regenerate app password at: https://myaccount.google.com/apppasswords');
