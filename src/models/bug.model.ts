import { Task } from './task.model';
import { TaskInterface } from '../features/tasks/types';

export class Bug extends Task {
  // Унікальні поля для бага - кроки відтворення та очікуваний результат
  public stepsToReproduce?: string;
  public expectedResult?: string;
  public actualResult?: string;
  public severity?: 'low' | 'medium' | 'high' | 'critical';

  constructor(
    id: number | string,
    title: string,
    description?: string,
    createdAt?: string | Date,
    status: 'todo' | 'in-progress' | 'done' = 'todo',
    priority: 'low' | 'normal' | 'high' = 'normal',
    deadline?: string | Date,
    stepsToReproduce?: string,
    expectedResult?: string,
    actualResult?: string,
    severity?: 'low' | 'medium' | 'high' | 'critical'
  ) {
    super(id, title, description, createdAt, status, priority, deadline, 'Bug');
    this.stepsToReproduce = stepsToReproduce;
    this.expectedResult = expectedResult;
    this.actualResult = actualResult;
    this.severity = severity;
  }

  getTaskInfo(): TaskInterface {
    const baseInfo = super.getTaskInfo();
    return {
      ...baseInfo,
      // Додаємо унікальні поля до інформації про завдання
      stepsToReproduce: this.stepsToReproduce,
      expectedResult: this.expectedResult,
      actualResult: this.actualResult,
      severity: this.severity,
    } as TaskInterface & {
      stepsToReproduce?: string;
      expectedResult?: string;
      actualResult?: string;
      severity?: 'low' | 'medium' | 'high' | 'critical';
    };
  }
}
