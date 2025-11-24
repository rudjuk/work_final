import { TaskInterface, Status, Priority, TypeTask } from '../features/tasks/types';

export class Task implements TaskInterface {
  public id?: string;
  public title: string;
  public description: string;
  public createdAt?: string;
  public status: Status;
  public priority: Priority;
  public deadline: string | null;
  public typeTask?: TypeTask;

  constructor(
    id: number | string | undefined,
    title: string,
    description?: string,
    createdAt?: string | Date,
    status: Status = 'todo',
    priority: Priority = 'normal',
    deadline?: string | Date,
    typeTask: TypeTask = 'Task'
  ) {
    this.id = id ? String(id) : undefined;
    this.title = title;
    this.description = description || '';
    this.createdAt = createdAt
      ? typeof createdAt === 'string'
        ? createdAt
        : createdAt.toISOString()
      : undefined;
    this.status = status;
    this.priority = priority;
    this.deadline = deadline
      ? typeof deadline === 'string'
        ? deadline
        : deadline.toISOString().split('T')[0]
      : null;
    this.typeTask = typeTask;
    this.init();
  }

  // Встановлення налаштувань класу
  protected init(): void {
    // Визначаємо тип завдання на основі назви класу
    const className = this.constructor.name;
    if (
      className === 'Task' ||
      className === 'Subtask' ||
      className === 'Bug' ||
      className === 'Story' ||
      className === 'Epic'
    ) {
      this.typeTask = className as TypeTask;
    }
  }

  setTaskInfo(data: TaskInterface): void {
    // Перевіряємо коректність даних
    if (data.id === '') {
      console.log('id пусте! Елемент не прийнято.');
      return;
    }

    if (data.title === '') {
      console.log('title пусте! Елемент не прийнято.');
      return;
    }

    if (data.description === '') {
      console.log('Рекомендується заповнювати description! ');
    }

    Object.assign(this, data);
  }

  getTaskInfo(): TaskInterface {
    return {
      id: this.id,
      title: this.title,
      description: this.description,
      createdAt: this.createdAt,
      status: this.status,
      priority: this.priority,
      deadline: this.deadline,
      typeTask: this.typeTask,
    };
  }
}
