import {
  Task as TaskType,
  CreateTaskDto,
  UpdateTaskDto,
  TaskQueryParams,
} from '../types/task.types.js';
import { Task, User } from '../models/index.js';
import { Op } from 'sequelize';

class TaskService {
  private mapTaskToDto(task: Task | null): TaskType {
    if (!task) {
      throw new Error('Invalid task: task is null or undefined');
    }

    // Використовуємо toJSON() для отримання всіх даних з Sequelize моделі
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const taskData = (task as any).toJSON ? (task as any).toJSON() : task;

    // Безпечна перевірка та конвертація id
    const taskId = taskData.id;
    if (taskId === undefined || taskId === null) {
      throw new Error('Invalid task: task.id is undefined or null');
    }

    // Безпечна перевірка createdAt
    const createdAt = taskData.createdAt;
    const createdAtStr = createdAt
      ? createdAt instanceof Date
        ? createdAt.toISOString()
        : new Date(createdAt).toISOString()
      : new Date().toISOString();

    // Безпечна перевірка assignee
    const assignee = taskData.assignee;
    const assigneeData =
      assignee && assignee.id !== undefined && assignee.id !== null
        ? {
            id: assignee.id,
            name: assignee.name || '',
            email: assignee.email || '',
          }
        : null;

    return {
      id: String(taskId),
      title: taskData.title || '',
      description: taskData.description || '',
      status: taskData.status || 'todo',
      priority: taskData.priority || 'normal',
      deadline: taskData.deadline || null,
      assigneeId: taskData.assigneeId || null,
      assignee: assigneeData,
      createdAt: createdAtStr,
    };
  }

  async getAllTasks(queryParams?: TaskQueryParams): Promise<TaskType[]> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = {};

    if (queryParams) {
      if (queryParams.status) {
        where.status = queryParams.status;
      }

      if (queryParams.priority) {
        where.priority = queryParams.priority;
      }

      if (queryParams.createdAt) {
        const date = new Date(queryParams.createdAt);
        const startOfDay = new Date(date.setHours(0, 0, 0, 0));
        const endOfDay = new Date(date.setHours(23, 59, 59, 999));
        where.createdAt = {
          [Op.between]: [startOfDay, endOfDay],
        };
      }
    }

    const tasks = await Task.findAll({
      where,
      include: [
        {
          model: User,
          as: 'assignee',
          required: false,
        },
      ],
      order: [['createdAt', 'DESC']],
    });

    return tasks.map(task => this.mapTaskToDto(task));
  }

  async getTaskById(id: string): Promise<TaskType | null> {
    const taskId = parseInt(id, 10);
    if (isNaN(taskId) || taskId <= 0) {
      return null;
    }

    try {
      const task = await Task.findByPk(taskId, {
        include: [
          {
            model: User,
            as: 'assignee',
            required: false,
          },
        ],
      });

      if (!task) {
        return null;
      }

      return this.mapTaskToDto(task);
    } catch (error) {
      console.error('Error in getTaskById:', error);
      return null;
    }
  }

  async createTask(createTaskDto: CreateTaskDto): Promise<TaskType> {
    try {
      const task = await Task.create({
        title: createTaskDto.title,
        description: createTaskDto.description,
        status: createTaskDto.status,
        priority: createTaskDto.priority,
        deadline: createTaskDto.deadline,
        assigneeId: createTaskDto.assigneeId || null,
      });

      const taskWithAssignee = await Task.findByPk(task.id, {
        include: [
          {
            model: User,
            as: 'assignee',
            required: false,
          },
        ],
      });

      if (!taskWithAssignee) {
        throw new Error('Failed to retrieve created task');
      }

      return this.mapTaskToDto(taskWithAssignee);
    } catch (error) {
      console.error('Error in createTask service:', error);
      throw error;
    }
  }

  async updateTask(id: string, updateTaskDto: UpdateTaskDto): Promise<TaskType | null> {
    const taskId = parseInt(id, 10);
    if (isNaN(taskId) || taskId <= 0) {
      return null;
    }

    try {
      const task = await Task.findByPk(taskId);
      if (!task) {
        return null;
      }

      await task.update({
        title: updateTaskDto.title,
        description: updateTaskDto.description,
        status: updateTaskDto.status,
        priority: updateTaskDto.priority,
        deadline: updateTaskDto.deadline,
        assigneeId:
          updateTaskDto.assigneeId !== undefined ? updateTaskDto.assigneeId : task.assigneeId,
      });

      const updatedTask = await Task.findByPk(taskId, {
        include: [
          {
            model: User,
            as: 'assignee',
            required: false,
          },
        ],
      });

      if (!updatedTask) {
        return null;
      }

      return this.mapTaskToDto(updatedTask);
    } catch (error) {
      console.error('Error in updateTask:', error);
      throw error;
    }
  }

  async deleteTask(id: string): Promise<boolean> {
    const taskId = parseInt(id, 10);
    if (isNaN(taskId) || taskId <= 0) {
      return false;
    }

    try {
      const task = await Task.findByPk(taskId);
      if (!task) {
        return false;
      }

      await task.destroy();
      return true;
    } catch (error) {
      console.error('Error in deleteTask:', error);
      return false;
    }
  }
}

export const taskService = new TaskService();
