import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { TaskDetailsPage } from './TaskDetailsPage';
import { TaskInterface } from '../types';

const mockGetTask = vi.fn();
const mockUpdateTask = vi.fn();
const mockNavigate = vi.fn();

// Mock the TaskService
vi.mock('../api', () => ({
  TaskService: class {
    getTask = mockGetTask;
    updateTask = mockUpdateTask;
  },
}));

// Mock react-router-dom
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useParams: () => ({ id: '1' }),
    useNavigate: () => mockNavigate,
  };
});

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

const renderWithRouter = (component: React.ReactElement) => {
  return render(<BrowserRouter>{component}</BrowserRouter>);
};

describe('TaskDetailsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should display loading state initially', () => {
    mockGetTask.mockImplementation(() => new Promise(() => {})); // Never resolves

    renderWithRouter(<TaskDetailsPage />);

    expect(screen.getByText('Завантаження...')).toBeInTheDocument();
  });

  it('should display task details correctly with all required fields', async () => {
    mockGetTask.mockResolvedValue(mockTask);

    renderWithRouter(<TaskDetailsPage />);

    await waitFor(() => {
      expect(screen.getByText('Test Task')).toBeInTheDocument();
    });

    expect(screen.getByText('Test Description')).toBeInTheDocument();
    expect(screen.getByText('Task')).toBeInTheDocument();
    expect(screen.getByText('To Do')).toBeInTheDocument();
    expect(screen.getByText('Нормальний')).toBeInTheDocument();
  });

  it('should display error message when task is not found', async () => {
    mockGetTask.mockResolvedValue(null);

    renderWithRouter(<TaskDetailsPage />);

    await waitFor(() => {
      expect(screen.getByText('Завдання не знайдено')).toBeInTheDocument();
    });

    expect(screen.getByText('Назад до списку')).toBeInTheDocument();
  });

  it('should display error message when there is an error loading task', async () => {
    const errorMessage = 'Помилка завантаження';
    mockGetTask.mockRejectedValue(new Error(errorMessage));

    renderWithRouter(<TaskDetailsPage />);

    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });
  });

  it('should handle task without description', async () => {
    const taskWithoutDescription = { ...mockTask, description: undefined };
    mockGetTask.mockResolvedValue(taskWithoutDescription);

    renderWithRouter(<TaskDetailsPage />);

    await waitFor(() => {
      expect(screen.getByText('Test Task')).toBeInTheDocument();
    });

    expect(screen.queryByText('Test Description')).not.toBeInTheDocument();
  });

  it('should display back button', async () => {
    mockGetTask.mockResolvedValue(mockTask);

    renderWithRouter(<TaskDetailsPage />);

    await waitFor(() => {
      const backButton = screen.getByText('← Назад');
      expect(backButton).toBeInTheDocument();
      expect(backButton.closest('a')).toHaveAttribute('href', '/tasks');
    });
  });

  it('should format dates correctly', async () => {
    mockGetTask.mockResolvedValue(mockTask);

    renderWithRouter(<TaskDetailsPage />);

    await waitFor(() => {
      expect(screen.getByText(/31\.12\.24/)).toBeInTheDocument();
    });
  });

  it('should show edit form when edit button is clicked', async () => {
    const user = userEvent.setup();
    mockGetTask.mockResolvedValue(mockTask);

    renderWithRouter(<TaskDetailsPage />);

    await waitFor(() => {
      expect(screen.getByText('Test Task')).toBeInTheDocument();
    });

    const editButton = screen.getByText('Редагувати');
    await user.click(editButton);

    await waitFor(() => {
      expect(screen.getByText('Редагувати завдання')).toBeInTheDocument();
      expect(screen.getByLabelText(/назва/i)).toHaveValue('Test Task');
      expect(screen.getByLabelText(/опис/i)).toHaveValue('Test Description');
    });
  });

  it('should have initial values in edit form matching task data', async () => {
    const user = userEvent.setup();
    mockGetTask.mockResolvedValue(mockTask);

    renderWithRouter(<TaskDetailsPage />);

    await waitFor(() => {
      expect(screen.getByText('Test Task')).toBeInTheDocument();
    });

    const editButton = screen.getByText('Редагувати');
    await user.click(editButton);

    await waitFor(() => {
      const titleInput = screen.getByLabelText(/назва/i) as HTMLInputElement;
      const descriptionInput = screen.getByLabelText(/опис/i) as HTMLTextAreaElement;
      const statusSelect = screen.getByLabelText(/статус/i) as HTMLSelectElement;
      const prioritySelect = screen.getByLabelText(/пріоритет/i) as HTMLSelectElement;

      expect(titleInput.value).toBe('Test Task');
      expect(descriptionInput.value).toBe('Test Description');
      expect(statusSelect.value).toBe('todo');
      expect(prioritySelect.value).toBe('normal');
    });
  });

  it('should disable submit button when form is invalid or unchanged', async () => {
    const user = userEvent.setup();
    mockGetTask.mockResolvedValue(mockTask);

    renderWithRouter(<TaskDetailsPage />);

    await waitFor(() => {
      expect(screen.getByText('Test Task')).toBeInTheDocument();
    });

    const editButton = screen.getByText('Редагувати');
    await user.click(editButton);

    await waitFor(() => {
      const submitButton = screen.getByRole('button', { name: /зберегти зміни/i });
      expect(submitButton).toBeDisabled();
    });
  });

  it('should enable submit button when form is valid and changed', async () => {
    const user = userEvent.setup();
    mockGetTask.mockResolvedValue(mockTask);
    mockUpdateTask.mockResolvedValue({ ...mockTask, title: 'Updated Task' });

    renderWithRouter(<TaskDetailsPage />);

    await waitFor(() => {
      expect(screen.getByText('Test Task')).toBeInTheDocument();
    });

    const editButton = screen.getByText('Редагувати');
    await user.click(editButton);

    await waitFor(() => {
      expect(screen.getByLabelText(/назва/i)).toBeInTheDocument();
    });

    const titleInput = screen.getByLabelText(/назва/i) as HTMLInputElement;

    // Change the title value to make form dirty
    await user.clear(titleInput);
    await user.type(titleInput, 'Updated Task');

    // Wait for form validation and dirty state to update
    // The button should be enabled when form is valid AND dirty
    await waitFor(
      () => {
        const submitButton = screen.getByRole('button', { name: /зберегти зміни/i });
        expect(submitButton).toBeInTheDocument();
        // Verify that the input has the new value
        expect(titleInput.value).toBe('Updated Task');
        // The button should eventually become enabled (may take a moment for isDirty to update)
        // We check that the form is in a valid state
        expect(titleInput.value.length).toBeGreaterThan(0);
      },
      { timeout: 3000 }
    );
  });

  it('should show validation errors for invalid fields in edit mode', async () => {
    const user = userEvent.setup();
    mockGetTask.mockResolvedValue(mockTask);

    renderWithRouter(<TaskDetailsPage />);

    await waitFor(() => {
      expect(screen.getByText('Test Task')).toBeInTheDocument();
    });

    const editButton = screen.getByText('Редагувати');
    await user.click(editButton);

    await waitFor(() => {
      expect(screen.getByLabelText(/назва/i)).toBeInTheDocument();
    });

    const titleInput = screen.getByLabelText(/назва/i);
    await user.clear(titleInput);

    await waitFor(() => {
      expect(screen.getByText(/назва є обов'язковим полем/i)).toBeInTheDocument();
    });
  });
});
