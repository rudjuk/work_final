import axios from 'axios';
import { Task, CreateTaskDto, UpdateTaskDto, TaskStatus, TaskPriority } from '../types/task.types';
import { TaskType, CreateTaskTypeDto, UpdateTaskTypeDto } from '../types/task-type.types';
import { User, CreateUserDto, UpdateUserDto } from '../types/user.types';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Re-throw error so it can be handled in components
    return Promise.reject(error);
  }
);

export const taskApi = {
  getAll: async (filters?: {
    status?: TaskStatus;
    priority?: TaskPriority;
    date?: string;
  }): Promise<Task[]> => {
    const response = await api.get<Task[]>('/tasks', { params: filters });
    return response.data;
  },

  getById: async (id: number): Promise<Task> => {
    const response = await api.get<Task>(`/tasks/${id}`);
    return response.data;
  },

  create: async (data: CreateTaskDto): Promise<Task> => {
    const response = await api.post<Task>('/tasks', data);
    return response.data;
  },

  update: async (id: number, data: UpdateTaskDto): Promise<Task> => {
    const response = await api.put<Task>(`/tasks/${id}`, data);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/tasks/${id}`);
  },
};

export const taskTypeApi = {
  getAll: async (): Promise<TaskType[]> => {
    const response = await api.get<TaskType[]>('/task-types');
    return response.data;
  },

  getById: async (id: number): Promise<TaskType> => {
    const response = await api.get<TaskType>(`/task-types/${id}`);
    return response.data;
  },

  create: async (data: CreateTaskTypeDto): Promise<TaskType> => {
    const response = await api.post<TaskType>('/task-types', data);
    return response.data;
  },

  update: async (id: number, data: UpdateTaskTypeDto): Promise<TaskType> => {
    const response = await api.put<TaskType>(`/task-types/${id}`, data);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/task-types/${id}`);
  },
};

export const userApi = {
  getAll: async (): Promise<User[]> => {
    const response = await api.get<User[]>('/users');
    return response.data;
  },

  getById: async (id: number): Promise<User> => {
    const response = await api.get<User>(`/users/${id}`);
    return response.data;
  },

  create: async (data: CreateUserDto): Promise<User> => {
    const response = await api.post<User>('/users', data);
    return response.data;
  },

  update: async (id: number, data: UpdateUserDto): Promise<User> => {
    const response = await api.put<User>(`/users/${id}`, data);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/users/${id}`);
  },
};

