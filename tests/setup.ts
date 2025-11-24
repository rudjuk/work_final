import { sequelize, Task, User } from '../models/index.js';
import * as fs from 'fs';
import * as path from 'path';

const testDbPath = path.resolve(process.cwd(), 'test-database.sqlite');

beforeAll(async () => {
  process.env.NODE_ENV = 'test';
  process.env.TEST_DB_PATH = testDbPath;

  if (fs.existsSync(testDbPath)) {
    fs.unlinkSync(testDbPath);
  }

  // Важливо: спочатку аутентифікуємося, потім синхронізуємо моделі
  await sequelize.authenticate();

  // Синхронізуємо всі моделі з force: true для створення таблиць
  await sequelize.sync({ force: true });

  // Перевіряємо, що таблиці створені

  const [results] = await sequelize.query("SELECT name FROM sqlite_master WHERE type='table'");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const tableNames = (results as any[]).map((r: any) => r.name);
  if (!tableNames.includes('tasks') || !tableNames.includes('users')) {
    throw new Error(`Tables not created. Found: ${tableNames.join(', ')}`);
  }
});

afterAll(async () => {
  await Task.destroy({ where: {}, truncate: true, cascade: true });
  await User.destroy({ where: {}, truncate: true, cascade: true });
  await sequelize.close();

  if (fs.existsSync(testDbPath)) {
    fs.unlinkSync(testDbPath);
  }
});

beforeEach(async () => {
  await Task.destroy({ where: {}, truncate: true, cascade: true });
  await User.destroy({ where: {}, truncate: true, cascade: true });
});
