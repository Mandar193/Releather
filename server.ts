import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { initializeApp } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Firebase Admin
let db: any;
try {
  const configPath = path.join(process.cwd(), 'firebase-applet-config.json');
  if (fs.existsSync(configPath)) {
    const firebaseConfig = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    initializeApp({
      projectId: firebaseConfig.projectId
    });
    db = getFirestore();
  }
} catch (e) {
  console.error('Firebase admin initialization failed:', e);
}

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// API Routes

// User Profile
app.get('/api/users/:uid', async (req, res) => {
  try {
    if (!db) throw new Error('Database not initialized');
    const userDoc = await db.collection('users').doc(req.params.uid).get();
    
    if (!userDoc.exists) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json(userDoc.data());
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

app.post('/api/users', async (req, res) => {
  const { uid, email, displayName, photoURL } = req.body;
  try {
    if (!db) throw new Error('Database not initialized');
    await db.collection('users').doc(uid).set({
      uid,
      email,
      displayName,
      photoURL,
      role: 'user',
      sustainabilityScore: {
        itemsResold: 0,
        itemsRecycled: 0,
        co2Saved: 0.0
      },
      createdAt: new Date().toISOString()
    }, { merge: true });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

// Items
app.get('/api/items', async (req, res) => {
  try {
    if (!db) throw new Error('Database not initialized');
    const { sellerId, status } = req.query;
    let query: any = db.collection('items');

    if (sellerId) {
      query = query.where('sellerId', '==', sellerId);
    }
    if (status) {
      query = query.where('status', '==', status);
    }
    
    const snapshot = await query.get();
    const items = snapshot.docs.map((doc: any) => ({
      id: doc.id,
      ...doc.data()
    }));
    
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

app.patch('/api/items/:id', async (req, res) => {
  const { status, note } = req.body;
  try {
    if (!db) throw new Error('Database not initialized');
    const itemRef = db.collection('items').doc(req.params.id);
    
    const updateData: any = {
      status,
      updatedAt: new Date().toISOString()
    };

    if (note) {
      updateData.lifecycleHistory = FieldValue.arrayUnion({
        status,
        note,
        timestamp: new Date().toISOString()
      });
    }

    await itemRef.update(updateData);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

app.post('/api/transactions', async (req, res) => {
  const { itemId, buyerId, sellerId, amount } = req.body;
  try {
    if (!db) throw new Error('Database not initialized');
    const batch = db.batch();
    
    const transRef = db.collection('transactions').doc();
    batch.set(transRef, {
      itemId,
      buyerId,
      sellerId,
      amount,
      status: 'completed',
      createdAt: new Date().toISOString()
    });

    const itemRef = db.collection('items').doc(itemId);
    batch.update(itemRef, {
      status: 'sold',
      updatedAt: new Date().toISOString(),
      lifecycleHistory: FieldValue.arrayUnion({
        status: 'sold',
        note: 'Purchased via Marketplace',
        timestamp: new Date().toISOString()
      })
    });

    // Update seller stats
    const sellerRef = db.collection('users').doc(sellerId);
    batch.update(sellerRef, {
      'sustainabilityScore.itemsResold': FieldValue.increment(1),
      'sustainabilityScore.co2Saved': FieldValue.increment(15.5) // Example value
    });

    await batch.commit();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

app.post('/api/items', async (req, res) => {
  const item = req.body;
  try {
    if (!db) throw new Error('Database not initialized');
    const itemData = {
      ...item,
      createdAt: item.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      lifecycleHistory: item.lifecycleHistory || [{
        status: item.status || 'pending',
        note: 'Item created',
        timestamp: new Date().toISOString()
      }]
    };
    
    await db.collection('items').doc(item.id).set(itemData);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

app.delete('/api/items/:id', async (req, res) => {
  try {
    if (!db) throw new Error('Database not initialized');
    await db.collection('items').doc(req.params.id).delete();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

// Only serve static files if NOT on Vercel (e.g. local production testing)
if (!process.env.VERCEL) {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      if (req.path.startsWith('/api')) {
        return res.status(404).json({ error: 'API route not found' });
      }
      const indexPath = path.join(distPath, 'index.html');
      if (fs.existsSync(indexPath)) {
        res.sendFile(indexPath);
      } else {
        res.status(404).send('Not found');
      }
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

export default app;
