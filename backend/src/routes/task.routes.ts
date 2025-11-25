import { Router } from 'express';
import { TaskController } from '../controllers/task.controller';
import { validateBody, validateQuery } from '../middleware/validation.middleware';
import { createTaskSchema, updateTaskSchema, queryParamsSchema } from '../validators/task.validator';

export const createTaskRoutes = (taskController: TaskController): Router => {
  const router = Router();

  router.post('/', validateBody(createTaskSchema), taskController.createTask);
  router.get('/', validateQuery(queryParamsSchema), taskController.getTasks);
  router.get('/:id', taskController.getTaskById);
  router.put('/:id', validateBody(updateTaskSchema), taskController.updateTask);
  router.delete('/:id', taskController.deleteTask);

  return router;
};

