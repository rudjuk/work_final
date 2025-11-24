import { useNavigate } from 'react-router-dom';
import { TaskInterface, Status, Priority } from '../types';
import './TaskCard.css';

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

interface TaskCardProps {
  task: TaskInterface;

  onDelete?: (id: string) => void;
}

export function TaskCard({ task, onDelete }: TaskCardProps) {
  const navigate = useNavigate();

  const handleClick = (e: React.MouseEvent) => {
    // Не переходимо на деталі, якщо клікнули на кнопку видалення
    if ((e.target as HTMLElement).closest('.delete-button')) {
      return;
    }
    if (task.id) {
      navigate(`/tasks/${task.id}`);
    }
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation(); // Зупиняємо подію, щоб не спрацював handleClick
    if (task.id && onDelete) {
      if (window.confirm('Ви впевнені, що хочете видалити це завдання?')) {
        onDelete(task.id);
      }
    }
  };

  return (
    <div className="task-item" onClick={handleClick}>
      <div className="task-header">
        <h3>{task.title || 'Без назви'}</h3>
        {onDelete && task.id && (
          <button
            className="delete-button"
            onClick={handleDelete}
            title="Видалити завдання"
            aria-label="Видалити завдання"
          >
            ×
          </button>
        )}
      </div>
      {task.description && <p className="task-description">{task.description}</p>}
      <div className="task-meta">
        <div className="task-info">
          <span className="task-label">Тип:</span>
          <span className="task-value">{task.typeTask || 'Task'}</span>
        </div>
        <div className="task-info">
          <span className="task-label">Статус:</span>
          <span className="task-value">{getStatusLabel(task.status || 'todo')}</span>
        </div>
        <div className="task-info">
          <span className="task-label">Пріоритет:</span>
          <span className="task-value">{getPriorityLabel(task.priority || 'normal')}</span>
        </div>
        <div className="task-info">
          <span className="task-label">Створено:</span>
          <span className="task-value">{formatDate(task.createdAt)}</span>
        </div>
        <div className="task-info">
          <span className="task-label">Дедлайн:</span>
          <span className="task-value">{formatDate(task.deadline)}</span>
        </div>
      </div>
    </div>
  );
}
