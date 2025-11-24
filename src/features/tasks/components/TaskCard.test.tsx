import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { TaskCard } from './TaskCard';
import { TaskInterface } from '../types';

const mockNavigate = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

const renderWithRouter = (component: React.ReactElement) => {
  return render(<BrowserRouter>{component}</BrowserRouter>);
};

describe('TaskCard', () => {
  const mockTask: TaskInterface = {
    id: '1',
    title: 'Test Task',
    description: 'Test Description',
    status: 'todo',
    priority: 'normal',
    deadline: '2024-12-31',
    typeTask: 'Task',
    createdAt: '2024-01-01T00:00:00.000Z',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should display all required task fields correctly', () => {
    renderWithRouter(<TaskCard task={mockTask} />);

    expect(screen.getByText('Test Task')).toBeInTheDocument();
    expect(screen.getByText('Test Description')).toBeInTheDocument();
    expect(screen.getByText('Task')).toBeInTheDocument();
    expect(screen.getByText('To Do')).toBeInTheDocument();
    expect(screen.getByText('Нормальний')).toBeInTheDocument();
  });

  it('should navigate to task details when clicked', () => {
    renderWithRouter(<TaskCard task={mockTask} />);

    const taskCard = screen.getByText('Test Task').closest('.task-item');
    taskCard?.click();

    expect(mockNavigate).toHaveBeenCalledWith('/tasks/1');
  });

  it('should handle task without description', () => {
    const taskWithoutDescription = { ...mockTask, description: undefined };
    renderWithRouter(<TaskCard task={taskWithoutDescription} />);

    expect(screen.getByText('Test Task')).toBeInTheDocument();
    expect(screen.queryByText('Test Description')).not.toBeInTheDocument();
  });

  it('should format dates correctly', () => {
    renderWithRouter(<TaskCard task={mockTask} />);

    // Check that date formatting is displayed
    expect(screen.getByText(/31\.12\.24/)).toBeInTheDocument();
  });

  it('should handle null deadline', () => {
    const taskWithoutDeadline = { ...mockTask, deadline: null };
    renderWithRouter(<TaskCard task={taskWithoutDeadline} />);

    expect(screen.getByText('Не вказано')).toBeInTheDocument();
  });

  it('should display correct status labels', () => {
    const inProgressTask = { ...mockTask, status: 'in-progress' };
    renderWithRouter(<TaskCard task={inProgressTask} />);

    expect(screen.getByText('In Progress')).toBeInTheDocument();
  });

  it('should display correct priority labels', () => {
    const highPriorityTask = { ...mockTask, priority: 'high' };
    renderWithRouter(<TaskCard task={highPriorityTask} />);

    expect(screen.getByText('Високий')).toBeInTheDocument();
  });

  it('should display all task metadata fields', () => {
    renderWithRouter(<TaskCard task={mockTask} />);

    // Check that all metadata labels are present
    expect(screen.getByText('Тип:')).toBeInTheDocument();
    expect(screen.getByText('Статус:')).toBeInTheDocument();
    expect(screen.getByText('Пріоритет:')).toBeInTheDocument();
    expect(screen.getByText('Створено:')).toBeInTheDocument();
    expect(screen.getByText('Дедлайн:')).toBeInTheDocument();
  });

  it('should handle task with different statuses', () => {
    const doneTask = { ...mockTask, status: 'done' };
    renderWithRouter(<TaskCard task={doneTask} />);

    expect(screen.getByText('Done')).toBeInTheDocument();
  });

  it('should handle task with different priorities', () => {
    const lowPriorityTask = { ...mockTask, priority: 'low' };
    renderWithRouter(<TaskCard task={lowPriorityTask} />);

    expect(screen.getByText('Низький')).toBeInTheDocument();
  });
});
