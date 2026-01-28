import Database from 'better-sqlite3';
import { resolve } from 'path';
import { fileURLToPath } from 'url';
import { mkdirSync } from 'fs';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const dataDir = resolve(__dirname, '../../data');
const dbPath = resolve(dataDir, 'analytics.db');

// Ensure data directory exists
mkdirSync(dataDir, { recursive: true });

// Initialize database connection
export const db = new Database(dbPath);

// Enable foreign keys
db.pragma('foreign_keys = ON');

// Initialize tables
export function initializeDatabase() {
  // Channel Analytics Data - supports both YouTube and Minecraft
  db.exec(`
    CREATE TABLE IF NOT EXISTS channel_analytics (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      channel_slug TEXT NOT NULL,
      date DATE NOT NULL,
      -- YouTube metrics
      subscribers INTEGER,
      views INTEGER,
      videos INTEGER,
      avg_views_per_video REAL,
      -- Minecraft metrics
      daily_user INTEGER,
      daily_peak_online INTEGER,
      weekly_user INTEGER,
      alltime_user INTEGER,
      daily_sessions INTEGER,
      -- Metadata
      growth_rate REAL,
      engagement_rate REAL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(channel_slug, date),
      FOREIGN KEY (channel_slug) REFERENCES channels(slug)
    );
  `);

  // Channel Info
  db.exec(`
    CREATE TABLE IF NOT EXISTS channels (
      slug TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT,
      image TEXT,
      youtube_url TEXT,
      status TEXT DEFAULT 'inactive',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Data Import Log
  db.exec(`
    CREATE TABLE IF NOT EXISTS import_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      channel_slug TEXT NOT NULL,
      import_date DATETIME DEFAULT CURRENT_TIMESTAMP,
      records_imported INTEGER,
      api_source TEXT,
      status TEXT DEFAULT 'success',
      error_message TEXT,
      FOREIGN KEY (channel_slug) REFERENCES channels(slug)
    );
  `);

  // Create indexes for better query performance
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_channel_analytics_slug_date 
    ON channel_analytics(channel_slug, date DESC);
  `);

  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_import_logs_channel_slug 
    ON import_logs(channel_slug, import_date DESC);
  `);
}

// Initialize on module load
initializeDatabase();

export default db;
