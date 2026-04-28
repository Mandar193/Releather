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
  const configPath = path.resolve(__dirname, 'firebase-applet-config.json');
  let bakedConfig = {
    apiKey: '',
    authDomain: '',
    projectId: '',
    storageBucket: '',
    messagingSenderId: '',
    appId: '',
    measurementId: '',
    firestoreDatabaseId: ''
  };

  if (fs.existsSync(configPath)) {
    try {
      const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
      bakedConfig = {
        apiKey: env.VITE_FIREBASE_API_KEY || config.apiKey || '',
        authDomain: env.VITE_FIREBASE_AUTH_DOMAIN || config.authDomain || '',
        projectId: env.VITE_FIREBASE_PROJECT_ID || config.projectId || '',
        storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET || config.storageBucket || '',
        messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID || config.messagingSenderId || '',
        appId: env.VITE_FIREBASE_APP_ID || config.appId || '',
        measurementId: env.VITE_FIREBASE_MEASUREMENT_ID || config.measurementId || '',
        firestoreDatabaseId: env.VITE_FIREBASE_FIRESTORE_DATABASE_ID || config.firestoreDatabaseId || ''
      };
      console.log('Embedding Firebase config for project:', bakedConfig.projectId);
    } catch (e) {
      console.error('Failed to parse Firebase config for embedding:', e);
    }
  }

  return {
    plugins: [react(), tailwindcss()],
    define: {
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
      '__FIREBASE_CONFIG__': JSON.stringify(bakedConfig)
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
