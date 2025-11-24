// Типи даних завдань

export type Status = 'todo' | 'in-progress' | 'review' | 'done';

export type Priority = 'low' | 'normal' | 'high';

export type TypeTask = 'Task' | 'Subtask' | 'Bug' | 'Story' | 'Epic';

export interface TaskInterface {
  id?: string;
  title: string;
  description: string;
  createdAt?: string;
  status: Status;
  priority: Priority;
  deadline: string | null;
  typeTask?: TypeTask;
}
