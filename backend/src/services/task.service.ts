import { TaskModel } from '../models/task.model';
import { Task, CreateTaskDto, UpdateTaskDto, TaskQueryParams } from '../types/task.types';

export class TaskService {
  constructor(private taskModel: TaskModel) {}

  async createTask(data: CreateTaskDto): Promise<Task> {
    return this.taskModel.create(data);
  }

  async getTasks(filters?: TaskQueryParams): Promise<Task[]> {
    return this.taskModel.findAll(filters);
  }

  async getTaskById(id: number): Promise<Task | null> {
    return this.taskModel.findById(id);
  }

  async updateTask(id: number, data: UpdateTaskDto): Promise<Task | null> {
    const task = await this.taskModel.findById(id);
    if (!task) {
      return null;
    }
    return this.taskModel.update(id, data);
  }

  async deleteTask(id: number): Promise<boolean> {
    return this.taskModel.delete(id);
  }
}

