import { Database } from 'sqlite3';
import { Task, CreateTaskDto, UpdateTaskDto, TaskQueryParams, TaskStatus } from '../types/task.types';

export class TaskModel {
  constructor(private db: Database) {
    this.initTable();
  }

  private initTable(): void {
    this.db.serialize(() => {
      // First create task_types table if it doesn't exist
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

      // Check if columns exist, if not add them
      this.db.all("PRAGMA table_info(tasks)", (err, columns: any[]) => {
        if (err) {
          console.error('Error checking table info:', err);
          return;
        }
        
        const columnNames = columns.map((col: any) => col.name);
        
        if (!columnNames.includes('taskTypeId')) {
          this.db.run(`ALTER TABLE tasks ADD COLUMN taskTypeId INTEGER`, (err) => {
            if (err) {
              console.error('Error adding taskTypeId column:', err);
            } else {
              console.log('Added taskTypeId column to tasks table');
            }
          });
        }
        
        if (!columnNames.includes('assignedToUserId')) {
          this.db.run(`ALTER TABLE tasks ADD COLUMN assignedToUserId INTEGER`, (err) => {
            if (err) {
              console.error('Error adding assignedToUserId column:', err);
            } else {
              console.log('Added assignedToUserId column to tasks table');
            }
          });
        }
      });

      // Create or update tasks table
      this.db.run(`
        CREATE TABLE IF NOT EXISTS tasks (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          title TEXT NOT NULL,
          description TEXT NOT NULL,
          status TEXT NOT NULL DEFAULT 'To Do',
          priority TEXT NOT NULL,
          taskTypeId INTEGER,
          assignedToUserId INTEGER,
          dueDate TEXT,
          createdAt TEXT NOT NULL,
          updatedAt TEXT NOT NULL
        )
      `);
    });
  }

  async create(data: CreateTaskDto): Promise<Task> {
    return new Promise((resolve, reject) => {
      const now = new Date().toISOString();
      const status = data.status || TaskStatus.TODO;
      const sql = `
        INSERT INTO tasks (title, description, status, priority, taskTypeId, assignedToUserId, dueDate, createdAt, updatedAt)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;
      const db = this.db;
      this.db.run(
        sql,
        [
          data.title,
          data.description,
          status,
          data.priority,
          data.taskTypeId || null,
          data.assignedToUserId || null,
          data.dueDate || null,
          now,
          now,
        ],
        function (err) {
          if (err) {
            reject(err);
            return;
          }
          const taskId = this.lastID;
          db.get('SELECT * FROM tasks WHERE id = ?', [taskId], (err, row) => {
            if (err) {
              reject(err);
              return;
            }
            resolve(row as Task);
          });
        }
      );
    });
  }

  async findAll(filters?: TaskQueryParams): Promise<Task[]> {
    return new Promise((resolve, reject) => {
      let sql = 'SELECT * FROM tasks WHERE 1=1';
      const params: any[] = [];

      if (filters?.status) {
        sql += ' AND status = ?';
        params.push(filters.status);
      }

      if (filters?.priority) {
        sql += ' AND priority = ?';
        params.push(filters.priority);
      }

      if (filters?.date) {
        sql += ' AND DATE(dueDate) = DATE(?)';
        params.push(filters.date);
      }

      sql += ' ORDER BY createdAt DESC';

      this.db.all(sql, params, (err, rows) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(rows as Task[]);
      });
    });
  }

  async findById(id: number): Promise<Task | null> {
    return new Promise((resolve, reject) => {
      this.db.get('SELECT * FROM tasks WHERE id = ?', [id], (err, row) => {
        if (err) {
          reject(err);
          return;
        }
        resolve((row as Task) || null);
      });
    });
  }

  async update(id: number, data: UpdateTaskDto): Promise<Task | null> {
    return new Promise((resolve, reject) => {
      const updates: string[] = [];
      const params: any[] = [];

      if (data.title !== undefined) {
        updates.push('title = ?');
        params.push(data.title);
      }
      if (data.description !== undefined) {
        updates.push('description = ?');
        params.push(data.description);
      }
      if (data.status !== undefined) {
        updates.push('status = ?');
        params.push(data.status);
      }
      if (data.priority !== undefined) {
        updates.push('priority = ?');
        params.push(data.priority);
      }
      if (data.taskTypeId !== undefined) {
        updates.push('taskTypeId = ?');
        params.push(data.taskTypeId);
      }
      if (data.assignedToUserId !== undefined) {
        updates.push('assignedToUserId = ?');
        params.push(data.assignedToUserId);
      }
      if (data.dueDate !== undefined) {
        updates.push('dueDate = ?');
        params.push(data.dueDate);
      }

      if (updates.length === 0) {
        this.findById(id).then(resolve).catch(reject);
        return;
      }

      updates.push('updatedAt = ?');
      params.push(new Date().toISOString());
      params.push(id);

      const sql = `UPDATE tasks SET ${updates.join(', ')} WHERE id = ?`;
      const db = this.db;

      this.db.run(sql, params, function (err) {
        if (err) {
          reject(err);
          return;
        }
        db.get('SELECT * FROM tasks WHERE id = ?', [id], (err, row) => {
          if (err) {
            reject(err);
            return;
          }
          resolve((row as Task) || null);
        });
      });
    });
  }

  async delete(id: number): Promise<boolean> {
    return new Promise((resolve, reject) => {
      this.db.run('DELETE FROM tasks WHERE id = ?', [id], function (err) {
        if (err) {
          reject(err);
          return;
        }
        resolve(this.changes > 0);
      });
    });
  }
}

