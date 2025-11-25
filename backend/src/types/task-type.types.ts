export interface TaskType {
  id: number;
  name: string;
  description: string | null;
  color: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTaskTypeDto {
  name: string;
  description?: string | null;
  color?: string | null;
}

export interface UpdateTaskTypeDto {
  name?: string;
  description?: string | null;
  color?: string | null;
}

