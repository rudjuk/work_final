import { useState, useEffect } from 'react';
import { User, CreateUserDto, UpdateUserDto } from '../../types/user.types';
import { userApi } from '../../services/api';
import './UserDirectory.css';

interface UserDirectoryProps {
  onClose: () => void;
  onSelect?: (user: User) => void;
}

function UserDirectory({ onClose, onSelect }: UserDirectoryProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formData, setFormData] = useState<CreateUserDto>({
    username: '',
    password: '',
    email: '',
    fullName: '',
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const data = await userApi.getAll();
      setUsers(data);
    } catch (error) {
      console.error('Failed to load users:', error);
      alert('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.username.trim()) {
      errors.username = 'Username is required';
    } else if (formData.username.length < 3) {
      errors.username = 'Username must be at least 3 characters';
    } else if (formData.username.length > 50) {
      errors.username = 'Username must be less than 50 characters';
    }

    if (!editingUser && !formData.password.trim()) {
      errors.password = 'Password is required';
    } else if (formData.password && formData.password.length < 3) {
      errors.password = 'Password must be at least 3 characters';
    }

    if (formData.email && formData.email.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        errors.email = 'Invalid email format';
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleCreate = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      await userApi.create(formData);
      await loadUsers();
      setShowForm(false);
      setFormData({ username: '', password: '', email: '', fullName: '' });
      setFormErrors({});
    } catch (error: any) {
      console.error('Failed to create user:', error);
      if (error?.response?.data?.details) {
        const errors: Record<string, string> = {};
        error.response.data.details.forEach((err: { path: string[]; message: string }) => {
          const field = err.path[0];
          errors[field] = err.message;
        });
        setFormErrors(errors);
      } else if (error?.response?.data?.error) {
        alert(`Failed to create user: ${error.response.data.error}`);
      } else {
        alert('Failed to create user. Please check the form fields.');
      }
    }
  };

  const handleUpdate = async () => {
    if (!editingUser) return;
    
    if (!validateForm()) {
      return;
    }

    try {
      await userApi.update(editingUser.id, formData);
      await loadUsers();
      setShowForm(false);
      setEditingUser(null);
      setFormData({ username: '', password: '', email: '', fullName: '' });
      setFormErrors({});
    } catch (error: any) {
      console.error('Failed to update user:', error);
      if (error?.response?.data?.details) {
        const errors: Record<string, string> = {};
        error.response.data.details.forEach((err: { path: string[]; message: string }) => {
          const field = err.path[0];
          errors[field] = err.message;
        });
        setFormErrors(errors);
      } else if (error?.response?.data?.error) {
        alert(`Failed to update user: ${error.response.data.error}`);
      } else {
        alert('Failed to update user. Please check the form fields.');
      }
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this user?')) {
      return;
    }
    try {
      await userApi.delete(id);
      await loadUsers();
    } catch (error) {
      console.error('Failed to delete user:', error);
      alert('Failed to delete user');
    }
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setFormData({
      username: user.username,
      password: '', // Don't show password
      email: user.email || '',
      fullName: user.fullName || '',
    });
    setShowForm(true);
  };

  const handleSelect = (user: User) => {
    if (onSelect) {
      onSelect(user);
    }
    onClose();
  };

  const handleNew = () => {
    setEditingUser(null);
    setFormData({ username: '', password: '', email: '', fullName: '' });
    setFormErrors({});
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingUser(null);
    setFormData({ username: '', password: '', email: '', fullName: '' });
    setFormErrors({});
  };

  if (loading) {
    return (
      <div className="user-directory-overlay" onClick={onClose}>
        <div className="user-directory-modal" onClick={(e) => e.stopPropagation()}>
          <div className="user-directory-loading">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="user-directory-overlay" onClick={onClose}>
      <div className="user-directory-modal" onClick={(e) => e.stopPropagation()}>
        <div className="user-directory-header">
          <h2>Users Directory</h2>
          <button className="user-directory-close" onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>

        <div className="user-directory-content">
          <div className="user-directory-actions">
            <button className="btn-primary" onClick={handleNew}>
              + New User
            </button>
          </div>

          {showForm && (
            <div className="user-form">
              <h3>{editingUser ? 'Edit User' : 'New User'}</h3>
              <div className="user-form-field">
                <label>Username *</label>
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) => {
                    setFormData({ ...formData, username: e.target.value });
                    if (formErrors.username) {
                      setFormErrors({ ...formErrors, username: '' });
                    }
                  }}
                  placeholder="Username"
                  className={formErrors.username ? 'error' : ''}
                />
                {formErrors.username && <span className="error-message">{formErrors.username}</span>}
              </div>
              <div className="user-form-field">
                <label>Password {editingUser ? '(leave empty to keep current)' : '*'}</label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => {
                    setFormData({ ...formData, password: e.target.value });
                    if (formErrors.password) {
                      setFormErrors({ ...formErrors, password: '' });
                    }
                  }}
                  placeholder="Password"
                  className={formErrors.password ? 'error' : ''}
                />
                {formErrors.password && <span className="error-message">{formErrors.password}</span>}
              </div>
              <div className="user-form-field">
                <label>Email</label>
                <input
                  type="email"
                  value={formData.email || ''}
                  onChange={(e) => {
                    setFormData({ ...formData, email: e.target.value });
                    if (formErrors.email) {
                      setFormErrors({ ...formErrors, email: '' });
                    }
                  }}
                  placeholder="email@example.com"
                  className={formErrors.email ? 'error' : ''}
                />
                {formErrors.email && <span className="error-message">{formErrors.email}</span>}
              </div>
              <div className="user-form-field">
                <label>Full Name</label>
                <input
                  type="text"
                  value={formData.fullName || ''}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  placeholder="Full Name"
                />
              </div>
              <div className="user-form-actions">
                <button className="btn-secondary" onClick={handleCloseForm}>
                  Cancel
                </button>
                <button
                  className="btn-primary"
                  onClick={editingUser ? handleUpdate : handleCreate}
                  disabled={
                    !formData.username.trim() ||
                    (!editingUser && !formData.password.trim()) ||
                    Object.keys(formErrors).length > 0
                  }
                >
                  {editingUser ? 'Update' : 'Create'}
                </button>
              </div>
            </div>
          )}

          <div className="user-list">
            {users.length === 0 ? (
              <div className="user-empty">No users yet. Create one to get started!</div>
            ) : (
              users.map((user) => (
                <div key={user.id} className="user-item">
                  <div className="user-info">
                    <h4>{user.username}</h4>
                    {user.fullName && <p className="user-fullname">{user.fullName}</p>}
                    {user.email && <p className="user-email">{user.email}</p>}
                  </div>
                  <div className="user-actions">
                    {onSelect && (
                      <button className="btn-select" onClick={() => handleSelect(user)}>
                        Select
                      </button>
                    )}
                    <button className="btn-edit" onClick={() => handleEdit(user)}>
                      Edit
                    </button>
                    <button className="btn-delete" onClick={() => handleDelete(user.id)}>
                      Delete
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default UserDirectory;

