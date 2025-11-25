import { z } from 'zod';
import { TaskStatus, TaskPriority } from '../types/task.types';

const dueDateSchema = z.preprocess(
  (val) => {
    // Convert empty string, null, or undefined to null
    if (val === '' || val === null || val === undefined) {
      return null;
    }
    return val;
  },
  z.union([z.string(), z.null()]).optional()
);

export const createTaskSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title must be less than 200 characters'),
  description: z
    .string()
    .min(1, 'Description is required')
    .max(1000, 'Description must be less than 1000 characters'),
  status: z.nativeEnum(TaskStatus).optional(),
  priority: z.nativeEnum(TaskPriority, {
    errorMap: () => ({ message: 'Priority must be Low, Medium, or High' }),
  }),
  taskTypeId: z.number().int().positive().nullable().optional(),
  assignedToUserId: z.number().int().positive().nullable().optional(),
  dueDate: dueDateSchema,
});

export const updateTaskSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title must be less than 200 characters').optional(),
  description: z
    .string()
    .min(1, 'Description is required')
    .max(1000, 'Description must be less than 1000 characters')
    .optional(),
  status: z.nativeEnum(TaskStatus).optional(),
  priority: z.nativeEnum(TaskPriority).optional(),
  taskTypeId: z.number().int().positive().nullable().optional(),
  assignedToUserId: z.number().int().positive().nullable().optional(),
  dueDate: dueDateSchema,
});

export const queryParamsSchema = z.object({
  status: z.nativeEnum(TaskStatus).optional(),
  priority: z.nativeEnum(TaskPriority).optional(),
  date: z.string().optional(),
});

