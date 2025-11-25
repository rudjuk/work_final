export enum TaskStatus {
  TODO = 'To Do',
  IN_PROGRESS = 'In Progress',
  REVIEW = 'Review',
  DONE = 'Done',
}

export enum TaskPriority {
  LOW = 'Low',
  MEDIUM = 'Medium',
  HIGH = 'High',
}

export interface Task {
  id: number;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  taskTypeId: number | null;
  assignedToUserId: number | null;
  dueDate: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTaskDto {
  title: string;
  description: string;
  status?: TaskStatus;
  priority: TaskPriority;
  taskTypeId?: number | null;
  assignedToUserId?: number | null;
  dueDate?: string | null;
}

export interface UpdateTaskDto {
  title?: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  taskTypeId?: number | null;
  assignedToUserId?: number | null;
  dueDate?: string | null;
}

export interface TaskQueryParams {
  status?: TaskStatus;
  priority?: TaskPriority;
  date?: string;
}

