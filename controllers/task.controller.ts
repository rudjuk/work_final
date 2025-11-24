import { Request, Response } from 'express';
import { taskService } from '../services/task.service.js';
import { TaskQueryParams } from '../types/task.types.js';

export const getAllTasks = async (req: Request, res: Response): Promise<void> => {
  try {
    const queryParams: TaskQueryParams = {};

    if (req.query.createdAt) {
      queryParams.createdAt = req.query.createdAt as string;
    }
    if (req.query.status) {
      queryParams.status = req.query.status as 'todo' | 'in-progress' | 'review' | 'done';
    }
    if (req.query.priority) {
      queryParams.priority = req.query.priority as 'low' | 'normal' | 'high';
    }

    const tasks = await taskService.getAllTasks(
      Object.keys(queryParams).length > 0 ? queryParams : undefined
    );
    res.status(200).json(tasks);
  } catch {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getTaskById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const task = await taskService.getTaskById(id);

    if (!task) {
      res.status(404).json({ error: 'Task not found' });
      return;
    }

    res.status(200).json(task);
  } catch {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const createTask = async (req: Request, res: Response): Promise<void> => {
  try {
    const task = await taskService.createTask(req.body);
    res.status(201).json(task);
  } catch (error) {
    console.error('Error creating task:', error);
    if (error instanceof Error) {
      res.status(500).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
};

export const updateTask = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const updatedTask = await taskService.updateTask(id, req.body);

    if (!updatedTask) {
      res.status(404).json({ error: 'Task not found' });
      return;
    }

    res.status(200).json(updatedTask);
  } catch {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const deleteTask = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const deleted = await taskService.deleteTask(id);

    if (!deleted) {
      res.status(404).json({ error: 'Task not found' });
      return;
    }

    res.status(200).json({ message: 'Task deleted successfully' });
  } catch {
    res.status(500).json({ error: 'Internal server error' });
  }
};
