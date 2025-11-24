// API requests for tasks feature
import { TaskInterface } from './types';
import { Task, Subtask, Bug, Story, Epic } from '../../models';

const API_BASE_URL = 'http://localhost:3000';

export type TaskList = TaskInterface[];

export class TaskService {
  // Отримання всіх завдань
  async getTasks(): Promise<TaskList> {
    const response = await fetch(`${API_BASE_URL}/tasks`);

    if (!response.ok) {
      throw new Error(`Помилка отримання списку завдань: ${response.statusText}`);
    }

    return response.json();
  }

  // Отримання завдання за ID
  async getTask(id: string): Promise<TaskInterface | null> {
    const response = await fetch(`${API_BASE_URL}/tasks/${id}`);

    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      throw new Error(`Помилка отримання завдання: ${response.statusText}`);
    }

    return response.json();
  }

  // Створення нового завдання будь-якого типу
  async createTask(task: Task | Subtask | Bug | Story | Epic): Promise<TaskInterface> {
    const taskData = task.getTaskInfo();

    // Backend очікує тільки ці поля, без id, typeTask, createdAt
    // Важливо: description має бути мінімум 1 символ (backend валідація)
    if (!taskData.description || taskData.description.trim().length === 0) {
      throw new Error("Опис є обов'язковим полем і не може бути порожнім");
    }

    const requestBody = {
      title: taskData.title,
      description: taskData.description.trim(), // Backend вимагає description (мінімум 1 символ)
      status: taskData.status,
      priority: taskData.priority,
      deadline: taskData.deadline || null,
      // assigneeId опціональний, якщо потрібно
    };

    const response = await fetch(`${API_BASE_URL}/tasks`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: response.statusText }));
      throw new Error(`Помилка створення завдання: ${errorData.error || response.statusText}`);
    }

    return response.json();
  }

  // Оновлення завдання
  async updateTask(task: TaskInterface | Partial<TaskInterface>): Promise<TaskInterface> {
    if (!task.id) {
      throw new Error('ID завдання не вказано');
    }

    // Відправляємо тільки поля, які очікує backend
    const updateData: Record<string, unknown> = {};
    if (task.title !== undefined) updateData.title = task.title;
    if (task.description !== undefined) updateData.description = task.description;
    if (task.status !== undefined) updateData.status = task.status;
    if (task.priority !== undefined) updateData.priority = task.priority;
    if (task.deadline !== undefined) updateData.deadline = task.deadline;
    if ('assigneeId' in task && task.assigneeId !== undefined) {
      updateData.assigneeId = task.assigneeId;
    }

    const response = await fetch(`${API_BASE_URL}/tasks/${task.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updateData),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: response.statusText }));
      throw new Error(`Помилка оновлення завдання: ${errorData.error || response.statusText}`);
    }

    return response.json();
  }

  // Часткове оновлення завдання
  async patchTask(id: string, updates: Partial<TaskInterface>): Promise<TaskInterface> {
    const response = await fetch(`${API_BASE_URL}/tasks/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updates),
    });

    if (!response.ok) {
      throw new Error(`Помилка оновлення завдання: ${response.statusText}`);
    }

    return response.json();
  }

  // Видалення завдання
  async deleteTask(id: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/tasks/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error(`Помилка видалення завдання: ${response.statusText}`);
    }
  }
}
