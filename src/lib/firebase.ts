/// <reference types="vite/client" />
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, doc, getDocFromServer } from 'firebase/firestore';
import firebaseConfigJson from '../../firebase-applet-config.json';

declare global {
  interface Window {
    __FIREBASE_CONFIG__?: any;
  }
}

// @ts-ignore
const embeddedConfig = typeof __FIREBASE_CONFIG__ !== 'undefined' ? __FIREBASE_CONFIG__ : {};

const FALLBACK_CONFIG = {
  projectId: "gen-lang-client-0555845621",
  appId: "1:591444380616:web:41aa6900026527df2b0efd",
  apiKey: "AIzaSyBJKcerJPLHGuClCiqrqM_GsNk47O5vDyw",
  authDomain: "gen-lang-client-0555845621.firebaseapp.com",
  firestoreDatabaseId: "ai-studio-f25d80da-648b-43e6-8b03-1b78e0ff6887",
  storageBucket: "gen-lang-client-0555845621.firebasestorage.app",
  messagingSenderId: "591444380616"
};

// Log for debugging
console.log('Lib Firebase: Checking for config sources...');

function getConfigValue(key: string, bakedKey: string, envKey: string, jsonKey: string, fallbackKey: string) {
  const val = bakedKey || envKey || jsonKey || fallbackKey;
  if (!val) console.warn(`Firebase config: ${key} is missing from all sources.`);
  return val;
}

const firebaseConfig = {
  apiKey: getConfigValue('apiKey', embeddedConfig.apiKey, import.meta.env.VITE_FIREBASE_API_KEY, firebaseConfigJson.apiKey, FALLBACK_CONFIG.apiKey),
  authDomain: getConfigValue('authDomain', embeddedConfig.authDomain, import.meta.env.VITE_FIREBASE_AUTH_DOMAIN, firebaseConfigJson.authDomain, FALLBACK_CONFIG.authDomain),
  projectId: getConfigValue('projectId', embeddedConfig.projectId, import.meta.env.VITE_FIREBASE_PROJECT_ID, firebaseConfigJson.projectId, FALLBACK_CONFIG.projectId),
  storageBucket: getConfigValue('storageBucket', embeddedConfig.storageBucket, import.meta.env.VITE_FIREBASE_STORAGE_BUCKET, firebaseConfigJson.storageBucket, FALLBACK_CONFIG.storageBucket),
  messagingSenderId: getConfigValue('messagingSenderId', embeddedConfig.messagingSenderId, import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID, firebaseConfigJson.messagingSenderId, FALLBACK_CONFIG.messagingSenderId),
  appId: getConfigValue('appId', embeddedConfig.appId, import.meta.env.VITE_FIREBASE_APP_ID, firebaseConfigJson.appId, FALLBACK_CONFIG.appId),
  measurementId: embeddedConfig.measurementId || import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || firebaseConfigJson.measurementId || '',
  firestoreDatabaseId: embeddedConfig.firestoreDatabaseId || import.meta.env.VITE_FIREBASE_FIRESTORE_DATABASE_ID || firebaseConfigJson.firestoreDatabaseId || FALLBACK_CONFIG.firestoreDatabaseId
};

let app: any;
let db: any;
let auth: any;

try {
  if (!firebaseConfig.apiKey) {
    throw new Error('Firebase Config: apiKey is missing. Cannot initialize.');
  }
  app = initializeApp(firebaseConfig);
  db = getFirestore(app, firebaseConfig.firestoreDatabaseId || '(default)');
  auth = getAuth(app);
  console.log("Firebase initialized successfully.");
} catch (e) {
  console.error("Firebase initialization FAILED:", e);
  // Create dummy objects to prevent module-level crashes, but log warnings on use
  app = { name: '[FAILED]' } as any;
  db = new Proxy({}, { 
    get: (_, prop) => { 
      if (prop === 'type') return 'firestore';
      if (typeof prop === 'symbol') return undefined;
      return async (...args: any[]) => {
        console.warn(`Firestore accessed but not initialized. Method: ${String(prop)}`, args);
        throw new Error("Firebase Firestore not initialized"); 
      };
    } 
  });
  auth = new Proxy({}, { 
    get: (_, prop) => { 
      if (prop === 'currentUser') return null;
      if (prop === 'onAuthStateChanged' || prop === 'onIdTokenChanged') {
        return (cb: any) => {
          console.warn(`Auth listener '${String(prop)}' called but not initialized.`);
          return () => {}; // Unsubscribe no-op
        };
      }
      if (typeof prop === 'symbol') return undefined;
      return async (...args: any[]) => {
        console.warn(`Firebase Auth accessed but not initialized. Method: ${String(prop)}`, args);
        throw new Error("Firebase Auth not initialized"); 
      };
    } 
  });
}

export { db, auth, app };

// Validate Connection
async function testConnection() {
  if (!app || app?.name === '[FAILED]' || !db) return;
  try {
    // Check if db is a proxy or real
    if (typeof db.collection === 'function') {
       // This is admin SDK or a proxy that implemented collection
    }
    
    // Try to get a document with a timeout
    const testDocRef = doc(db, 'test', 'connection');
    const connectionPromise = getDocFromServer(testDocRef);
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Connection timeout')), 10000)
    );
    
    await Promise.race([connectionPromise, timeoutPromise]);
    console.log("Firebase connection successful.");
  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes('the client is offline') || error.message.includes('Connection timeout') || error.message.includes('Firebase not initialized')) {
        console.warn("Firestore is currently unreachable or not initialized. The app will work in offline mode and sync when possible.");
      } else {
        console.error("Firestore connectivity issue:", error.message);
      }
    }
  }
}
testConnection().catch(err => console.debug("Initial connection check failed (expected in some environments):", err));

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    tokenEmail?: any;
  }
}

export async function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const user = auth.currentUser;
  const token = user ? await user.getIdTokenResult() : null;

  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: user?.uid,
      email: user?.email,
      emailVerified: user?.emailVerified,
      tokenEmail: token?.claims.email,
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}
