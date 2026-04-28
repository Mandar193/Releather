import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import {defineConfig, loadEnv} from 'vite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig(({mode}) => {
  const env = loadEnv(mode, '.', '');
  
  // Load Firebase config for embedding
  let firebaseConfig = {};
  const configPath = path.resolve(__dirname, 'firebase-applet-config.json');
  if (fs.existsSync(configPath)) {
    try {
      firebaseConfig = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    } catch (e) {
      console.error('Failed to parse Firebase config for embedding:', e);
    }
  }

  return {
    plugins: [react(), tailwindcss()],
    define: {
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
      '__FIREBASE_CONFIG__': JSON.stringify({
        apiKey: env.VITE_FIREBASE_API_KEY || (firebaseConfig as any).apiKey || '',
        authDomain: env.VITE_FIREBASE_AUTH_DOMAIN || (firebaseConfig as any).authDomain || '',
        projectId: env.VITE_FIREBASE_PROJECT_ID || (firebaseConfig as any).projectId || '',
        storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET || (firebaseConfig as any).storageBucket || '',
        messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID || (firebaseConfig as any).messagingSenderId || '',
        appId: env.VITE_FIREBASE_APP_ID || (firebaseConfig as any).appId || '',
        measurementId: env.VITE_FIREBASE_MEASUREMENT_ID || (firebaseConfig as any).measurementId || '',
        firestoreDatabaseId: env.VITE_FIREBASE_FIRESTORE_DATABASE_ID || (firebaseConfig as any).firestoreDatabaseId || ''
      })
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
    },
  };
});
