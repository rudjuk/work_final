import { useState } from 'react';
import { TaskInterface, Status } from '../types';
import { TaskService } from '../api';
import { TaskCard } from './TaskCard';
import './KanbanBoard.css';

const STATUSES: Status[] = ['todo', 'in-progress', 'review', 'done'];

const STATUS_LABELS: Record<Status, string> = {
  todo: 'To Do',
  'in-progress': 'In Progress',
  review: 'Review',
  done: 'Done',
};

interface KanbanBoardProps {
  tasks: TaskInterface[];
  onTaskUpdate: () => void;
  onDelete: (id: string) => void;
}

export function KanbanBoard({ tasks, onTaskUpdate, onDelete }: KanbanBoardProps) {
  const [draggedTask, setDraggedTask] = useState<TaskInterface | null>(null);
  const [draggedOverColumn, setDraggedOverColumn] = useState<Status | null>(null);
  const taskService = new TaskService();

  const tasksByStatus = STATUSES.reduce(
    (acc, status) => {
      acc[status] = tasks.filter(task => task.status === status);
      return acc;
    },
    {} as Record<Status, TaskInterface[]>
  );

  const handleDragStart = (task: TaskInterface) => {
    setDraggedTask(task);
  };

  const handleDragOver = (e: React.DragEvent, status: Status) => {
    e.preventDefault();
    setDraggedOverColumn(status);
  };

  const handleDragLeave = () => {
    setDraggedOverColumn(null);
  };

  const handleDrop = async (e: React.DragEvent, targetStatus: Status) => {
    e.preventDefault();
    setDraggedOverColumn(null);

    if (!draggedTask || draggedTask.status === targetStatus) {
      setDraggedTask(null);
      return;
    }

    try {
      await taskService.updateTask({
        ...draggedTask,
        status: targetStatus,
      });
      onTaskUpdate();
    } catch (error) {
      console.error('Помилка оновлення статусу:', error);
      alert(
        `Помилка оновлення статусу: ${error instanceof Error ? error.message : 'Невідома помилка'}`
      );
    } finally {
      setDraggedTask(null);
    }
  };

  const handleStatusChange = async (taskId: string, newStatus: Status) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task || task.status === newStatus) {
      return;
    }

    try {
      await taskService.updateTask({
        ...task,
        status: newStatus,
      });
      onTaskUpdate();
    } catch (error) {
      console.error('Помилка оновлення статусу:', error);
      alert(
        `Помилка оновлення статусу: ${error instanceof Error ? error.message : 'Невідома помилка'}`
      );
    }
  };

  return (
    <div className="kanban-board">
      {STATUSES.map(status => (
        <div
          key={status}
          className={`kanban-column ${draggedOverColumn === status ? 'drag-over' : ''}`}
          onDragOver={e => handleDragOver(e, status)}
          onDragLeave={handleDragLeave}
          onDrop={e => handleDrop(e, status)}
        >
          <div className="kanban-column-header">
            <h3>{STATUS_LABELS[status]}</h3>
            <span className="task-count">{tasksByStatus[status].length}</span>
          </div>
          <div className="kanban-column-content">
            {tasksByStatus[status].map(task => (
              <div
                key={task.id}
                draggable
                onDragStart={() => handleDragStart(task)}
                className="kanban-task-wrapper"
              >
                <TaskCard task={task} onDelete={onDelete} />
                <div className="status-change-buttons">
                  {STATUSES.filter(s => s !== status).map(newStatus => (
                    <button
                      key={newStatus}
                      className="status-change-button"
                      onClick={() => task.id && handleStatusChange(task.id, newStatus)}
                      title={`Змінити статус на ${STATUS_LABELS[newStatus]}`}
                    >
                      → {STATUS_LABELS[newStatus]}
                    </button>
                  ))}
                </div>
              </div>
            ))}
            {tasksByStatus[status].length === 0 && (
              <div className="kanban-empty">Немає завдань</div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
