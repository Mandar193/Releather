import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, doc, getDocFromServer } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth();

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
