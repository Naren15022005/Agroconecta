require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');

const PORT = process.env.PORT || 10000;
const app = express();
app.use(cors());
app.use(express.json());

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in environment');
}

const supabase = createClient(SUPABASE_URL || '', SUPABASE_SERVICE_ROLE_KEY || '');

app.get('/health', (req, res) => {
  res.json({ ok: true, env: process.env.NODE_ENV || 'development' });
});

// Example: list public products from Supabase table `products`
app.get('/products', async (req, res) => {
  try {
    const { data, error } = await supabase.from('products').select('*').limit(100);
    if (error) return res.status(500).json({ error: error.message });
    res.json({ data });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: String(err) });
  }
});

// Example: proxy auth (server-side) - caution with service role key
app.get('/users', async (req, res) => {
  try {
    const { data, error } = await supabase.auth.admin.listUsers();
    if (error) return res.status(500).json({ error: error.message });
    res.json({ data });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: String(err) });
  }
});

app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

app.listen(PORT, () => {
  console.log(`AgroConecta backend listening on port ${PORT}`);
});
