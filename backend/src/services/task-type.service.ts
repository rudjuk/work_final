import { TaskTypeModel } from '../models/task-type.model';
import { TaskType, CreateTaskTypeDto, UpdateTaskTypeDto } from '../types/task-type.types';

export class TaskTypeService {
  constructor(private taskTypeModel: TaskTypeModel) {}

  async createTaskType(data: CreateTaskTypeDto): Promise<TaskType> {
    return this.taskTypeModel.create(data);
  }

  async getTaskTypes(): Promise<TaskType[]> {
    return this.taskTypeModel.findAll();
  }

  async getTaskTypeById(id: number): Promise<TaskType | null> {
    return this.taskTypeModel.findById(id);
  }

  async updateTaskType(id: number, data: UpdateTaskTypeDto): Promise<TaskType | null> {
    const taskType = await this.taskTypeModel.findById(id);
    if (!taskType) {
      return null;
    }
    return this.taskTypeModel.update(id, data);
  }

  async deleteTaskType(id: number): Promise<boolean> {
    return this.taskTypeModel.delete(id);
  }
}

