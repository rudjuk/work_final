import { Request, Response, NextFunction } from 'express';
import { TaskTypeService } from '../services/task-type.service';
import { CreateTaskTypeDto, UpdateTaskTypeDto } from '../types/task-type.types';

export class TaskTypeController {
  constructor(private taskTypeService: TaskTypeService) {}

  createTaskType = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const data: CreateTaskTypeDto = req.body;
      const taskType = await this.taskTypeService.createTaskType(data);
      res.status(201).json(taskType);
    } catch (error) {
      next(error);
    }
  };

  getTaskTypes = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const taskTypes = await this.taskTypeService.getTaskTypes();
      res.status(200).json(taskTypes);
    } catch (error) {
      next(error);
    }
  };

  getTaskTypeById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        res.status(400).json({ error: 'Invalid task type ID' });
        return;
      }

      const taskType = await this.taskTypeService.getTaskTypeById(id);
      if (!taskType) {
        res.status(404).json({ error: 'Task type not found' });
        return;
      }

      res.status(200).json(taskType);
    } catch (error) {
      next(error);
    }
  };

  updateTaskType = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        res.status(400).json({ error: 'Invalid task type ID' });
        return;
      }

      const data: UpdateTaskTypeDto = req.body;
      const taskType = await this.taskTypeService.updateTaskType(id, data);

      if (!taskType) {
        res.status(404).json({ error: 'Task type not found' });
        return;
      }

      res.status(200).json(taskType);
    } catch (error) {
      next(error);
    }
  };

  deleteTaskType = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        res.status(400).json({ error: 'Invalid task type ID' });
        return;
      }

      const deleted = await this.taskTypeService.deleteTaskType(id);
      if (!deleted) {
        res.status(404).json({ error: 'Task type not found' });
        return;
      }

      res.status(200).json({ message: 'Task type deleted successfully' });
    } catch (error) {
      next(error);
    }
  };
}

