import Database from 'better-sqlite3';

const db = new Database('app.db');

// Enable foreign keys
db.pragma('foreign_keys = ON');

export function initDb() {
  // Create Families table
  db.exec(`
    CREATE TABLE IF NOT EXISTS families (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      kk_number TEXT UNIQUE NOT NULL,
      head_of_family TEXT NOT NULL,
      address TEXT NOT NULL,
      rt TEXT NOT NULL,
      rw TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Create Residents table
  db.exec(`
    CREATE TABLE IF NOT EXISTS residents (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      family_id INTEGER,
      nik TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      gender TEXT NOT NULL, -- 'L' or 'P'
      birth_place TEXT NOT NULL,
      birth_date DATE NOT NULL,
      religion TEXT,
      job TEXT,
      marital_status TEXT,
      status TEXT DEFAULT 'Hidup', -- Hidup, Meninggal, Pindah
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (family_id) REFERENCES families (id) ON DELETE SET NULL
    )
  `);

  // Create Letters table (Surat Pengantar)
  db.exec(`
    CREATE TABLE IF NOT EXISTS letters (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      resident_id INTEGER NOT NULL,
      type TEXT NOT NULL, -- e.g., 'Surat Pengantar KTP', 'Surat Domisili'
      description TEXT,
      status TEXT DEFAULT 'Pending', -- Pending, Approved, Rejected
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (resident_id) REFERENCES residents (id) ON DELETE CASCADE
    )
  `);

  // Seed data if empty
  const stmt = db.prepare('SELECT count(*) as count FROM families');
  const result = stmt.get() as { count: number };
  
  if (result.count === 0) {
    console.log('Seeding database...');
    
    const insertFamily = db.prepare(`
      INSERT INTO families (kk_number, head_of_family, address, rt, rw)
      VALUES (?, ?, ?, ?, ?)
    `);

    const insertResident = db.prepare(`
      INSERT INTO residents (family_id, nik, name, gender, birth_place, birth_date, religion, job, marital_status, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    // Family 1
    const info1 = insertFamily.run('3201010101010001', 'Budi Santoso', 'Jl. Merpati No. 10', '01', '05');
    const fam1Id = info1.lastInsertRowid;

    insertResident.run(fam1Id, '3201010101010001', 'Budi Santoso', 'L', 'Jakarta', '1980-01-01', 'Islam', 'PNS', 'Kawin', 'Hidup');
    insertResident.run(fam1Id, '3201010101010002', 'Siti Aminah', 'P', 'Bandung', '1982-05-15', 'Islam', 'Ibu Rumah Tangga', 'Kawin', 'Hidup');
    insertResident.run(fam1Id, '3201010101010003', 'Rudi Hartono', 'L', 'Jakarta', '2005-03-10', 'Islam', 'Pelajar', 'Belum Kawin', 'Hidup');

    // Family 2
    const info2 = insertFamily.run('3201010101010002', 'Joko Widodo', 'Jl. Elang No. 5', '02', '05');
    const fam2Id = info2.lastInsertRowid;
    
    insertResident.run(fam2Id, '3201010101010004', 'Joko Widodo', 'L', 'Solo', '1975-06-21', 'Islam', 'Wiraswasta', 'Kawin', 'Hidup');
  }
}

export default db;
