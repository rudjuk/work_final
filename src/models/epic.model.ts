import { Task } from './task.model';
import { TaskInterface } from '../features/tasks/types';

export class Epic extends Task {
  // Унікальні поля для епіка - список пов'язаних історій та цілі
  public relatedStories?: (number | string)[];
  public goals?: string[];
  public businessValue?: string;

  constructor(
    id: number | string,
    title: string,
    description?: string,
    createdAt?: string | Date,
    status: 'todo' | 'in-progress' | 'done' = 'todo',
    priority: 'low' | 'normal' | 'high' = 'normal',
    deadline?: string | Date,
    relatedStories?: (number | string)[],
    goals?: string[],
    businessValue?: string
  ) {
    super(id, title, description, createdAt, status, priority, deadline, 'Epic');
    this.relatedStories = relatedStories;
    this.goals = goals;
    this.businessValue = businessValue;
  }

  getTaskInfo(): TaskInterface {
    const baseInfo = super.getTaskInfo();
    return {
      ...baseInfo,
      // Додаємо унікальні поля до інформації про завдання
      relatedStories: this.relatedStories,
      goals: this.goals,
      businessValue: this.businessValue,
    } as TaskInterface & {
      relatedStories?: (number | string)[];
      goals?: string[];
      businessValue?: string;
    };
  }
}
