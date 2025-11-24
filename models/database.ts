import { Sequelize } from 'sequelize';

const dbPath = process.env.DB_PATH || './database.sqlite';
const testDbPath = process.env.TEST_DB_PATH || './test-database.sqlite';

const isTest = process.env.NODE_ENV === 'test';
const databasePath = isTest ? testDbPath : dbPath;

export const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: databasePath,
  logging: process.env.NODE_ENV === 'development' ? console.log : false,
});
