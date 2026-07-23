require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');
const { firebaseApp, db: firebaseDb, auth: firebaseAuth } = require('./firebase');

const PORT = process.env.PORT || 10000;
const app = express();
app.use(cors());
app.use(express.json());

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.info('Notice: Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in environment');
}

const supabase = createClient(SUPABASE_URL || 'https://placeholder.supabase.co', SUPABASE_SERVICE_ROLE_KEY || 'placeholder-key');

app.get('/health', (req, res) => {
  res.json({
    ok: true,
    env: process.env.NODE_ENV || 'development',
    firebase: {
      initialized: !!firebaseApp,
      hasFirestore: !!firebaseDb,
      hasAuth: !!firebaseAuth,
    },
  });
});

// Firebase Endpoint: Get products from Firestore 'products' collection
app.get('/firebase/products', async (req, res) => {
  if (!firebaseDb) {
    return res.status(503).json({ error: 'Firebase Firestore is not initialized. Please configure FIREBASE credentials in .env.' });
  }

  try {
    const snapshot = await firebaseDb.collection('products').limit(100).get();
    const products = [];
    snapshot.forEach(doc => {
      products.push({ id: doc.id, ...doc.data() });
    });
    res.json({ data: products });
  } catch (err) {
    console.error('Firestore get error:', err);
    res.status(500).json({ error: String(err.message || err) });
  }
});

// Firebase Endpoint: Verify Firebase Client Auth ID Token
app.post('/firebase/verify-token', async (req, res) => {
  if (!firebaseAuth) {
    return res.status(503).json({ error: 'Firebase Auth is not initialized.' });
  }

  const { idToken } = req.body;
  if (!idToken) {
    return res.status(400).json({ error: 'idToken is required in body' });
  }

  try {
    const decodedToken = await firebaseAuth.verifyIdToken(idToken);
    res.json({ valid: true, user: decodedToken });
  } catch (err) {
    res.status(401).json({ valid: false, error: err.message });
  }
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

