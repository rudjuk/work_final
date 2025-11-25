import { Router } from 'express';
import { TaskTypeController } from '../controllers/task-type.controller';
import { validateBody } from '../middleware/validation.middleware';
import { createTaskTypeSchema, updateTaskTypeSchema } from '../validators/task-type.validator';

export const createTaskTypeRoutes = (taskTypeController: TaskTypeController): Router => {
  const router = Router();

  router.post('/', validateBody(createTaskTypeSchema), taskTypeController.createTaskType);
  router.get('/', taskTypeController.getTaskTypes);
  router.get('/:id', taskTypeController.getTaskTypeById);
  router.put('/:id', validateBody(updateTaskTypeSchema), taskTypeController.updateTaskType);
  router.delete('/:id', taskTypeController.deleteTaskType);

  return router;
};

