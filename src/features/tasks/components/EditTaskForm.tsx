import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { TaskInterface, Status, Priority } from '../types';
import { TaskService } from '../api';
import './EditTaskForm.css';

// Validation schema using zod
const taskFormSchema = z.object({
  title: z.string().min(1, "Назва є обов'язковим полем"),
  description: z.string().min(1, "Опис є обов'язковим полем"),
  status: z.enum(['todo', 'in-progress', 'review', 'done']),
  priority: z.enum(['low', 'normal', 'high']),
  deadline: z
    .string()
    .optional()
    .refine(
      date => {
        if (!date) return true; // Optional field
        const selectedDate = new Date(date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return selectedDate >= today;
      },
      {
        message: 'Дедлайн не може бути в минулому',
      }
    ),
});

type TaskFormData = z.infer<typeof taskFormSchema>;

interface EditTaskFormProps {
  task: TaskInterface;
  onSuccess: () => void;
  onCancel: () => void;
}

export function EditTaskForm({ task, onSuccess, onCancel }: EditTaskFormProps) {
  const taskService = new TaskService();

  const {
    register,
    handleSubmit,
    formState: { errors, isValid, isDirty },
    watch,
  } = useForm<TaskFormData>({
    resolver: zodResolver(taskFormSchema),
    mode: 'onChange',
    defaultValues: {
      title: task.title || '',
      description: task.description || '',
      status: (task.status || 'todo') as Status,
      priority: (task.priority || 'normal') as Priority,
      deadline: task.deadline || undefined,
    },
  });

  // Watch form values to ensure isDirty works correctly
  watch();

  const onSubmit = async (data: TaskFormData) => {
    try {
      await taskService.updateTask({
        ...task,
        title: data.title,
        description: data.description,
        status: data.status,
        priority: data.priority,
        deadline: data.deadline || null,
      });
      onSuccess();
    } catch (error) {
      alert(
        `Помилка оновлення завдання: ${error instanceof Error ? error.message : 'Невідома помилка'}`
      );
      console.error('Помилка оновлення завдання:', error);
    }
  };

  return (
    <div className="edit-task-form">
      <h2>Редагувати завдання</h2>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="form-group">
          <label htmlFor="edit-title">Назва:</label>
          <input
            type="text"
            id="edit-title"
            {...register('title')}
            className={errors.title ? 'error' : ''}
          />
          {errors.title && <span className="error-message">{errors.title.message}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="edit-description">Опис:</label>
          <textarea
            id="edit-description"
            rows={4}
            {...register('description')}
            className={errors.description ? 'error' : ''}
          />
          {errors.description && (
            <span className="error-message">{errors.description.message}</span>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="edit-status">Статус:</label>
          <select id="edit-status" {...register('status')} className={errors.status ? 'error' : ''}>
            <option value="todo">To Do</option>
            <option value="in-progress">In Progress</option>
            <option value="review">Review</option>
            <option value="done">Done</option>
          </select>
          {errors.status && <span className="error-message">{errors.status.message}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="edit-priority">Пріоритет:</label>
          <select
            id="edit-priority"
            {...register('priority')}
            className={errors.priority ? 'error' : ''}
          >
            <option value="low">Низький</option>
            <option value="normal">Нормальний</option>
            <option value="high">Високий</option>
          </select>
          {errors.priority && <span className="error-message">{errors.priority.message}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="edit-deadline">Дедлайн:</label>
          <input
            type="date"
            id="edit-deadline"
            {...register('deadline')}
            className={errors.deadline ? 'error' : ''}
          />
          {errors.deadline && <span className="error-message">{errors.deadline.message}</span>}
        </div>

        <div className="form-actions">
          <button type="button" onClick={onCancel} className="cancel-button">
            Скасувати
          </button>
          <button type="submit" disabled={!isValid || !isDirty} className="submit-button">
            Зберегти зміни
          </button>
        </div>
      </form>
    </div>
  );
}
