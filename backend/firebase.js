const adminModule = require('firebase-admin');
const admin = adminModule.default || adminModule;

/**
 * Initializes Firebase Admin SDK using environment variables.
 * Supports credentials specified via:
 * 1. FIREBASE_SERVICE_ACCOUNT_KEY (JSON string or path)
 * 2. FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY
 */
function initFirebase() {
  if (!admin || !admin.apps || admin.apps.length > 0) {
    return admin && admin.apps && admin.apps.length > 0 ? admin.app() : null;
  }


  try {
    if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
      const serviceAccount = typeof process.env.FIREBASE_SERVICE_ACCOUNT_KEY === 'string'
        ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY)
        : process.env.FIREBASE_SERVICE_ACCOUNT_KEY;

      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
      });
      console.log('🔥 Firebase Admin SDK initialized with FIREBASE_SERVICE_ACCOUNT_KEY');
    } else if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY) {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
        }),
        storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
      });
      console.log('🔥 Firebase Admin SDK initialized with environment variables');
    } else {
      console.warn('⚠️ Firebase credentials not found in environment (FIREBASE_PROJECT_ID / FIREBASE_SERVICE_ACCOUNT_KEY). Firebase features will operate in uninitialized mode.');
      return null;
    }
  } catch (error) {
    console.error('❌ Failed to initialize Firebase Admin SDK:', error.message);
    return null;
  }

  return admin.app();
}

const firebaseApp = initFirebase();
const db = firebaseApp ? admin.firestore() : null;
const auth = firebaseApp ? admin.auth() : null;
const storage = firebaseApp ? admin.storage() : null;

module.exports = {
  admin,
  firebaseApp,
  db,
  auth,
  storage,
};
