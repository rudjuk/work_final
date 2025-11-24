import request from 'supertest';
import express, { Express } from 'express';
import cors from 'cors';
import morgan from 'morgan';
import taskRoutes from '../routes/task.routes.js';
import { User } from '../models/index.js';

describe('Tasks API Integration Tests', () => {
  let app: Express;

  beforeAll(() => {
    app = express();
    app.use(cors());
    app.use(morgan('combined'));
    app.use(express.json());
    app.use('/', taskRoutes);
  });

  describe('GET /tasks', () => {
    it('should return 200 and empty array when no tasks exist', async () => {
      const response = await request(app).get('/tasks');
      expect(response.status).toBe(200);
      expect(response.body).toEqual([]);
    });

    it('should return 200 and all tasks with correct structure', async () => {
      const user = await User.create({
        name: 'Test User',
        email: 'test@example.com',
      });

      const taskData1 = {
        title: 'Test Task 1',
        description: 'Description 1',
        status: 'todo',
        priority: 'high',
        deadline: null,
        assigneeId: user.id,
      };

      const taskData2 = {
        title: 'Test Task 2',
        description: 'Description 2',
        status: 'in-progress',
        priority: 'normal',
        deadline: null,
        assigneeId: null,
      };

      await request(app).post('/tasks').send(taskData1);
      await request(app).post('/tasks').send(taskData2);

      const response = await request(app).get('/tasks');
      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(2);

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const task1 = response.body.find((t: any) => t.title === 'Test Task 1');
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const task2 = response.body.find((t: any) => t.title === 'Test Task 2');

      expect(task1).toHaveProperty('id');
      expect(task1).toHaveProperty('title', 'Test Task 1');
      expect(task1).toHaveProperty('description', 'Description 1');
      expect(task1).toHaveProperty('status', 'todo');
      expect(task1).toHaveProperty('priority', 'high');
      expect(task1).toHaveProperty('assigneeId', user.id);
      expect(task1).toHaveProperty('assignee');
      expect(task1.assignee).toHaveProperty('id', user.id);
      expect(task1.assignee).toHaveProperty('name', 'Test User');

      expect(task2).toHaveProperty('assigneeId', null);
      expect(task2.assignee).toBeNull();
    });

    it('should filter tasks by status', async () => {
      const taskData1 = {
        title: 'Todo Task',
        description: 'Description',
        status: 'todo',
        priority: 'normal',
        deadline: null,
      };

      const taskData2 = {
        title: 'Done Task',
        description: 'Description',
        status: 'done',
        priority: 'normal',
        deadline: null,
      };

      await request(app).post('/tasks').send(taskData1);
      await request(app).post('/tasks').send(taskData2);

      const response = await request(app).get('/tasks?status=todo');
      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(1);
      expect(response.body[0].status).toBe('todo');
      expect(response.body[0].title).toBe('Todo Task');
    });

    it('should filter tasks by review status', async () => {
      const taskData1 = {
        title: 'Review Task',
        description: 'Description',
        status: 'review',
        priority: 'normal',
        deadline: null,
      };

      const taskData2 = {
        title: 'Done Task',
        description: 'Description',
        status: 'done',
        priority: 'normal',
        deadline: null,
      };

      await request(app).post('/tasks').send(taskData1);
      await request(app).post('/tasks').send(taskData2);

      const response = await request(app).get('/tasks?status=review');
      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(1);
      expect(response.body[0].status).toBe('review');
      expect(response.body[0].title).toBe('Review Task');
    });

    it('should filter tasks by priority', async () => {
      const taskData1 = {
        title: 'High Priority Task',
        description: 'Description',
        status: 'todo',
        priority: 'high',
        deadline: null,
      };

      const taskData2 = {
        title: 'Low Priority Task',
        description: 'Description',
        status: 'todo',
        priority: 'low',
        deadline: null,
      };

      await request(app).post('/tasks').send(taskData1);
      await request(app).post('/tasks').send(taskData2);

      const response = await request(app).get('/tasks?priority=high');
      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(1);
      expect(response.body[0].priority).toBe('high');
      expect(response.body[0].title).toBe('High Priority Task');
    });

    it('should filter tasks by multiple query parameters', async () => {
      const taskData1 = {
        title: 'High Todo Task',
        description: 'Description',
        status: 'todo',
        priority: 'high',
        deadline: null,
      };

      const taskData2 = {
        title: 'High Done Task',
        description: 'Description',
        status: 'done',
        priority: 'high',
        deadline: null,
      };

      const taskData3 = {
        title: 'Low Todo Task',
        description: 'Description',
        status: 'todo',
        priority: 'low',
        deadline: null,
      };

      await request(app).post('/tasks').send(taskData1);
      await request(app).post('/tasks').send(taskData2);
      await request(app).post('/tasks').send(taskData3);

      const response = await request(app).get('/tasks?status=todo&priority=high');
      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(1);
      expect(response.body[0].status).toBe('todo');
      expect(response.body[0].priority).toBe('high');
      expect(response.body[0].title).toBe('High Todo Task');
    });

    it('should return 400 for invalid status query parameter', async () => {
      const response = await request(app).get('/tasks?status=invalid');
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toBe('Validation error');
    });

    it('should return 400 for invalid priority query parameter', async () => {
      const response = await request(app).get('/tasks?priority=invalid');
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toBe('Validation error');
    });
  });

  describe('GET /tasks/:id', () => {
    it('should return 200 and task details when task exists', async () => {
      const user = await User.create({
        name: 'Test User',
        email: 'test@example.com',
      });

      const taskData = {
        title: 'Test Task',
        description: 'Test Description',
        status: 'todo',
        priority: 'high',
        deadline: '2024-12-31',
        assigneeId: user.id,
      };

      const createResponse = await request(app).post('/tasks').send(taskData);
      const taskId = createResponse.body.id;

      const response = await request(app).get(`/tasks/${taskId}`);
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('id', taskId);
      expect(response.body).toHaveProperty('title', 'Test Task');
      expect(response.body).toHaveProperty('description', 'Test Description');
      expect(response.body).toHaveProperty('status', 'todo');
      expect(response.body).toHaveProperty('priority', 'high');
      expect(response.body).toHaveProperty('deadline', '2024-12-31');
      expect(response.body).toHaveProperty('assigneeId', user.id);
      expect(response.body).toHaveProperty('assignee');
      expect(response.body.assignee).toHaveProperty('id', user.id);
      expect(response.body.assignee).toHaveProperty('name', 'Test User');
      expect(response.body.assignee).toHaveProperty('email', 'test@example.com');
      expect(response.body).toHaveProperty('createdAt');
    });

    it('should return task without assignee when assigneeId is null', async () => {
      const taskData = {
        title: 'Unassigned Task',
        description: 'Description',
        status: 'todo',
        priority: 'normal',
        deadline: null,
        assigneeId: null,
      };

      const createResponse = await request(app).post('/tasks').send(taskData);
      const taskId = createResponse.body.id;

      const response = await request(app).get(`/tasks/${taskId}`);
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('assigneeId', null);
      expect(response.body.assignee).toBeNull();
    });

    it('should return 404 when task does not exist', async () => {
      const response = await request(app).get('/tasks/99999');
      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error', 'Task not found');
    });

    it('should return 404 for invalid id format', async () => {
      const response = await request(app).get('/tasks/invalid-id');
      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error', 'Task not found');
    });

    it('should return 404 for negative id', async () => {
      const response = await request(app).get('/tasks/-1');
      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error', 'Task not found');
    });
  });

  describe('POST /tasks', () => {
    it('should return 201 and create a new task', async () => {
      const taskData = {
        title: 'New Task',
        description: 'New Description',
        status: 'todo',
        priority: 'normal',
        deadline: null,
      };

      const response = await request(app).post('/tasks').send(taskData);
      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('title', 'New Task');
      expect(response.body).toHaveProperty('description', 'New Description');
      expect(response.body).toHaveProperty('status', 'todo');
      expect(response.body).toHaveProperty('priority', 'normal');
      expect(response.body).toHaveProperty('deadline', null);
      expect(response.body).toHaveProperty('createdAt');
      expect(response.body).toHaveProperty('assigneeId', null);
      expect(response.body.assignee).toBeNull();
    });

    it('should create task with assignee', async () => {
      const user = await User.create({
        name: 'Assignee User',
        email: 'assignee@example.com',
      });

      const taskData = {
        title: 'Assigned Task',
        description: 'Description',
        status: 'in-progress',
        priority: 'high',
        deadline: null,
        assigneeId: user.id,
      };

      const response = await request(app).post('/tasks').send(taskData);
      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('assigneeId', user.id);
      expect(response.body).toHaveProperty('assignee');
      expect(response.body.assignee).toHaveProperty('id', user.id);
      expect(response.body.assignee).toHaveProperty('name', 'Assignee User');
      expect(response.body.assignee).toHaveProperty('email', 'assignee@example.com');
    });

    it('should create task with deadline', async () => {
      const taskData = {
        title: 'Task with Deadline',
        description: 'Description',
        status: 'todo',
        priority: 'normal',
        deadline: '2025-12-31',
      };

      const response = await request(app).post('/tasks').send(taskData);
      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('deadline', '2025-12-31');
    });

    it('should return 400 when title is missing', async () => {
      const taskData = {
        description: 'Description',
        status: 'todo',
        priority: 'normal',
        deadline: null,
      };

      const response = await request(app).post('/tasks').send(taskData);
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error', 'Validation error');
    });

    it('should return 400 when description is missing', async () => {
      const taskData = {
        title: 'Title',
        status: 'todo',
        priority: 'normal',
        deadline: null,
      };

      const response = await request(app).post('/tasks').send(taskData);
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error', 'Validation error');
    });

    it('should return 400 when status is invalid', async () => {
      const taskData = {
        title: 'Title',
        description: 'Description',
        status: 'invalid-status',
        priority: 'normal',
        deadline: null,
      };

      const response = await request(app).post('/tasks').send(taskData);
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error', 'Validation error');
    });

    it('should return 400 when priority is invalid', async () => {
      const taskData = {
        title: 'Title',
        description: 'Description',
        status: 'todo',
        priority: 'invalid-priority',
        deadline: null,
      };

      const response = await request(app).post('/tasks').send(taskData);
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error', 'Validation error');
    });

    it('should return 400 when title is empty string', async () => {
      const taskData = {
        title: '',
        description: 'Description',
        status: 'todo',
        priority: 'normal',
        deadline: null,
      };

      const response = await request(app).post('/tasks').send(taskData);
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error', 'Validation error');
    });

    it('should return 400 when description is empty string', async () => {
      const taskData = {
        title: 'Title',
        description: '',
        status: 'todo',
        priority: 'normal',
        deadline: null,
      };

      const response = await request(app).post('/tasks').send(taskData);
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error', 'Validation error');
    });

    it('should accept null deadline', async () => {
      const taskData = {
        title: 'Task',
        description: 'Description',
        status: 'todo',
        priority: 'normal',
        deadline: null,
      };

      const response = await request(app).post('/tasks').send(taskData);
      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('deadline', null);
    });
  });

  describe('PUT /tasks/:id', () => {
    it('should return 200 and update task', async () => {
      const taskData = {
        title: 'Original Title',
        description: 'Original Description',
        status: 'todo',
        priority: 'normal',
        deadline: null,
      };

      const createResponse = await request(app).post('/tasks').send(taskData);
      const taskId = createResponse.body.id;

      const updateData = {
        title: 'Updated Title',
        description: 'Updated Description',
        status: 'in-progress',
        priority: 'high',
      };

      const response = await request(app).put(`/tasks/${taskId}`).send(updateData);
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('title', 'Updated Title');
      expect(response.body).toHaveProperty('description', 'Updated Description');
      expect(response.body).toHaveProperty('status', 'in-progress');
      expect(response.body).toHaveProperty('priority', 'high');
    });

    it('should update only provided fields', async () => {
      const taskData = {
        title: 'Original Title',
        description: 'Original Description',
        status: 'todo',
        priority: 'normal',
        deadline: null,
      };

      const createResponse = await request(app).post('/tasks').send(taskData);
      const taskId = createResponse.body.id;

      const updateData = {
        title: 'Updated Title',
      };

      const response = await request(app).put(`/tasks/${taskId}`).send(updateData);
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('title', 'Updated Title');
      expect(response.body).toHaveProperty('description', 'Original Description');
      expect(response.body).toHaveProperty('status', 'todo');
      expect(response.body).toHaveProperty('priority', 'normal');
    });

    it('should update task status to review', async () => {
      const taskData = {
        title: 'Task',
        description: 'Description',
        status: 'todo',
        priority: 'normal',
        deadline: null,
      };

      const createResponse = await request(app).post('/tasks').send(taskData);
      const taskId = createResponse.body.id;

      const updateData = {
        status: 'review',
      };

      const response = await request(app).put(`/tasks/${taskId}`).send(updateData);
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('status', 'review');
    });

    it('should update assignee', async () => {
      const user1 = await User.create({
        name: 'User 1',
        email: 'user1@example.com',
      });

      const user2 = await User.create({
        name: 'User 2',
        email: 'user2@example.com',
      });

      const taskData = {
        title: 'Task',
        description: 'Description',
        status: 'todo',
        priority: 'normal',
        deadline: null,
        assigneeId: user1.id,
      };

      const createResponse = await request(app).post('/tasks').send(taskData);
      const taskId = createResponse.body.id;

      const updateData = {
        assigneeId: user2.id,
      };

      const response = await request(app).put(`/tasks/${taskId}`).send(updateData);
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('assigneeId', user2.id);
      expect(response.body.assignee).toHaveProperty('id', user2.id);
      expect(response.body.assignee).toHaveProperty('name', 'User 2');
    });

    it('should remove assignee when assigneeId is set to null', async () => {
      const user = await User.create({
        name: 'User',
        email: 'user@example.com',
      });

      const taskData = {
        title: 'Task',
        description: 'Description',
        status: 'todo',
        priority: 'normal',
        deadline: null,
        assigneeId: user.id,
      };

      const createResponse = await request(app).post('/tasks').send(taskData);
      const taskId = createResponse.body.id;

      const updateData = {
        assigneeId: null,
      };

      const response = await request(app).put(`/tasks/${taskId}`).send(updateData);
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('assigneeId', null);
      expect(response.body.assignee).toBeNull();
    });

    it('should update deadline', async () => {
      const taskData = {
        title: 'Task',
        description: 'Description',
        status: 'todo',
        priority: 'normal',
        deadline: null,
      };

      const createResponse = await request(app).post('/tasks').send(taskData);
      const taskId = createResponse.body.id;

      const updateData = {
        deadline: '2025-12-31',
      };

      const response = await request(app).put(`/tasks/${taskId}`).send(updateData);
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('deadline', '2025-12-31');
    });

    it('should return 404 when task does not exist', async () => {
      const updateData = {
        title: 'Updated Title',
      };

      const response = await request(app).put('/tasks/99999').send(updateData);
      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error', 'Task not found');
    });

    it('should return 400 when title is empty string', async () => {
      const taskData = {
        title: 'Original Title',
        description: 'Description',
        status: 'todo',
        priority: 'normal',
        deadline: null,
      };

      const createResponse = await request(app).post('/tasks').send(taskData);
      const taskId = createResponse.body.id;

      const updateData = {
        title: '',
      };

      const response = await request(app).put(`/tasks/${taskId}`).send(updateData);
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error', 'Validation error');
    });

    it('should return 400 when status is invalid', async () => {
      const taskData = {
        title: 'Title',
        description: 'Description',
        status: 'todo',
        priority: 'normal',
        deadline: null,
      };

      const createResponse = await request(app).post('/tasks').send(taskData);
      const taskId = createResponse.body.id;

      const updateData = {
        status: 'invalid-status',
      };

      const response = await request(app).put(`/tasks/${taskId}`).send(updateData);
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error', 'Validation error');
    });

    it('should return 400 when priority is invalid', async () => {
      const taskData = {
        title: 'Title',
        description: 'Description',
        status: 'todo',
        priority: 'normal',
        deadline: null,
      };

      const createResponse = await request(app).post('/tasks').send(taskData);
      const taskId = createResponse.body.id;

      const updateData = {
        priority: 'invalid-priority',
      };

      const response = await request(app).put(`/tasks/${taskId}`).send(updateData);
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error', 'Validation error');
    });
  });

  describe('DELETE /tasks/:id', () => {
    it('should return 200 and delete task', async () => {
      const taskData = {
        title: 'Task to Delete',
        description: 'Description',
        status: 'todo',
        priority: 'normal',
        deadline: null,
      };

      const createResponse = await request(app).post('/tasks').send(taskData);
      const taskId = createResponse.body.id;

      const response = await request(app).delete(`/tasks/${taskId}`);
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message', 'Task deleted successfully');

      const getResponse = await request(app).get(`/tasks/${taskId}`);
      expect(getResponse.status).toBe(404);
    });

    it('should delete task with assignee', async () => {
      const user = await User.create({
        name: 'User',
        email: 'user@example.com',
      });

      const taskData = {
        title: 'Task to Delete',
        description: 'Description',
        status: 'todo',
        priority: 'normal',
        deadline: null,
        assigneeId: user.id,
      };

      const createResponse = await request(app).post('/tasks').send(taskData);
      const taskId = createResponse.body.id;

      const response = await request(app).delete(`/tasks/${taskId}`);
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message', 'Task deleted successfully');

      const getResponse = await request(app).get(`/tasks/${taskId}`);
      expect(getResponse.status).toBe(404);
    });

    it('should return 404 when task does not exist', async () => {
      const response = await request(app).delete('/tasks/99999');
      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error', 'Task not found');
    });

    it('should return 404 for invalid id format', async () => {
      const response = await request(app).delete('/tasks/invalid-id');
      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error', 'Task not found');
    });

    it('should return 404 for negative id', async () => {
      const response = await request(app).delete('/tasks/-1');
      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error', 'Task not found');
    });
  });
});
