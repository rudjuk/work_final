import request from 'supertest';
import express, { Express } from 'express';
import cors from 'cors';
import { createDatabase } from '../database/database';
import { TaskModel } from '../models/task.model';
import { TaskService } from '../services/task.service';
import { TaskController } from '../controllers/task.controller';
import { createTaskRoutes } from '../routes/task.routes';
import { errorHandler } from '../middleware/error.middleware';
import { TaskStatus, TaskPriority } from '../types/task.types';

describe('Task Controller Tests', () => {
  let app: Express;
  let db: any;

  beforeAll((done) => {
    // Create in-memory database for testing
    db = createDatabase(':memory:');
    const taskModel = new TaskModel(db);
    
    // Wait for table initialization (db.serialize is async)
    // Use a longer timeout to ensure all table creation is complete
    setTimeout(() => {
      const taskService = new TaskService(taskModel);
      const taskController = new TaskController(taskService);

      app = express();
      app.use(cors());
      app.use(express.json());
      app.use('/api/tasks', createTaskRoutes(taskController));
      app.use(errorHandler);
      done();
    }, 200);
  });

  afterAll((done) => {
    db.close(done);
  });

  describe('POST /api/tasks', () => {
    it('should create a task successfully (200)', async () => {
      const taskData = {
        title: 'Test Task',
        description: 'Test Description',
        priority: TaskPriority.MEDIUM,
      };

      const response = await request(app).post('/api/tasks').send(taskData);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body.title).toBe(taskData.title);
      expect(response.body.description).toBe(taskData.description);
      expect(response.body.priority).toBe(taskData.priority);
      expect(response.body.status).toBe(TaskStatus.TODO);
    });

    it('should return 400 for invalid data', async () => {
      const invalidData = {
        title: '',
        description: 'Test',
        priority: 'Invalid',
      };

      const response = await request(app).post('/api/tasks').send(invalidData);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('GET /api/tasks', () => {
    it('should get all tasks successfully (200)', async () => {
      const response = await request(app).get('/api/tasks');

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });

    it('should filter tasks by status (200)', async () => {
      const response = await request(app).get(`/api/tasks?status=${TaskStatus.TODO}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });

    it('should filter tasks by priority (200)', async () => {
      const response = await request(app).get(`/api/tasks?priority=${TaskPriority.HIGH}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });

    it('should filter tasks by date (200)', async () => {
      const date = '2024-12-31';
      const response = await request(app).get(`/api/tasks?date=${date}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });

    it('should return 400 for invalid query params', async () => {
      const response = await request(app).get('/api/tasks?status=InvalidStatus');

      expect(response.status).toBe(400);
    });
  });

  describe('GET /api/tasks/:id', () => {
    it('should get a task by id successfully (200)', async () => {
      // First create a task
      const createResponse = await request(app).post('/api/tasks').send({
        title: 'Get Test Task',
        description: 'Test',
        priority: TaskPriority.LOW,
      });

      const taskId = createResponse.body.id;

      const response = await request(app).get(`/api/tasks/${taskId}`);

      expect(response.status).toBe(200);
      expect(response.body.id).toBe(taskId);
    });

    it('should return 404 for non-existent task', async () => {
      const response = await request(app).get('/api/tasks/99999');

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error');
    });

    it('should return 400 for invalid id', async () => {
      const response = await request(app).get('/api/tasks/invalid');

      expect(response.status).toBe(400);
    });
  });

  describe('PUT /api/tasks/:id', () => {
    it('should update a task successfully (200)', async () => {
      // First create a task
      const createResponse = await request(app).post('/api/tasks').send({
        title: 'Update Test Task',
        description: 'Test',
        priority: TaskPriority.LOW,
      });

      const taskId = createResponse.body.id;

      const updateData = {
        title: 'Updated Title',
        status: TaskStatus.IN_PROGRESS,
      };

      const response = await request(app).put(`/api/tasks/${taskId}`).send(updateData);

      expect(response.status).toBe(200);
      expect(response.body.title).toBe(updateData.title);
      expect(response.body.status).toBe(updateData.status);
    });

    it('should return 404 for non-existent task', async () => {
      const response = await request(app).put('/api/tasks/99999').send({
        title: 'Updated',
      });

      expect(response.status).toBe(404);
    });

    it('should return 400 for invalid data', async () => {
      const createResponse = await request(app).post('/api/tasks').send({
        title: 'Test',
        description: 'Test',
        priority: TaskPriority.MEDIUM,
      });

      const taskId = createResponse.body.id;

      const response = await request(app).put(`/api/tasks/${taskId}`).send({
        title: '',
      });

      expect(response.status).toBe(400);
    });
  });

  describe('DELETE /api/tasks/:id', () => {
    it('should delete a task successfully (200)', async () => {
      // First create a task
      const createResponse = await request(app).post('/api/tasks').send({
        title: 'Delete Test Task',
        description: 'Test',
        priority: TaskPriority.HIGH,
      });

      const taskId = createResponse.body.id;

      const response = await request(app).delete(`/api/tasks/${taskId}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message');
    });

    it('should return 404 for non-existent task', async () => {
      const response = await request(app).delete('/api/tasks/99999');

      expect(response.status).toBe(404);
    });

    it('should return 400 for invalid id', async () => {
      const response = await request(app).delete('/api/tasks/invalid');

      expect(response.status).toBe(400);
    });
  });
});

