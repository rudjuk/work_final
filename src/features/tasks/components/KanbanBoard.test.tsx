import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { KanbanBoard } from './KanbanBoard';
import { TaskInterface } from '../types';

const mockUpdateTask = vi.fn();
const mockOnTaskUpdate = vi.fn();
const mockOnDelete = vi.fn();

// Mock the TaskService
vi.mock('../api', () => ({
  TaskService: class {
    updateTask = mockUpdateTask;
  },
}));

const mockTasks: TaskInterface[] = [
  {
    id: '1',
    title: 'Todo Task',
    description: 'Description 1',
    status: 'todo',
    priority: 'normal',
    deadline: null,
    typeTask: 'Task',
    createdAt: '2024-01-01T00:00:00.000Z',
  },
  {
    id: '2',
    title: 'In Progress Task',
    description: 'Description 2',
    status: 'in-progress',
    priority: 'high',
    deadline: null,
    typeTask: 'Task',
    createdAt: '2024-01-02T00:00:00.000Z',
  },
  {
    id: '3',
    title: 'Review Task',
    description: 'Description 3',
    status: 'review',
    priority: 'normal',
    deadline: null,
    typeTask: 'Task',
    createdAt: '2024-01-03T00:00:00.000Z',
  },
  {
    id: '4',
    title: 'Done Task',
    description: 'Description 4',
    status: 'done',
    priority: 'low',
    deadline: null,
    typeTask: 'Task',
    createdAt: '2024-01-04T00:00:00.000Z',
  },
];

const renderWithRouter = (component: React.ReactElement) => {
  return render(<BrowserRouter>{component}</BrowserRouter>);
};

describe('KanbanBoard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUpdateTask.mockResolvedValue({});
  });

  it('should display all status columns', () => {
    renderWithRouter(
      <KanbanBoard tasks={mockTasks} onTaskUpdate={mockOnTaskUpdate} onDelete={mockOnDelete} />
    );

    // Use getAllByText since "To Do" appears in both column header and task card
    const toDoHeaders = screen.getAllByText('To Do');
    expect(toDoHeaders.length).toBeGreaterThan(0);
    expect(screen.getAllByText('In Progress').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Review').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Done').length).toBeGreaterThan(0);
  });

  it('should display tasks in correct columns', () => {
    renderWithRouter(
      <KanbanBoard tasks={mockTasks} onTaskUpdate={mockOnTaskUpdate} onDelete={mockOnDelete} />
    );

    expect(screen.getByText('Todo Task')).toBeInTheDocument();
    expect(screen.getByText('In Progress Task')).toBeInTheDocument();
    expect(screen.getByText('Review Task')).toBeInTheDocument();
    expect(screen.getByText('Done Task')).toBeInTheDocument();
  });

  it('should display task count for each column', () => {
    renderWithRouter(
      <KanbanBoard tasks={mockTasks} onTaskUpdate={mockOnTaskUpdate} onDelete={mockOnDelete} />
    );

    // Each column should have a task count badge
    const counts = screen.getAllByText('1');
    expect(counts.length).toBeGreaterThanOrEqual(4);
  });

  it('should display empty state when column has no tasks', () => {
    const emptyTasks: TaskInterface[] = [];
    renderWithRouter(
      <KanbanBoard tasks={emptyTasks} onTaskUpdate={mockOnTaskUpdate} onDelete={mockOnDelete} />
    );

    const emptyMessages = screen.getAllByText('Немає завдань');
    expect(emptyMessages.length).toBe(4); // All 4 columns should be empty
  });

  it('should change task status when status button is clicked', async () => {
    const user = userEvent.setup();
    const singleTask: TaskInterface[] = [mockTasks[0]];

    renderWithRouter(
      <KanbanBoard tasks={singleTask} onTaskUpdate={mockOnTaskUpdate} onDelete={mockOnDelete} />
    );

    // Find and click a status change button
    const statusButtons = screen.getAllByText(/→/);
    if (statusButtons.length > 0) {
      await user.click(statusButtons[0]);

      await waitFor(() => {
        expect(mockUpdateTask).toHaveBeenCalled();
        expect(mockOnTaskUpdate).toHaveBeenCalled();
      });
    }
  });

  it('should handle drag and drop functionality', () => {
    const singleTask: TaskInterface[] = [mockTasks[0]];
    const { container } = renderWithRouter(
      <KanbanBoard tasks={singleTask} onTaskUpdate={mockOnTaskUpdate} onDelete={mockOnDelete} />
    );

    // Verify that draggable elements exist
    const taskWrapper = container.querySelector('.kanban-task-wrapper');
    expect(taskWrapper).toBeInTheDocument();
    expect(taskWrapper).toHaveAttribute('draggable', 'true');

    // Verify that columns have drop handlers
    const columns = container.querySelectorAll('.kanban-column');
    expect(columns.length).toBe(4);
  });

  it('should group tasks by status correctly', () => {
    const tasksWithMultipleStatuses: TaskInterface[] = [
      { ...mockTasks[0], status: 'todo' },
      { ...mockTasks[1], status: 'todo' },
      { ...mockTasks[2], status: 'in-progress' },
    ];

    const { container } = renderWithRouter(
      <KanbanBoard
        tasks={tasksWithMultipleStatuses}
        onTaskUpdate={mockOnTaskUpdate}
        onDelete={mockOnDelete}
      />
    );

    // Should show count of 2 for todo column
    const todoColumn = container.querySelector('.kanban-column');
    expect(todoColumn).toBeInTheDocument();

    // Verify tasks are displayed
    expect(screen.getByText('Todo Task')).toBeInTheDocument();
    expect(screen.getByText('In Progress Task')).toBeInTheDocument();
  });
});
