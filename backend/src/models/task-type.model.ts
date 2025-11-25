import { Database } from 'sqlite3';
import { TaskType, CreateTaskTypeDto, UpdateTaskTypeDto } from '../types/task-type.types';

export class TaskTypeModel {
  constructor(private db: Database) {
    this.initTable();
  }

  private initTable(): void {
    this.db.serialize(() => {
      this.db.run(`
        CREATE TABLE IF NOT EXISTS task_types (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL UNIQUE,
          description TEXT,
          color TEXT,
          createdAt TEXT NOT NULL,
          updatedAt TEXT NOT NULL
        )
      `);
    });
  }

  async create(data: CreateTaskTypeDto): Promise<TaskType> {
    return new Promise((resolve, reject) => {
      const now = new Date().toISOString();
      const sql = `
        INSERT INTO task_types (name, description, color, createdAt, updatedAt)
        VALUES (?, ?, ?, ?, ?)
      `;
      const db = this.db;
      this.db.run(
        sql,
        [data.name, data.description || null, data.color || null, now, now],
        function (err) {
          if (err) {
            reject(err);
            return;
          }
          const typeId = this.lastID;
          db.get('SELECT * FROM task_types WHERE id = ?', [typeId], (err, row) => {
            if (err) {
              reject(err);
              return;
            }
            resolve(row as TaskType);
          });
        }
      );
    });
  }

  async findAll(): Promise<TaskType[]> {
    return new Promise((resolve, reject) => {
      this.db.all('SELECT * FROM task_types ORDER BY name ASC', (err, rows) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(rows as TaskType[]);
      });
    });
  }

  async findById(id: number): Promise<TaskType | null> {
    return new Promise((resolve, reject) => {
      this.db.get('SELECT * FROM task_types WHERE id = ?', [id], (err, row) => {
        if (err) {
          reject(err);
          return;
        }
        resolve((row as TaskType) || null);
      });
    });
  }

  async update(id: number, data: UpdateTaskTypeDto): Promise<TaskType | null> {
    return new Promise((resolve, reject) => {
      const updates: string[] = [];
      const params: any[] = [];

      if (data.name !== undefined) {
        updates.push('name = ?');
        params.push(data.name);
      }
      if (data.description !== undefined) {
        updates.push('description = ?');
        params.push(data.description);
      }
      if (data.color !== undefined) {
        updates.push('color = ?');
        params.push(data.color);
      }

      if (updates.length === 0) {
        this.findById(id).then(resolve).catch(reject);
        return;
      }

      updates.push('updatedAt = ?');
      params.push(new Date().toISOString());
      params.push(id);

      const sql = `UPDATE task_types SET ${updates.join(', ')} WHERE id = ?`;
      const db = this.db;

      this.db.run(sql, params, function (err) {
        if (err) {
          reject(err);
          return;
        }
        db.get('SELECT * FROM task_types WHERE id = ?', [id], (err, row) => {
          if (err) {
            reject(err);
            return;
          }
          resolve((row as TaskType) || null);
        });
      });
    });
  }

  async delete(id: number): Promise<boolean> {
    return new Promise((resolve, reject) => {
      this.db.run('DELETE FROM task_types WHERE id = ?', [id], function (err) {
        if (err) {
          reject(err);
          return;
        }
        resolve(this.changes > 0);
      });
    });
  }
}

