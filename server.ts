import express from 'express';
import { createServer as createViteServer } from 'vite';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import Database from 'better-sqlite3';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Database
const db = new Database('data.db');

// Create tables
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    uid TEXT PRIMARY KEY,
    email TEXT,
    display_name TEXT,
    photo_url TEXT,
    role TEXT DEFAULT 'user',
    items_resold INTEGER DEFAULT 0,
    items_recycled INTEGER DEFAULT 0,
    co2_saved REAL DEFAULT 0.0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS items (
    id TEXT PRIMARY KEY,
    seller_id TEXT,
    title TEXT,
    description TEXT,
    category TEXT,
    brand TEXT,
    images TEXT, -- JSON string
    condition TEXT,
    suggested_price REAL,
    confidence REAL,
    analysis_notes TEXT,
    listed_price REAL,
    status TEXT DEFAULT 'pending',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(seller_id) REFERENCES users(uid)
  );

  CREATE TABLE IF NOT EXISTS lifecycle_events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    item_id TEXT,
    status TEXT,
    note TEXT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(item_id) REFERENCES items(id)
  );
`);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(cors());
  app.use(express.json());

  // API Routes
  
  // User Profile
  app.get('/api/users/:uid', (req, res) => {
    try {
      const user = db.prepare('SELECT * FROM users WHERE uid = ?').get(req.params.uid);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      // Map database row to UserProfile interface
      res.json({
        uid: user.uid,
        email: user.email,
        displayName: user.display_name,
        photoURL: user.photo_url,
        role: user.role,
        sustainabilityScore: {
          itemsResold: user.items_resold,
          itemsRecycled: user.items_recycled,
          co2Saved: user.co2_saved
        },
        createdAt: user.created_at
      });
    } catch (err) {
      res.status(500).json({ error: (err as Error).message });
    }
  });

  app.post('/api/users', (req, res) => {
    const { uid, email, displayName, photoURL } = req.body;
    try {
      db.prepare(`
        INSERT INTO users (uid, email, display_name, photo_url)
        VALUES (?, ?, ?, ?)
        ON CONFLICT(uid) DO UPDATE SET
          display_name = excluded.display_name,
          photo_url = excluded.photo_url
      `).run(uid, email, displayName, photoURL);
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ error: (err as Error).message });
    }
  });

  // Items
  app.get('/api/items', (req, res) => {
    try {
      const { sellerId, status } = req.query;
      let query = 'SELECT * FROM items WHERE 1=1';
      const params = [];

      if (sellerId) {
        query += ' AND seller_id = ?';
        params.push(sellerId);
      }
      if (status) {
        query += ' AND status = ?';
        params.push(status);
      }
      
      const items = db.prepare(query).all(...params);
      
      const formattedItems = items.map((item: any) => ({
        ...item,
        sellerId: item.seller_id,
        listedPrice: item.listed_price,
        createdAt: item.created_at,
        updatedAt: item.updated_at,
        images: JSON.parse(item.images || '[]'),
        aiAnalysis: {
          condition: item.condition,
          suggestedPrice: item.suggested_price,
          confidence: item.confidence,
          notes: item.analysis_notes
        },
        lifecycleHistory: [] // To be populated if needed
      }));
      res.json(formattedItems);
    } catch (err) {
      res.status(500).json({ error: (err as Error).message });
    }
  });

  app.patch('/api/items/:id', (req, res) => {
    const { status, note } = req.body;
    try {
      db.prepare('UPDATE items SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(status, req.params.id);
      if (note) {
        db.prepare('INSERT INTO lifecycle_events (item_id, status, note) VALUES (?, ?, ?)').run(req.params.id, status, note);
      }
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ error: (err as Error).message });
    }
  });

  app.post('/api/transactions', (req, res) => {
    const { itemId, buyerId, sellerId, amount } = req.body;
    try {
      // In a real app we'd have a transactions table, for now we just log it and update the item
      db.prepare('UPDATE items SET status = "sold", updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(itemId);
      db.prepare('INSERT INTO lifecycle_events (item_id, status, note) VALUES (?, "sold", "Purchased via API")').run(itemId);
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ error: (err as Error).message });
    }
  });

  app.post('/api/items', (req, res) => {
    const item = req.body;
    try {
      db.prepare(`
        INSERT INTO items (
          id, seller_id, title, description, category, brand, images,
          condition, suggested_price, confidence, analysis_notes,
          listed_price, status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        item.id, item.sellerId, item.title, item.description, item.category, item.brand,
        JSON.stringify(item.images), item.aiAnalysis?.condition, 
        item.aiAnalysis?.suggestedPrice, item.aiAnalysis?.confidence,
        item.aiAnalysis?.notes, item.listedPrice, item.status
      );
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ error: (err as Error).message });
    }
  });

  app.delete('/api/items/:id', (req, res) => {
    try {
      const result = db.prepare('DELETE FROM items WHERE id = ?').run(req.params.id);
      if (result.changes === 0) {
        return res.status(404).json({ error: 'Item not found' });
      }
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ error: (err as Error).message });
    }
  });

  // Vite middleware or production serving
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
