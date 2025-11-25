import { Database } from 'sqlite3';
import * as path from 'path';

export const createDatabase = (dbPath: string): Database => {
  const fullPath = path.resolve(dbPath);
  const db = new Database(fullPath, (err) => {
    if (err) {
      console.error('Error opening database:', err);
    } else {
      console.log('Connected to SQLite database');
      // Enable foreign keys
      db.run('PRAGMA foreign_keys = ON', (err) => {
        if (err) {
          console.error('Error enabling foreign keys:', err);
        }
      });
    }
  });
  return db;
};

