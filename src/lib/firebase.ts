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

const firebaseConfig = {
  apiKey: embeddedConfig.apiKey || import.meta.env.VITE_FIREBASE_API_KEY || (firebaseConfigJson as any).apiKey,
  authDomain: embeddedConfig.authDomain || import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || (firebaseConfigJson as any).authDomain,
  projectId: embeddedConfig.projectId || import.meta.env.VITE_FIREBASE_PROJECT_ID || (firebaseConfigJson as any).projectId,
  storageBucket: embeddedConfig.storageBucket || import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || (firebaseConfigJson as any).storageBucket,
  messagingSenderId: embeddedConfig.messagingSenderId || import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || (firebaseConfigJson as any).messagingSenderId,
  appId: embeddedConfig.appId || import.meta.env.VITE_FIREBASE_APP_ID || (firebaseConfigJson as any).appId,
  measurementId: embeddedConfig.measurementId || import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || (firebaseConfigJson as any).measurementId,
  firestoreDatabaseId: embeddedConfig.firestoreDatabaseId || import.meta.env.VITE_FIREBASE_FIRESTORE_DATABASE_ID || (firebaseConfigJson as any).firestoreDatabaseId
};

if (!firebaseConfig.apiKey) {
  console.error("Firebase API Key is missing. Embedded config keys:", Object.keys(embeddedConfig));
  console.error("VITE_FIREBASE_API_KEY present:", !!import.meta.env.VITE_FIREBASE_API_KEY);
  console.error("Please check your environment variables or firebase-applet-config.json.");
} else {
  console.log("Firebase initialized successfully with API key.");
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
