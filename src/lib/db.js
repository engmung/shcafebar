// File: src/lib/db.js

import Database from "better-sqlite3";
import { dev } from "$app/environment";
import { DB_PATH } from "$env/static/private";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let db;

function getDatabase() {
  if (!db) {
    const dbPath = dev
      ? path.join(__dirname, "..", "..", "dev.db")
      : path.join(process.cwd(), DB_PATH);

    db = new Database(dbPath, { verbose: console.log });
    db.pragma("foreign_keys = ON");

    if (
      !fs.existsSync(dbPath) ||
      db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all()
        .length === 0
    ) {
      console.log("Initializing database...");
      createTables();
    }
  }
  return db;
}

function createTables() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      role TEXT NOT NULL DEFAULT 'user'
    );

    CREATE TABLE IF NOT EXISTS menu_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      price REAL NOT NULL,
      description TEXT,
      category TEXT NOT NULL,
      detail_content TEXT,
      is_visible BOOLEAN NOT NULL DEFAULT 1
    );

    CREATE TABLE IF NOT EXISTS menu_images (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      menu_id INTEGER NOT NULL,
      image_url TEXT NOT NULL,
      is_primary BOOLEAN NOT NULL DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (menu_id) REFERENCES menu_items (id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      date TEXT NOT NULL,
      reservation_id INTEGER,
      total_amount REAL NOT NULL,
      FOREIGN KEY (reservation_id) REFERENCES reservations(id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS available_dates (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      date TEXT NOT NULL,
      time TEXT NOT NULL,
      capacity INTEGER NOT NULL,
      menu_id INTEGER,
      drink_id INTEGER,
      FOREIGN KEY (menu_id) REFERENCES menu_items(id) ON DELETE SET NULL,
      FOREIGN KEY (drink_id) REFERENCES menu_items(id) ON DELETE SET NULL,
      UNIQUE(date, time)
    );

    CREATE TABLE IF NOT EXISTS ingredients (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      cost REAL NOT NULL,
      characteristics TEXT,
      volume REAL NOT NULL,
      unit TEXT NOT NULL,
      min_volume REAL
    );

    CREATE TABLE IF NOT EXISTS reservations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_name TEXT NOT NULL,
      date TEXT NOT NULL,
      time TEXT NOT NULL,
      guests INTEGER NOT NULL,
      menu_request TEXT DEFAULT '',
      drink_request TEXT DEFAULT '',
      status TEXT NOT NULL DEFAULT 'pending',
      FOREIGN KEY (user_name) REFERENCES users(name) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS menu_ingredients (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      menu_id INTEGER NOT NULL,
      ingredient_id INTEGER NOT NULL,
      amount REAL NOT NULL,
      unit TEXT NOT NULL,
      FOREIGN KEY (menu_id) REFERENCES menu_items(id) ON DELETE CASCADE,
      FOREIGN KEY (ingredient_id) REFERENCES ingredients(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_menu_images_menu_id ON menu_images (menu_id);
  `);
}

const dbInstance = getDatabase();
export { dbInstance as db };
