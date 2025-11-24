import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { TasksListPage } from './TasksListPage';
import { TaskInterface } from '../types';

const mockGetTasks = vi.fn();
const mockDeleteTask = vi.fn();
const mockUpdateTask = vi.fn();

// Mock the TaskService
vi.mock('../api', () => ({
  TaskService: class {
    getTasks = mockGetTasks;
    deleteTask = mockDeleteTask;
    updateTask = mockUpdateTask;
  },
}));

const mockTasks: TaskInterface[] = [
  {
    id: '1',
    title: 'Test Task 1',
    description: 'Test Description 1',
    status: 'todo',
    priority: 'normal',
    deadline: null,
    typeTask: 'Task',
    createdAt: '2024-01-01T00:00:00.000Z',
  },
  {
    id: '2',
    title: 'Test Task 2',
    description: 'Test Description 2',
    status: 'in-progress',
    priority: 'high',
    deadline: '2024-12-31',
    typeTask: 'Task',
    createdAt: '2024-01-02T00:00:00.000Z',
  },
];

const renderWithRouter = (component: React.ReactElement) => {
  return render(<BrowserRouter>{component}</BrowserRouter>);
};

describe('TasksListPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should display loading state initially', () => {
    mockGetTasks.mockImplementation(() => new Promise(() => {})); // Never resolves

    renderWithRouter(<TasksListPage />);

    expect(screen.getByText('Завантаження...')).toBeInTheDocument();
  });

  it('should display tasks correctly with all required fields', async () => {
    mockGetTasks.mockResolvedValue(mockTasks);

    renderWithRouter(<TasksListPage />);

    await waitFor(() => {
      expect(screen.getByText('Test Task 1')).toBeInTheDocument();
      expect(screen.getByText('Test Task 2')).toBeInTheDocument();
    });

    // Check that all required fields are present
    expect(screen.getByText('Test Description 1')).toBeInTheDocument();
    expect(screen.getByText('Test Description 2')).toBeInTheDocument();

    // Check status labels (may appear multiple times in Kanban view)
    expect(screen.getAllByText('To Do').length).toBeGreaterThan(0);
    expect(screen.getAllByText('In Progress').length).toBeGreaterThan(0);

    // Check priority labels
    expect(screen.getByText('Нормальний')).toBeInTheDocument();
    expect(screen.getByText('Високий')).toBeInTheDocument();
  });

  it('should display empty state when tasks list is empty', async () => {
    mockGetTasks.mockResolvedValue([]);

    renderWithRouter(<TasksListPage />);

    await waitFor(() => {
      expect(screen.getByText('Немає завдань. Створіть перше завдання!')).toBeInTheDocument();
    });
  });

  it('should display error message when there is an error', async () => {
    const errorMessage = 'Помилка завантаження';
    mockGetTasks.mockRejectedValue(new Error(errorMessage));

    renderWithRouter(<TasksListPage />);

    await waitFor(() => {
      expect(screen.getByText(/Помилка завантаження завдань/)).toBeInTheDocument();
      const errorDiv = screen.getByText(/Помилка завантаження завдань/).closest('.error');
      expect(errorDiv).toHaveTextContent(errorMessage);
    });
  });

  it('should display create task button', async () => {
    mockGetTasks.mockResolvedValue(mockTasks);

    renderWithRouter(<TasksListPage />);

    await waitFor(() => {
      const createButton = screen.getByText('Створити завдання');
      expect(createButton).toBeInTheDocument();
      expect(createButton.closest('a')).toHaveAttribute('href', '/tasks/create');
    });
  });

  it('should display page title', async () => {
    mockGetTasks.mockResolvedValue(mockTasks);

    renderWithRouter(<TasksListPage />);

    await waitFor(() => {
      expect(screen.getByText('Список завдань')).toBeInTheDocument();
    });
  });

  it('should handle multiple tasks correctly', async () => {
    const manyTasks = Array.from({ length: 5 }, (_, i) => ({
      ...mockTasks[0],
      id: String(i + 1),
      title: `Task ${i + 1}`,
    }));

    mockGetTasks.mockResolvedValue(manyTasks);

    renderWithRouter(<TasksListPage />);

    await waitFor(() => {
      expect(screen.getByText('Task 1')).toBeInTheDocument();
      expect(screen.getByText('Task 5')).toBeInTheDocument();
    });
  });

  it('should display Kanban board by default', async () => {
    mockGetTasks.mockResolvedValue(mockTasks);

    const { container } = renderWithRouter(<TasksListPage />);

    await waitFor(() => {
      // Check that Kanban board is rendered (has kanban-board class)
      const kanbanBoard = container.querySelector('.kanban-board');
      expect(kanbanBoard).toBeInTheDocument();

      // Check that all status columns are present
      expect(screen.getAllByText('To Do').length).toBeGreaterThan(0);
      expect(screen.getAllByText('In Progress').length).toBeGreaterThan(0);
      expect(screen.getAllByText('Review').length).toBeGreaterThan(0);
      expect(screen.getAllByText('Done').length).toBeGreaterThan(0);
    });
  });

  it('should switch between Kanban and List view modes', async () => {
    const user = userEvent.setup();
    mockGetTasks.mockResolvedValue(mockTasks);

    const { container } = renderWithRouter(<TasksListPage />);

    await waitFor(() => {
      const kanbanBoard = container.querySelector('.kanban-board');
      expect(kanbanBoard).toBeInTheDocument();
    });

    // Switch to list view - find button by role and text
    const listButtons = screen.getAllByRole('button');
    const listButton = listButtons.find(btn => btn.textContent?.toLowerCase().includes('список'));
    expect(listButton).toBeDefined();
    if (listButton) {
      await user.click(listButton);
    }

    await waitFor(() => {
      const kanbanBoard = container.querySelector('.kanban-board');
      expect(kanbanBoard).not.toBeInTheDocument();
      const tasksList = container.querySelector('.tasks-list');
      expect(tasksList).toBeInTheDocument();
      expect(screen.getByText('Test Task 1')).toBeInTheDocument();
    });

    // Switch back to Kanban view
    const kanbanButtons = screen.getAllByRole('button');
    const kanbanButton = kanbanButtons.find(btn =>
      btn.textContent?.toLowerCase().includes('kanban')
    );
    expect(kanbanButton).toBeDefined();
    if (kanbanButton) {
      await user.click(kanbanButton);
    }

    await waitFor(() => {
      const kanbanBoard = container.querySelector('.kanban-board');
      expect(kanbanBoard).toBeInTheDocument();
    });
  });

  it('should display view mode toggle buttons', async () => {
    mockGetTasks.mockResolvedValue(mockTasks);

    renderWithRouter(<TasksListPage />);

    await waitFor(() => {
      // Find buttons by role to avoid conflicts with page title
      const buttons = screen.getAllByRole('button');
      const kanbanButton = buttons.find(btn => btn.textContent?.toLowerCase().includes('kanban'));
      const listButton = buttons.find(btn => btn.textContent?.toLowerCase().includes('список'));
      expect(kanbanButton).toBeDefined();
      expect(listButton).toBeDefined();
    });
  });

  it('should show active state for selected view mode', async () => {
    mockGetTasks.mockResolvedValue(mockTasks);

    renderWithRouter(<TasksListPage />);

    await waitFor(() => {
      const kanbanButton = screen.getByText(/kanban/i).closest('button');
      expect(kanbanButton).toHaveClass('active');
    });
  });
});
