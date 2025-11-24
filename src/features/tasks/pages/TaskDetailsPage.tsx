import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { TaskService } from '../api';
import { TaskInterface, Status, Priority } from '../types';
import { EditTaskForm } from '../components/EditTaskForm';
import './TaskDetailsPage.css';

function formatDate(dateString: string | null | undefined): string {
  if (!dateString) return 'Не вказано';
  try {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = String(date.getFullYear()).slice(-2);
    return `${day}.${month}.${year}`;
  } catch {
    return 'Некоректна дата';
  }
}

function getStatusLabel(status: Status): string {
  const labels: Record<Status, string> = {
    todo: 'To Do',
    'in-progress': 'In Progress',
    review: 'Review',
    done: 'Done',
  };
  return labels[status] || status;
}

function getPriorityLabel(priority: Priority): string {
  const labels: Record<Priority, string> = {
    low: 'Низький',
    normal: 'Нормальний',
    high: 'Високий',
  };
  return labels[priority] || priority;
}

export function TaskDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const [task, setTask] = useState<TaskInterface | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const taskService = new TaskService();

  const loadTask = async () => {
    if (!id) {
      setError('ID завдання не вказано');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const taskData = await taskService.getTask(id);
      if (!taskData) {
        setError('Завдання не знайдено');
      } else {
        setTask(taskData);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Невідома помилка завантаження завдання');
      console.error('Помилка завантаження завдання:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTask();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleEditSuccess = async () => {
    setIsEditing(false);
    await loadTask();
  };

  if (loading) {
    return (
      <div className="task-details-section">
        <div className="loading">Завантаження...</div>
      </div>
    );
  }

  if (error || !task) {
    return (
      <div className="task-details-section">
        <div className="error">{error || 'Завдання не знайдено'}</div>
        <Link to="/tasks" className="back-button">
          Назад до списку
        </Link>
      </div>
    );
  }

  return (
    <div className="task-details-section">
      <div className="task-details-header">
        <Link to="/tasks" className="back-button">
          ← Назад
        </Link>
        {!isEditing && (
          <button onClick={() => setIsEditing(true)} className="edit-button">
            Редагувати
          </button>
        )}
      </div>
      {isEditing && task ? (
        <EditTaskForm
          task={task}
          onSuccess={handleEditSuccess}
          onCancel={() => setIsEditing(false)}
        />
      ) : (
        <div className="task-details-content">
          <h1>{task.title}</h1>
          {task.description && (
            <div className="task-description-section">
              <h3>Опис</h3>
              <p>{task.description}</p>
            </div>
          )}
          <div className="task-info-grid">
            <div className="task-info-item">
              <span className="task-info-label">Тип:</span>
              <span className="task-info-value">{task.typeTask || 'Task'}</span>
            </div>
            <div className="task-info-item">
              <span className="task-info-label">Статус:</span>
              <span className="task-info-value">{getStatusLabel(task.status || 'todo')}</span>
            </div>
            <div className="task-info-item">
              <span className="task-info-label">Пріоритет:</span>
              <span className="task-info-value">{getPriorityLabel(task.priority || 'normal')}</span>
            </div>
            <div className="task-info-item">
              <span className="task-info-label">Створено:</span>
              <span className="task-info-value">{formatDate(task.createdAt)}</span>
            </div>
            <div className="task-info-item">
              <span className="task-info-label">Дедлайн:</span>
              <span className="task-info-value">{formatDate(task.deadline)}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
