import express from 'express';
import { createServer as createViteServer } from 'vite';
import db, { initDb } from './db';

// Initialize Database
initDb();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes

  // Get Dashboard Stats
  app.get('/api/stats', (req, res) => {
    const totalResidents = db.prepare("SELECT count(*) as count FROM residents WHERE status = 'Hidup'").get() as { count: number };
    const totalFamilies = db.prepare("SELECT count(*) as count FROM families").get() as { count: number };
    const maleCount = db.prepare("SELECT count(*) as count FROM residents WHERE gender = 'L' AND status = 'Hidup'").get() as { count: number };
    const femaleCount = db.prepare("SELECT count(*) as count FROM residents WHERE gender = 'P' AND status = 'Hidup'").get() as { count: number };
    
    res.json({
      residents: totalResidents.count,
      families: totalFamilies.count,
      males: maleCount.count,
      females: femaleCount.count
    });
  });

  // Residents CRUD
  app.get('/api/residents', (req, res) => {
    const residents = db.prepare(`
      SELECT r.*, f.kk_number, f.address, f.rt, f.rw 
      FROM residents r 
      LEFT JOIN families f ON r.family_id = f.id
      ORDER BY r.name ASC
    `).all();
    res.json(residents);
  });

  app.post('/api/residents', (req, res) => {
    const { family_id, nik, name, gender, birth_place, birth_date, religion, job, marital_status, status } = req.body;
    try {
      const stmt = db.prepare(`
        INSERT INTO residents (family_id, nik, name, gender, birth_place, birth_date, religion, job, marital_status, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      const info = stmt.run(family_id, nik, name, gender, birth_place, birth_date, religion, job, marital_status, status || 'Hidup');
      res.json({ id: info.lastInsertRowid });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.put('/api/residents/:id', (req, res) => {
    const { family_id, nik, name, gender, birth_place, birth_date, religion, job, marital_status, status } = req.body;
    try {
      const stmt = db.prepare(`
        UPDATE residents 
        SET family_id=?, nik=?, name=?, gender=?, birth_place=?, birth_date=?, religion=?, job=?, marital_status=?, status=?
        WHERE id=?
      `);
      stmt.run(family_id, nik, name, gender, birth_place, birth_date, religion, job, marital_status, status, req.params.id);
      res.json({ success: true });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.delete('/api/residents/:id', (req, res) => {
    try {
      db.prepare('DELETE FROM residents WHERE id = ?').run(req.params.id);
      res.json({ success: true });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // Families CRUD
  app.get('/api/families', (req, res) => {
    const families = db.prepare('SELECT * FROM families ORDER BY kk_number ASC').all();
    res.json(families);
  });

  app.post('/api/families', (req, res) => {
    const { kk_number, head_of_family, address, rt, rw } = req.body;
    try {
      const stmt = db.prepare(`
        INSERT INTO families (kk_number, head_of_family, address, rt, rw)
        VALUES (?, ?, ?, ?, ?)
      `);
      const info = stmt.run(kk_number, head_of_family, address, rt, rw);
      res.json({ id: info.lastInsertRowid });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // Letters CRUD
  app.get('/api/letters', (req, res) => {
    const letters = db.prepare(`
      SELECT l.*, r.name as resident_name, r.nik 
      FROM letters l
      JOIN residents r ON l.resident_id = r.id
      ORDER BY l.created_at DESC
    `).all();
    res.json(letters);
  });

  app.post('/api/letters', (req, res) => {
    const { resident_id, type, description } = req.body;
    try {
      const stmt = db.prepare(`
        INSERT INTO letters (resident_id, type, description, status)
        VALUES (?, ?, ?, 'Pending')
      `);
      const info = stmt.run(resident_id, type, description);
      res.json({ id: info.lastInsertRowid });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.put('/api/letters/:id/status', (req, res) => {
    const { status } = req.body;
    try {
      db.prepare('UPDATE letters SET status = ? WHERE id = ?').run(status, req.params.id);
      res.json({ success: true });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
