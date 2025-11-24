export type Status = 'todo' | 'in-progress' | 'review' | 'done';

export type Priority = 'low' | 'normal' | 'high';

export interface Task {
  id: string;
  title: string;
  description: string;
  createdAt: string;
  status: Status;
  priority: Priority;
  deadline: string | null;
  assigneeId?: number | null;
  assignee?: {
    id: number;
    name: string;
    email: string;
  } | null;
}

export interface CreateTaskDto {
  title: string;
  description: string;
  status: Status;
  priority: Priority;
  deadline: string | null;
  assigneeId?: number | null;
}

export interface UpdateTaskDto {
  title?: string;
  description?: string;
  status?: Status;
  priority?: Priority;
  deadline?: string | null;
  assigneeId?: number | null;
}

export interface TaskQueryParams {
  createdAt?: string;
  status?: Status;
  priority?: Priority;
}
