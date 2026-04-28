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

const firebaseConfig = {
  apiKey: embeddedConfig.apiKey || import.meta.env.VITE_FIREBASE_API_KEY || firebaseConfigJson.apiKey || FALLBACK_CONFIG.apiKey,
  authDomain: embeddedConfig.authDomain || import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || firebaseConfigJson.authDomain || FALLBACK_CONFIG.authDomain,
  projectId: embeddedConfig.projectId || import.meta.env.VITE_FIREBASE_PROJECT_ID || firebaseConfigJson.projectId || FALLBACK_CONFIG.projectId,
  storageBucket: embeddedConfig.storageBucket || import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || firebaseConfigJson.storageBucket || FALLBACK_CONFIG.storageBucket,
  messagingSenderId: embeddedConfig.messagingSenderId || import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || firebaseConfigJson.messagingSenderId || FALLBACK_CONFIG.messagingSenderId,
  appId: embeddedConfig.appId || import.meta.env.VITE_FIREBASE_APP_ID || firebaseConfigJson.appId || FALLBACK_CONFIG.appId,
  measurementId: embeddedConfig.measurementId || import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || firebaseConfigJson.measurementId || '',
  firestoreDatabaseId: embeddedConfig.firestoreDatabaseId || import.meta.env.VITE_FIREBASE_FIRESTORE_DATABASE_ID || firebaseConfigJson.firestoreDatabaseId || FALLBACK_CONFIG.firestoreDatabaseId
};

if (!firebaseConfig.apiKey || firebaseConfig.apiKey === '') {
  console.error("Firebase API Key is still missing after fallback check.");
} else {
  console.log("Firebase initialized successfully with configuration.");
}

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId || '(default)');
export const auth = getAuth(app);

// Validate Connection
async function testConnection() {
  try {
    // Try to get a document with a timeout
    const connectionPromise = getDocFromServer(doc(db, 'test', 'connection'));
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Connection timeout')), 15000)
    );
    
    await Promise.race([connectionPromise, timeoutPromise]);
    console.log("Firebase connection successful.");
  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes('the client is offline') || error.message.includes('Connection timeout')) {
        console.warn("Firestore is currently unreachable. The app will work in offline mode and sync when possible.");
      } else {
        console.error("Firestore connectivity issue:", error.message);
      }
    }
  }
}
testConnection();

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
