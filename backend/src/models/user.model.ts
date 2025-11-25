import { Database } from 'sqlite3';
import { User, CreateUserDto, UpdateUserDto } from '../types/user.types';
import * as crypto from 'crypto';

export class UserModel {
  constructor(private db: Database) {
    this.initTable();
  }

  private hashPassword(password: string): string {
    return crypto.createHash('sha256').update(password).digest('hex');
  }

  private initTable(): void {
    this.db.serialize(() => {
      this.db.run(`
        CREATE TABLE IF NOT EXISTS users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          username TEXT NOT NULL UNIQUE,
          password TEXT NOT NULL,
          email TEXT,
          fullName TEXT,
          createdAt TEXT NOT NULL,
          updatedAt TEXT NOT NULL
        )
      `, () => {
        // Check if admin user exists, if not create it
        this.db.get('SELECT * FROM users WHERE username = ?', ['admin'], (err, row) => {
          if (err) {
            console.error('Error checking admin user:', err);
            return;
          }
          if (!row) {
            const now = new Date().toISOString();
            const hashedPassword = this.hashPassword('admin');
            this.db.run(
              'INSERT INTO users (username, password, email, fullName, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?)',
              ['admin', hashedPassword, null, 'Administrator', now, now],
              (err) => {
                if (err) {
                  console.error('Error creating admin user:', err);
                } else {
                  console.log('Admin user created (username: admin, password: admin)');
                }
              }
            );
          }
        });
      });
    });
  }

  async create(data: CreateUserDto): Promise<User> {
    return new Promise((resolve, reject) => {
      const now = new Date().toISOString();
      const hashedPassword = this.hashPassword(data.password);
      const sql = `
        INSERT INTO users (username, password, email, fullName, createdAt, updatedAt)
        VALUES (?, ?, ?, ?, ?, ?)
      `;
      const db = this.db;
      this.db.run(
        sql,
        [data.username, hashedPassword, data.email || null, data.fullName || null, now, now],
        function (err) {
          if (err) {
            reject(err);
            return;
          }
          const userId = this.lastID;
          db.get('SELECT * FROM users WHERE id = ?', [userId], (err, row) => {
            if (err) {
              reject(err);
              return;
            }
            resolve(row as User);
          });
        }
      );
    });
  }

  async findAll(): Promise<User[]> {
    return new Promise((resolve, reject) => {
      this.db.all('SELECT * FROM users ORDER BY username ASC', (err, rows) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(rows as User[]);
      });
    });
  }

  async findById(id: number): Promise<User | null> {
    return new Promise((resolve, reject) => {
      this.db.get('SELECT * FROM users WHERE id = ?', [id], (err, row) => {
        if (err) {
          reject(err);
          return;
        }
        resolve((row as User) || null);
      });
    });
  }

  async findByUsername(username: string): Promise<User | null> {
    return new Promise((resolve, reject) => {
      this.db.get('SELECT * FROM users WHERE username = ?', [username], (err, row) => {
        if (err) {
          reject(err);
          return;
        }
        resolve((row as User) || null);
      });
    });
  }

  async update(id: number, data: UpdateUserDto): Promise<User | null> {
    return new Promise((resolve, reject) => {
      const updates: string[] = [];
      const params: any[] = [];

      if (data.username !== undefined) {
        updates.push('username = ?');
        params.push(data.username);
      }
      if (data.password !== undefined) {
        updates.push('password = ?');
        params.push(this.hashPassword(data.password));
      }
      if (data.email !== undefined) {
        updates.push('email = ?');
        params.push(data.email);
      }
      if (data.fullName !== undefined) {
        updates.push('fullName = ?');
        params.push(data.fullName);
      }

      if (updates.length === 0) {
        this.findById(id).then(resolve).catch(reject);
        return;
      }

      updates.push('updatedAt = ?');
      params.push(new Date().toISOString());
      params.push(id);

      const sql = `UPDATE users SET ${updates.join(', ')} WHERE id = ?`;
      const db = this.db;

      this.db.run(sql, params, function (err) {
        if (err) {
          reject(err);
          return;
        }
        db.get('SELECT * FROM users WHERE id = ?', [id], (err, row) => {
          if (err) {
            reject(err);
            return;
          }
          resolve((row as User) || null);
        });
      });
    });
  }

  async delete(id: number): Promise<boolean> {
    return new Promise((resolve, reject) => {
      this.db.run('DELETE FROM users WHERE id = ?', [id], function (err) {
        if (err) {
          reject(err);
          return;
        }
        resolve(this.changes > 0);
      });
    });
  }
}

