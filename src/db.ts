import Database from 'better-sqlite3';
import path from 'path';

let db: any;
try {
  db = new Database('database.db');
  console.log("Database initialized at database.db");
} catch (error: any) {
  console.error("CRITICAL: Failed to initialize database:", error.message);
  // Fallback to a mock or handle gracefully
  db = {
    exec: () => console.warn("Mock DB: exec called"),
    prepare: () => ({
      run: () => ({ lastInsertRowid: 0 }),
      get: () => null,
      all: () => []
    })
  };
}

// Initialize tables
if (db.exec) {
  try {
    db.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        name TEXT NOT NULL,
        company_name TEXT,
        agent_name TEXT,
        logo_url TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS bookings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        rayna_booking_id TEXT NOT NULL,
        tour_name TEXT NOT NULL,
        option_name TEXT, -- Added option name
        reference_no TEXT, -- Added reference number
        tour_id INTEGER NOT NULL,
        booking_date TEXT NOT NULL,
        travel_date TEXT NOT NULL,
        total_amount REAL NOT NULL,
        status TEXT NOT NULL,
        pax_details TEXT NOT NULL, -- JSON string
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id)
      );
    `);
    
    // Try to add the column if it doesn't exist (for existing databases)
    try {
      db.exec("ALTER TABLE bookings ADD COLUMN option_name TEXT;");
      console.log("Added option_name column to bookings table");
    } catch (e) {}

    try {
      db.exec("ALTER TABLE bookings ADD COLUMN reference_no TEXT;");
      console.log("Added reference_no column to bookings table");
    } catch (e) {}

    try {
      db.exec("ALTER TABLE users ADD COLUMN company_name TEXT;");
    } catch (e) {}
    try {
      db.exec("ALTER TABLE users ADD COLUMN agent_name TEXT;");
    } catch (e) {}
    try {
      db.exec("ALTER TABLE users ADD COLUMN logo_url TEXT;");
    } catch (e) {}
    
    console.log("Database tables verified/created");
  } catch (error: any) {
    console.error("CRITICAL: Failed to create tables:", error.message);
  }
}

export default db;
