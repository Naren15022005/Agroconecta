require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const { createClient } = require('@supabase/supabase-js');
const { firebaseApp, db: firebaseDb, auth: firebaseAuth } = require('./firebase');

const PORT = process.env.PORT || 10000;
const app = express();
app.use(cors());
app.use(express.json());

// In-memory store for dev fallback if Firestore credentials are not set
if (!global.inMemoryUsers) {
  global.inMemoryUsers = new Map();
}

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

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

// Backend Endpoint: Registro de usuario en Firebase / Memory Store
app.post('/firebase/register', async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password || !role) {
      return res.status(400).json({ success: false, error: 'Todos los campos son obligatorios.' });
    }

    const cleanEmail = email.toLowerCase().trim();
    const hashedPassword = await bcrypt.hash(password, 10);
    const userId = 'AGRC_USER_' + Math.random().toString(36).substring(2, 10).toUpperCase();

    const userData = {
      id: userId,
      nombre: name,
      correo: cleanEmail,
      contraseña: hashedPassword,
      role: role,
      isActive: true,
      createdAt: new Date().toISOString()
    };

    if (firebaseDb) {
      // Guardar en Firestore
      const userRef = firebaseDb.collection('users').doc(userId);
      await userRef.set(userData);
      console.log('✅ [Backend Express] Usuario guardado en Firebase Firestore:', userId);
    } else {
      // Fallback en memoria
      global.inMemoryUsers.set(cleanEmail, userData);
      console.log('✅ [Backend Express] Usuario guardado en In-Memory Fallback:', userId);
    }

    return res.json({
      success: true,
      message: '¡Registro exitoso en el backend de AgroConecta!',
      user: {
        id: userId,
        nombre: name,
        correo: cleanEmail,
        role: role
      }
    });
  } catch (err) {
    console.error('❌ [Backend Express] Error en /firebase/register:', err);
    return res.status(500).json({ success: false, error: err.message || 'Error al procesar el registro en el servidor.' });
  }
});

// Backend Endpoint: Autenticación de usuario
app.post('/firebase/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, error: 'Email y contraseña requeridos.' });
    }

    const cleanEmail = email.toLowerCase().trim();
    let userData = null;

    if (firebaseDb) {
      const snapshot = await firebaseDb.collection('users').where('correo', '==', cleanEmail).limit(1).get();
      if (!snapshot.empty) {
        userData = snapshot.docs[0].data();
      }
    }

    if (!userData && global.inMemoryUsers.has(cleanEmail)) {
      userData = global.inMemoryUsers.get(cleanEmail);
    }

    if (!userData) {
      return res.status(401).json({ success: false, error: 'Usuario no encontrado.' });
    }

    const isValid = await bcrypt.compare(password, userData.contraseña);
    if (!isValid) {
      return res.status(401).json({ success: false, error: 'Contraseña incorrecta.' });
    }

    return res.json({
      success: true,
      user: {
        id: userData.id,
        nombre: userData.nombre,
        correo: userData.correo,
        role: userData.role
      }
    });
  } catch (err) {
    console.error('❌ [Backend Express] Error en /firebase/login:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

// Firebase Endpoint: Obtener productos
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

app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

app.listen(PORT, () => {
  console.log(`🚀 AgroConecta backend listening on port ${PORT}`);
});
