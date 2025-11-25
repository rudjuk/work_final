import { useState, useEffect } from 'react';
import { Task, TaskPriority, TaskStatus } from '../../types/task.types';
import { TaskType } from '../../types/task-type.types';
import { User } from '../../types/user.types';
import { taskTypeApi, userApi } from '../../services/api';
import TaskTypeDirectory from '../TaskTypeDirectory/TaskTypeDirectory';
import UserDirectory from '../UserDirectory/UserDirectory';
import './TaskForm.css';

interface TaskFormProps {
  task?: Task | null;
  onSubmit: (
    idOrData:
      | number
      | { title: string; description: string; priority: TaskPriority; dueDate?: string | null },
    data?: {
      title?: string;
      description?: string;
      status?: TaskStatus;
      priority?: TaskPriority;
      dueDate?: string | null;
    }
  ) => Promise<void>;
  onClose: () => void;
}

interface FormData {
  title: string;
  description: string;
  priority: TaskPriority;
  taskTypeId: number | null;
  assignedToUserId: number | null;
  dueDate: string;
}

interface FormErrors {
  title?: string;
  description?: string;
  priority?: string;
  dueDate?: string;
}

function TaskForm({ task, onSubmit, onClose }: TaskFormProps) {
  const [formData, setFormData] = useState<FormData>({
    title: '',
    description: '',
    priority: TaskPriority.MEDIUM,
    taskTypeId: null,
    dueDate: '',
  });

  const [taskTypes, setTaskTypes] = useState<TaskType[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [selectedTaskType, setSelectedTaskType] = useState<TaskType | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showDirectory, setShowDirectory] = useState(false);
  const [showUserDirectory, setShowUserDirectory] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    loadTaskTypes();
    loadUsers();
  }, []);

  useEffect(() => {
    if (task) {
      const initialData = {
        title: task.title,
        description: task.description,
        priority: task.priority,
        taskTypeId: task.taskTypeId,
        assignedToUserId: task.assignedToUserId,
        dueDate: task.dueDate ? task.dueDate.split('T')[0] : '',
      };
      setFormData(initialData);
      if (task.taskTypeId) {
        // Wait for taskTypes to load before setting selected type
        if (taskTypes.length > 0) {
          const type = taskTypes.find((t) => t.id === task.taskTypeId);
          if (type) {
            setSelectedTaskType(type);
          } else {
            loadSelectedTaskType(task.taskTypeId);
          }
        } else {
          loadSelectedTaskType(task.taskTypeId);
        }
      } else {
        setSelectedTaskType(null);
      }
      if (task.assignedToUserId) {
        if (users.length > 0) {
          const user = users.find((u) => u.id === task.assignedToUserId);
          if (user) {
            setSelectedUser(user);
          } else {
            loadSelectedUser(task.assignedToUserId);
          }
        } else {
          loadSelectedUser(task.assignedToUserId);
        }
      } else {
        setSelectedUser(null);
      }
    } else {
      // Reset form when creating new task
      setFormData({
        title: '',
        description: '',
        priority: TaskPriority.MEDIUM,
        taskTypeId: null,
        assignedToUserId: null,
        dueDate: '',
      });
      setSelectedTaskType(null);
      setSelectedUser(null);
    }
  }, [task, taskTypes, users]);

  const loadTaskTypes = async () => {
    try {
      const data = await taskTypeApi.getAll();
      setTaskTypes(data);
    } catch (error) {
      console.error('Failed to load task types:', error);
    }
  };

  const loadUsers = async () => {
    try {
      const data = await userApi.getAll();
      setUsers(data);
    } catch (error) {
      console.error('Failed to load users:', error);
    }
  };

  const loadSelectedTaskType = async (id: number) => {
    try {
      // First try to find in already loaded task types
      const existingType = taskTypes.find((t) => t.id === id);
      if (existingType) {
        setSelectedTaskType(existingType);
        return;
      }
      // If not found, fetch from API
      const type = await taskTypeApi.getById(id);
      setSelectedTaskType(type);
    } catch (error) {
      console.error('Failed to load task type:', error);
      setSelectedTaskType(null);
    }
  };

  const loadSelectedUser = async (id: number) => {
    try {
      const existingUser = users.find((u) => u.id === id);
      if (existingUser) {
        setSelectedUser(existingUser);
        return;
      }
      const user = await userApi.getById(id);
      setSelectedUser(user);
    } catch (error) {
      console.error('Failed to load user:', error);
      setSelectedUser(null);
    }
  };

  const handleTaskTypeSelect = (taskType: TaskType) => {
    setSelectedTaskType(taskType);
    setFormData((prev) => ({ ...prev, taskTypeId: taskType.id }));
    setHasChanges(true);
  };

  const handleUserSelect = (user: User) => {
    setSelectedUser(user);
    setFormData((prev) => ({ ...prev, assignedToUserId: user.id }));
    setHasChanges(true);
  };

  const validate = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    } else if (formData.title.length > 200) {
      newErrors.title = 'Title must be less than 200 characters';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    } else if (formData.description.length > 1000) {
      newErrors.description = 'Description must be less than 1000 characters';
    }

    if (!formData.priority) {
      newErrors.priority = 'Priority is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (field: keyof FormData, value: string | TaskPriority | number | null) => {
    setFormData((prev) => {
      const newData = { ...prev, [field]: value };
      // Validate field immediately if it's a string field
      if (typeof value === 'string' && (field === 'title' || field === 'description')) {
        const fieldErrors: FormErrors = {};
        if (field === 'title') {
          if (!value.trim()) {
            fieldErrors.title = 'Title is required';
          } else if (value.length > 200) {
            fieldErrors.title = 'Title must be less than 200 characters';
          }
        } else if (field === 'description') {
          if (!value.trim()) {
            fieldErrors.description = 'Description is required';
          } else if (value.length > 1000) {
            fieldErrors.description = 'Description must be less than 1000 characters';
          }
        }
        if (Object.keys(fieldErrors).length > 0) {
          setErrors((prev) => ({ ...prev, ...fieldErrors }));
        } else {
          setErrors((prev) => {
            const newErrors = { ...prev };
            delete newErrors[field as keyof FormErrors];
            return newErrors;
          });
        }
      } else if (errors[field as keyof FormErrors]) {
        setErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors[field as keyof FormErrors];
          return newErrors;
        });
      }
      return newData;
    });
    setHasChanges(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    setIsSubmitting(true);
    try {
      const submitData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        priority: formData.priority,
        taskTypeId: formData.taskTypeId,
        assignedToUserId: formData.assignedToUserId,
        dueDate: formData.dueDate && formData.dueDate.trim() ? formData.dueDate : null,
      };

      if (task) {
        await onSubmit(task.id, submitData);
      } else {
        await onSubmit(submitData);
      }
    } catch (error: any) {
      console.error('Form submission error:', error);
      // Handle validation errors from backend
      if (error?.response?.data?.details) {
        const backendErrors: FormErrors = {};
        error.response.data.details.forEach((err: { path: string; message: string }) => {
          const field = err.path as keyof FormErrors;
          if (field in formData) {
            backendErrors[field] = err.message;
          }
        });
        setErrors(backendErrors);
      } else if (error?.response?.data?.error) {
        // General error message
        alert(error.response.data.error);
      } else {
        alert('Failed to save task. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFormValid = 
    formData.title.trim() && 
    formData.title.trim().length <= 200 &&
    formData.description.trim() && 
    formData.description.trim().length <= 1000 &&
    formData.priority;
  const isSubmitDisabled = !isFormValid || !hasChanges || isSubmitting || Object.keys(errors).length > 0;

  return (
    <div className="task-form-overlay" onClick={onClose}>
      <div className="task-form-modal" onClick={(e) => e.stopPropagation()}>
        <div className="task-form-header">
          <h2>{task ? 'Edit Task' : 'Create New Task'}</h2>
          <button className="task-form-close" onClick={onClose} aria-label="Close form">
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="task-form">
          <div className="task-form-field">
            <label htmlFor="title">
              Title <span className="required">*</span>
            </label>
            <input
              id="title"
              type="text"
              value={formData.title}
              onChange={(e) => handleChange('title', e.target.value)}
              className={errors.title ? 'error' : ''}
              maxLength={200}
            />
            {errors.title && <span className="error-message">{errors.title}</span>}
          </div>

          <div className="task-form-field">
            <label htmlFor="description">
              Description <span className="required">*</span>
            </label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              className={errors.description ? 'error' : ''}
              rows={4}
              maxLength={1000}
            />
            {errors.description && <span className="error-message">{errors.description}</span>}
          </div>

          <div className="task-form-field">
            <label htmlFor="priority">
              Priority <span className="required">*</span>
            </label>
            <select
              id="priority"
              value={formData.priority}
              onChange={(e) => handleChange('priority', e.target.value as TaskPriority)}
              className={errors.priority ? 'error' : ''}
            >
              <option value={TaskPriority.LOW}>Low</option>
              <option value={TaskPriority.MEDIUM}>Medium</option>
              <option value={TaskPriority.HIGH}>High</option>
            </select>
            {errors.priority && <span className="error-message">{errors.priority}</span>}
          </div>

          <div className="task-form-field">
            <label htmlFor="taskType">Task Type</label>
            <div className="task-type-selector">
              <select
                id="taskType"
                value={formData.taskTypeId || ''}
                onChange={(e) => {
                  const value = e.target.value ? parseInt(e.target.value, 10) : null;
                  handleChange('taskTypeId', value);
                  const type = taskTypes.find((t) => t.id === value);
                  setSelectedTaskType(type || null);
                }}
              >
                <option value="">No type</option>
                {taskTypes.map((type) => (
                  <option key={type.id} value={type.id}>
                    {type.name}
                  </option>
                ))}
              </select>
              <button
                type="button"
                className="btn-directory"
                onClick={() => setShowDirectory(true)}
                title="Open Task Types Directory"
              >
                📋
              </button>
            </div>
            {selectedTaskType && (
              <div className="task-type-preview">
                <span
                  className="task-type-badge"
                  style={{
                    backgroundColor: selectedTaskType.color
                      ? selectedTaskType.color + '20'
                      : '#e8f0fe',
                    color: selectedTaskType.color || '#1a73e8',
                  }}
                >
                  {selectedTaskType.name}
                </span>
              </div>
            )}
          </div>

          <div className="task-form-field">
            <label htmlFor="assignedToUser">Assigned To</label>
            <div className="task-user-selector">
              <select
                id="assignedToUser"
                value={formData.assignedToUserId || ''}
                onChange={(e) => {
                  const value = e.target.value ? parseInt(e.target.value, 10) : null;
                  handleChange('assignedToUserId', value);
                  const user = users.find((u) => u.id === value);
                  setSelectedUser(user || null);
                }}
              >
                <option value="">No user</option>
                {users.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.fullName || user.username}
                  </option>
                ))}
              </select>
              <button
                type="button"
                className="btn-directory"
                onClick={() => setShowUserDirectory(true)}
                title="Open Users Directory"
              >
                👥
              </button>
            </div>
            {selectedUser && (
              <div className="task-user-preview">
                <span className="task-user-badge">
                  {selectedUser.fullName || selectedUser.username}
                </span>
              </div>
            )}
          </div>

          <div className="task-form-field">
            <label htmlFor="dueDate">Due Date</label>
            <input
              id="dueDate"
              type="date"
              value={formData.dueDate}
              onChange={(e) => handleChange('dueDate', e.target.value)}
              className={errors.dueDate ? 'error' : ''}
            />
            {errors.dueDate && <span className="error-message">{errors.dueDate}</span>}
          </div>

          <div className="task-form-actions">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={isSubmitDisabled}>
              {isSubmitting ? 'Saving...' : task ? 'Update Task' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>

      {showDirectory && (
        <TaskTypeDirectory
          onClose={() => {
            setShowDirectory(false);
            loadTaskTypes();
          }}
          onSelect={handleTaskTypeSelect}
        />
      )}

      {showUserDirectory && (
        <UserDirectory
          onClose={() => {
            setShowUserDirectory(false);
            loadUsers();
          }}
          onSelect={handleUserSelect}
        />
      )}
    </div>
  );
}

export default TaskForm;

