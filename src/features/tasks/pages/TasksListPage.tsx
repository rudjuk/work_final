import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { TaskService } from '../api';
import { TaskInterface } from '../types';
import { TaskCard } from '../components/TaskCard';
import { KanbanBoard } from '../components/KanbanBoard';
import './TasksListPage.css';

type ViewMode = 'kanban' | 'list';

export function TasksListPage() {
  const [tasks, setTasks] = useState<TaskInterface[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('kanban');
  const taskService = new TaskService();

  const loadTasks = async () => {
    try {
      setLoading(true);
      setError(null);
      const tasksData = await taskService.getTasks();
      setTasks(tasksData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Невідома помилка завантаження завдань');
      console.error('Помилка завантаження завдань:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await taskService.deleteTask(id);
      // Оновлюємо список після видалення
      await loadTasks();
    } catch (err) {
      alert(
        err instanceof Error
          ? `Помилка видалення завдання: ${err.message}`
          : 'Невідома помилка видалення завдання'
      );
      console.error('Помилка видалення завдання:', err);
    }
  };

  useEffect(() => {
    loadTasks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading) {
    return (
      <div className="tasks-section">
        <h2>Список завдань</h2>
        <div className="loading">Завантаження...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="tasks-section">
        <h2>Список завдань</h2>
        <div className="error">
          Помилка завантаження завдань: {error}
          <br />
          <br />
          Переконайтеся, що сервер запущений на порту 3000.
          <br />
          Запустіть: <code>npm run start</code>
        </div>
      </div>
    );
  }

  return (
    <div className="tasks-section">
      <div className="tasks-header">
        <h2>Список завдань</h2>
        <div className="tasks-header-actions">
          <div className="view-mode-toggle">
            <button
              className={viewMode === 'kanban' ? 'active' : ''}
              onClick={() => setViewMode('kanban')}
              title="Kanban board"
            >
              📋 Kanban
            </button>
            <button
              className={viewMode === 'list' ? 'active' : ''}
              onClick={() => setViewMode('list')}
              title="Список"
            >
              📝 Список
            </button>
          </div>
          <Link to="/tasks/create" className="create-button">
            Створити завдання
          </Link>
        </div>
      </div>
      {tasks.length === 0 ? (
        <div className="empty">Немає завдань. Створіть перше завдання!</div>
      ) : viewMode === 'kanban' ? (
        <KanbanBoard tasks={tasks} onTaskUpdate={loadTasks} onDelete={handleDelete} />
      ) : (
        <div className="tasks-list">
          {tasks.map(task => (
            <TaskCard key={task.id} task={task} onDelete={handleDelete} />
          ))}
        </div>
      )}
    </div>
  );
}
