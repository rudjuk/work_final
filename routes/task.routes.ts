import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import {
  getAllTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
} from '../controllers/task.controller.js';

const router = Router();

const createTaskSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  status: z.enum(['todo', 'in-progress', 'review', 'done']),
  priority: z.enum(['low', 'normal', 'high']),
  deadline: z.string().nullable(),
  assigneeId: z.number().int().positive().nullable().optional(),
});

const updateTaskSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().min(1).optional(),
  status: z.enum(['todo', 'in-progress', 'review', 'done']).optional(),
  priority: z.enum(['low', 'normal', 'high']).optional(),
  deadline: z.string().nullable().optional(),
  assigneeId: z.number().int().positive().nullable().optional(),
});

const queryParamsSchema = z.object({
  createdAt: z.string().optional(),
  status: z.enum(['todo', 'in-progress', 'review', 'done']).optional(),
  priority: z.enum(['low', 'normal', 'high']).optional(),
});

const validateBody = (schema: z.ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({
          error: 'Validation error',
          details: error.errors,
        });
        return;
      }
      res.status(400).json({ error: 'Invalid request body' });
    }
  };
};

const validateQuery = (req: Request, res: Response, next: NextFunction) => {
  try {
    queryParamsSchema.parse(req.query);
    next();
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({
        error: 'Validation error',
        details: error.errors,
      });
      return;
    }
    res.status(400).json({ error: 'Invalid query parameters' });
  }
};

router.get('/tasks', validateQuery, getAllTasks);
router.get('/tasks/:id', getTaskById);
router.post('/tasks', validateBody(createTaskSchema), createTask);
router.put('/tasks/:id', validateBody(updateTaskSchema), updateTask);
router.delete('/tasks/:id', deleteTask);

export default router;
