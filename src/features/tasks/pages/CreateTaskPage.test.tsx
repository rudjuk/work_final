import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { CreateTaskPage } from './CreateTaskPage';

const mockCreateTask = vi.fn();
const mockNavigate = vi.fn();

// Mock the TaskService
vi.mock('../api', () => ({
  TaskService: class {
    createTask = mockCreateTask;
  },
}));

// Mock react-router-dom navigate
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

describe('CreateTaskPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockCreateTask.mockResolvedValue({ id: '1', title: 'Test Task' });
  });

  it('should have submit button disabled when form is empty', () => {
    renderWithRouter(<CreateTaskPage />);

    const submitButton = screen.getByRole('button', { name: /створити завдання/i });
    expect(submitButton).toBeDisabled();
  });

  it('should have submit button disabled when form is invalid', async () => {
    const user = userEvent.setup();
    renderWithRouter(<CreateTaskPage />);

    // Fill only title with invalid data (empty after clearing)
    const titleInput = screen.getByLabelText(/назва/i);
    await user.type(titleInput, 'Test');
    await user.clear(titleInput);

    const submitButton = screen.getByRole('button', { name: /створити завдання/i });
    expect(submitButton).toBeDisabled();
  });

  it('should enable submit button when form is valid', async () => {
    const user = userEvent.setup();
    renderWithRouter(<CreateTaskPage />);

    const titleInput = screen.getByLabelText(/назва/i);
    const descriptionInput = screen.getByLabelText(/опис/i);

    await user.type(titleInput, 'Test Task');
    await user.type(descriptionInput, 'Test Description');

    const submitButton = screen.getByRole('button', { name: /створити завдання/i });

    await waitFor(() => {
      expect(submitButton).not.toBeDisabled();
    });
  });

  it('should show validation error messages for invalid fields', async () => {
    const user = userEvent.setup();
    renderWithRouter(<CreateTaskPage />);

    const titleInput = screen.getByLabelText(/назва/i);
    await user.type(titleInput, 'Test');
    await user.clear(titleInput);

    await waitFor(() => {
      expect(screen.getByText(/назва є обов'язковим полем/i)).toBeInTheDocument();
    });
  });

  it('should show error message for invalid deadline (past date)', async () => {
    const user = userEvent.setup();
    renderWithRouter(<CreateTaskPage />);

    const titleInput = screen.getByLabelText(/назва/i);
    await user.type(titleInput, 'Test Task');

    // Set deadline to yesterday
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const deadlineInput = screen.getByLabelText(/дедлайн/i);
    await user.type(deadlineInput, yesterday.toISOString().split('T')[0]);

    await waitFor(() => {
      expect(screen.getByText(/дедлайн не може бути в минулому/i)).toBeInTheDocument();
    });
  });

  it('should navigate to tasks list after successful submission', async () => {
    const user = userEvent.setup();
    renderWithRouter(<CreateTaskPage />);

    const titleInput = screen.getByLabelText(/назва/i);
    const descriptionInput = screen.getByLabelText(/опис/i);

    await user.type(titleInput, 'Test Task');
    await user.type(descriptionInput, 'Test Description');

    const submitButton = screen.getByRole('button', { name: /створити завдання/i });

    await waitFor(() => {
      expect(submitButton).not.toBeDisabled();
    });

    await user.click(submitButton);

    await waitFor(() => {
      expect(mockCreateTask).toHaveBeenCalled();
      expect(mockNavigate).toHaveBeenCalledWith('/tasks');
    });
  });

  it('should display all form fields', () => {
    renderWithRouter(<CreateTaskPage />);

    expect(screen.getByLabelText(/назва/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/опис/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/статус/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/пріоритет/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/дедлайн/i)).toBeInTheDocument();
  });

  it('should have default values for status and priority', () => {
    renderWithRouter(<CreateTaskPage />);

    const statusSelect = screen.getByLabelText(/статус/i) as HTMLSelectElement;
    const prioritySelect = screen.getByLabelText(/пріоритет/i) as HTMLSelectElement;

    expect(statusSelect.value).toBe('todo');
    expect(prioritySelect.value).toBe('normal');
  });

  it('should allow selecting review status', async () => {
    const user = userEvent.setup();
    renderWithRouter(<CreateTaskPage />);

    const statusSelect = screen.getByLabelText(/статус/i) as HTMLSelectElement;
    await user.selectOptions(statusSelect, 'review');

    expect(statusSelect.value).toBe('review');
  });

  it('should show validation error for empty description when required', async () => {
    const user = userEvent.setup();
    renderWithRouter(<CreateTaskPage />);

    const titleInput = screen.getByLabelText(/назва/i);
    await user.type(titleInput, 'Test Task');
    await user.clear(titleInput);

    await waitFor(() => {
      expect(screen.getByText(/назва є обов'язковим полем/i)).toBeInTheDocument();
    });
  });
});
