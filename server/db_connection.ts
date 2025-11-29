import { drizzle as drizzleMysql } from "drizzle-orm/mysql2";
import { drizzle as drizzleSqlite } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";
import * as schema from "../drizzle/schema";

let _db: any = null;
let _dbType: 'mysql' | 'sqlite' | null = null;

export async function getDb() {
  if (_db) return _db;

  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.warn("[Database] DATABASE_URL not set");
    return null;
  }

  try {
    // Detect database type
    const isSQLite = connectionString.startsWith('file:') || connectionString.endsWith('.db');
    
    if (isSQLite) {
      // SQLite connection
      const dbPath = connectionString.replace('file:', '');
      console.log(`[Database] Connecting to SQLite: ${dbPath}`);
      
      const sqlite = new Database(dbPath);
      sqlite.pragma('journal_mode = WAL'); // Better performance
      _db = drizzleSqlite(sqlite, { schema });
      _dbType = 'sqlite';
      
      console.log("[Database] SQLite connected successfully");
    } else {
      // MySQL connection
      console.log("[Database] Connecting to MySQL");
      _db = drizzleMysql(connectionString);
      _dbType = 'mysql';
      
      console.log("[Database] MySQL connected successfully");
    }

    return _db;
  } catch (error) {
    console.error("[Database] Connection failed:", error);
    _db = null;
    _dbType = null;
    return null;
  }
}

export function getDbType() {
  return _dbType;
}

export function closeDb() {
  if (_db && _dbType === 'sqlite') {
    // SQLite needs explicit close
    try {
      _db.close();
    } catch (error) {
      console.error("[Database] Failed to close SQLite:", error);
    }
  }
  _db = null;
  _dbType = null;
}
