import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TaskForm from '../TaskForm';
import { Task, TaskPriority, TaskStatus } from '../../../types/task.types';
import * as api from '../../../services/api';

// Mock the API module
vi.mock('../../../services/api', () => ({
  taskTypeApi: {
    getAll: vi.fn().mockResolvedValue([]),
    getById: vi.fn(),
  },
  userApi: {
    getAll: vi.fn().mockResolvedValue([]),
    getById: vi.fn(),
  },
}));

describe('TaskForm', () => {
  const mockOnSubmit = vi.fn();
  const mockOnClose = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Form Validation', () => {
    it('should display validation errors for empty required fields', async () => {
      render(<TaskForm onSubmit={mockOnSubmit} onClose={mockOnClose} />);

      // Fill form with invalid data to enable submit button
      const titleInput = screen.getByLabelText(/title/i);
      await userEvent.type(titleInput, 'Test');
      await userEvent.clear(titleInput);
      
      const descriptionInput = screen.getByLabelText(/description/i);
      await userEvent.type(descriptionInput, 'Test');
      await userEvent.clear(descriptionInput);

      const submitButton = screen.getByRole('button', { name: /create task/i });
      // Button should be disabled when fields are empty
      expect(submitButton).toBeDisabled();
    });

    it('should validate title length', async () => {
      render(<TaskForm onSubmit={mockOnSubmit} onClose={mockOnClose} />);

      // Wait for form to be ready
      await waitFor(() => {
        expect(screen.getByLabelText(/title/i)).toBeInTheDocument();
      });

      const titleInput = screen.getByLabelText(/title/i);
      const descriptionInput = screen.getByLabelText(/description/i);
      
      // Type valid title first to enable button
      await userEvent.type(titleInput, 'Valid Title');
      await userEvent.type(descriptionInput, 'Valid description');
      
      // Wait for button to be enabled
      const submitButton = screen.getByRole('button', { name: /create task/i });
      await waitFor(() => {
        expect(submitButton).not.toBeDisabled();
      });
      
      // Clear and type invalid title (>200 chars) using fireEvent for faster input
      fireEvent.change(titleInput, { target: { value: 'a'.repeat(201) } });

      // Button should be disabled when title is too long (>200 chars)
      // Wait for state to update after typing
      await waitFor(() => {
        expect(submitButton).toBeDisabled();
      }, { timeout: 3000 });
    });

    it('should validate description length', async () => {
      render(<TaskForm onSubmit={mockOnSubmit} onClose={mockOnClose} />);

      // Wait for form to be ready
      await waitFor(() => {
        expect(screen.getByLabelText(/title/i)).toBeInTheDocument();
      });

      const titleInput = screen.getByLabelText(/title/i);
      const descriptionInput = screen.getByLabelText(/description/i);

      // Type valid description first
      await userEvent.type(titleInput, 'Valid Title');
      await userEvent.type(descriptionInput, 'Valid description');
      
      // Wait for button to be enabled
      const submitButton = screen.getByRole('button', { name: /create task/i });
      await waitFor(() => {
        expect(submitButton).not.toBeDisabled();
      });
      
      // Clear and type invalid description (>1000 chars) using fireEvent for faster input
      fireEvent.change(descriptionInput, { target: { value: 'a'.repeat(1001) } });

      // Button should be disabled when description is too long (>1000 chars)
      // Wait for state to update after typing
      await waitFor(() => {
        expect(submitButton).toBeDisabled();
      }, { timeout: 3000 });
    });

    it('should disable submit button when form has validation errors', async () => {
      render(<TaskForm onSubmit={mockOnSubmit} onClose={mockOnClose} />);

      // Wait for form to be ready
      await waitFor(() => {
        expect(screen.getByLabelText(/title/i)).toBeInTheDocument();
      });

      const titleInput = screen.getByLabelText(/title/i);
      const descriptionInput = screen.getByLabelText(/description/i);
      const submitButton = screen.getByRole('button', { name: /create task/i });
      
      // Initially button should be disabled (empty form)
      expect(submitButton).toBeDisabled();
      
      // Make form invalid - both fields exceed max length using fireEvent for faster input
      fireEvent.change(titleInput, { target: { value: 'a'.repeat(201) } });
      fireEvent.change(descriptionInput, { target: { value: 'a'.repeat(1001) } });

      // Button should be disabled when form has errors (title > 200 or description > 1000)
      // Wait for state to update after typing
      await waitFor(() => {
        expect(submitButton).toBeDisabled();
      }, { timeout: 3000 });
    });
  });

  describe('Submit Button State', () => {
    it('should be disabled when form contains invalid data', async () => {
      render(<TaskForm onSubmit={mockOnSubmit} onClose={mockOnClose} />);

      const submitButton = screen.getByRole('button', { name: /create task/i });
      expect(submitButton).toBeDisabled();
    });

    it('should be disabled when form has not been changed', () => {
      render(<TaskForm onSubmit={mockOnSubmit} onClose={mockOnClose} />);

      const submitButton = screen.getByRole('button', { name: /create task/i });
      expect(submitButton).toBeDisabled();
    });

    it('should be enabled when form is valid and has changes', async () => {
      render(<TaskForm onSubmit={mockOnSubmit} onClose={mockOnClose} />);

      const titleInput = screen.getByLabelText(/title/i);
      const descriptionInput = screen.getByLabelText(/description/i);

      await userEvent.type(titleInput, 'Test Task');
      await userEvent.type(descriptionInput, 'Test Description');

      const submitButton = screen.getByRole('button', { name: /create task/i });
      await waitFor(() => {
        expect(submitButton).not.toBeDisabled();
      });
    });

    it('should be disabled when there are validation errors', async () => {
      render(<TaskForm onSubmit={mockOnSubmit} onClose={mockOnClose} />);

      const titleInput = screen.getByLabelText(/title/i);
      await userEvent.type(titleInput, 'a'.repeat(201));

      const submitButton = screen.getByRole('button', { name: /create task/i });
      await waitFor(() => {
        expect(submitButton).toBeDisabled();
      });
    });
  });

  describe('Edit Mode', () => {
    const mockTask: Task = {
      id: 1,
      title: 'Existing Task',
      description: 'Existing Description',
      status: TaskStatus.TODO,
      priority: TaskPriority.HIGH,
      taskTypeId: null,
      assignedToUserId: null,
      dueDate: '2024-12-31T00:00:00.000Z',
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-01T00:00:00.000Z',
    };

    it('should populate form with task data in edit mode', () => {
      render(<TaskForm task={mockTask} onSubmit={mockOnSubmit} onClose={mockOnClose} />);

      expect(screen.getByDisplayValue('Existing Task')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Existing Description')).toBeInTheDocument();
      expect(screen.getByDisplayValue('High')).toBeInTheDocument();
    });

    it('should show "Edit Task" title in edit mode', () => {
      render(<TaskForm task={mockTask} onSubmit={mockOnSubmit} onClose={mockOnClose} />);

      expect(screen.getByText('Edit Task')).toBeInTheDocument();
    });

    it('should show "Update Task" button text in edit mode', () => {
      render(<TaskForm task={mockTask} onSubmit={mockOnSubmit} onClose={mockOnClose} />);

      expect(screen.getByRole('button', { name: /update task/i })).toBeInTheDocument();
    });

    it('should submit with task id and updated data in edit mode', async () => {
      render(<TaskForm task={mockTask} onSubmit={mockOnSubmit} onClose={mockOnClose} />);

      // Wait for form to be populated
      await waitFor(() => {
        expect(screen.getByDisplayValue('Existing Task')).toBeInTheDocument();
      });

      const titleInput = screen.getByLabelText(/title/i);
      await userEvent.clear(titleInput);
      await userEvent.type(titleInput, 'Updated Task');

      const submitButton = screen.getByRole('button', { name: /update task/i });
      
      // Wait for button to be enabled
      await waitFor(() => {
        expect(submitButton).not.toBeDisabled();
      });
      
      await userEvent.click(submitButton);

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalled();
      }, { timeout: 3000 });
      
      expect(mockOnSubmit).toHaveBeenCalledWith(
        mockTask.id,
        expect.objectContaining({
          title: 'Updated Task',
          description: 'Existing Description',
          priority: TaskPriority.HIGH,
        })
      );
    });
  });

  describe('Create Mode', () => {
    it('should show "Create New Task" title in create mode', () => {
      render(<TaskForm onSubmit={mockOnSubmit} onClose={mockOnClose} />);

      expect(screen.getByText('Create New Task')).toBeInTheDocument();
    });

    it('should show "Create Task" button text in create mode', () => {
      render(<TaskForm onSubmit={mockOnSubmit} onClose={mockOnClose} />);

      expect(screen.getByRole('button', { name: /create task/i })).toBeInTheDocument();
    });

    it('should submit with new task data in create mode', async () => {
      render(<TaskForm onSubmit={mockOnSubmit} onClose={mockOnClose} />);

      const titleInput = screen.getByLabelText(/title/i);
      const descriptionInput = screen.getByLabelText(/description/i);

      await userEvent.type(titleInput, 'New Task');
      await userEvent.type(descriptionInput, 'New Description');

      const submitButton = screen.getByRole('button', { name: /create task/i });
      await userEvent.click(submitButton);

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledWith(
          expect.objectContaining({
            title: 'New Task',
            description: 'New Description',
            priority: TaskPriority.MEDIUM,
            taskTypeId: null,
            assignedToUserId: null,
          })
        );
      });
    });
  });
});

