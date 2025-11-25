import express, { Express } from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { createDatabase } from './database/database';
import { TaskModel } from './models/task.model';
import { TaskService } from './services/task.service';
import { TaskController } from './controllers/task.controller';
import { createTaskRoutes } from './routes/task.routes';
import { TaskTypeModel } from './models/task-type.model';
import { TaskTypeService } from './services/task-type.service';
import { TaskTypeController } from './controllers/task-type.controller';
import { createTaskTypeRoutes } from './routes/task-type.routes';
import { UserModel } from './models/user.model';
import { UserService } from './services/user.service';
import { UserController } from './controllers/user.controller';
import { createUserRoutes } from './routes/user.routes';
import { errorHandler } from './middleware/error.middleware';

dotenv.config();

const app: Express = express();
const PORT = process.env.PORT || 3001;
const DB_PATH = process.env.DB_PATH || './tasks.db';

// Database setup
const db = createDatabase(DB_PATH);
const taskModel = new TaskModel(db);
const taskService = new TaskService(taskModel);
const taskController = new TaskController(taskService);
const taskTypeModel = new TaskTypeModel(db);
const taskTypeService = new TaskTypeService(taskTypeModel);
const taskTypeController = new TaskTypeController(taskTypeService);
const userModel = new UserModel(db);
const userService = new UserService(userModel);
const userController = new UserController(userService);

// Middleware
app.use(cors());
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}
app.use(express.json());

// Routes
app.use('/api/tasks', createTaskRoutes(taskController));
app.use('/api/task-types', createTaskTypeRoutes(taskTypeController));
app.use('/api/users', createUserRoutes(userController));

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Error handling
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  db.close((err) => {
    if (err) {
      console.error('Error closing database:', err);
    } else {
      console.log('Database connection closed');
    }
    process.exit(0);
  });
});

