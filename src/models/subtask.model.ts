import { Task } from './task.model';
import { TaskInterface } from '../features/tasks/types';

export class Subtask extends Task {
  // Унікальне поле для підзавдання - ID батьківського завдання
  public parentTaskId?: number | string;

  constructor(
    id: number | string,
    title: string,
    description?: string,
    createdAt?: string | Date,
    status: 'todo' | 'in-progress' | 'done' = 'todo',
    priority: 'low' | 'normal' | 'high' = 'normal',
    deadline?: string | Date,
    parentTaskId?: number | string
  ) {
    super(id, title, description, createdAt, status, priority, deadline, 'Subtask');
    this.parentTaskId = parentTaskId;
  }

  getTaskInfo(): TaskInterface {
    const baseInfo = super.getTaskInfo();
    return {
      ...baseInfo,
      // Додаємо унікальне поле до інформації про завдання
      parentTaskId: this.parentTaskId,
    } as TaskInterface & { parentTaskId?: number | string };
  }
}
