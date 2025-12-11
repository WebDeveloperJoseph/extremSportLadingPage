import path from 'path';
import fs from 'fs';
import sqlite3 from 'sqlite3';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

const dbPath = path.join(dataDir, 'pretinho.db');
sqlite3.verbose();
const db = new sqlite3.Database(dbPath);

export function initDb() {
  db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT,
      category TEXT,
      priceOld REAL,
      priceCurrent REAL,
      discount INTEGER,
      image TEXT,
      stock INTEGER DEFAULT 0,
      active INTEGER DEFAULT 1,
      createdAt TEXT,
      updatedAt TEXT
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS banners (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      image TEXT NOT NULL,
      title TEXT NOT NULL,
      subtitle TEXT,
      link TEXT,
      ord INTEGER DEFAULT 0,
      active INTEGER DEFAULT 1,
      createdAt TEXT,
      updatedAt TEXT
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS featured_groups (
      key TEXT PRIMARY KEY,
      items TEXT
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS orders (
      id INTEGER PRIMARY KEY,
      date TEXT,
      items TEXT NOT NULL,
      subtotal REAL,
      shipping REAL,
      discount REAL,
      total REAL NOT NULL,
      status TEXT DEFAULT 'pending',
      createdAt TEXT,
      updatedAt TEXT
    )`);
  });
}

export function all(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => err ? reject(err) : resolve(rows));
  });
}

export function get(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => err ? reject(err) : resolve(row));
  });
}

export function run(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function(err) {
      if (err) return reject(err);
      resolve({ lastID: this.lastID, changes: this.changes });
    });
  });
}
