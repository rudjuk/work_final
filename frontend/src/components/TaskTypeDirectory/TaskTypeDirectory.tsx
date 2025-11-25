import { useState, useEffect } from 'react';
import { TaskType, CreateTaskTypeDto, UpdateTaskTypeDto } from '../../types/task-type.types';
import { taskTypeApi } from '../../services/api';
import './TaskTypeDirectory.css';

interface TaskTypeDirectoryProps {
  onClose: () => void;
  onSelect?: (taskType: TaskType) => void;
}

function TaskTypeDirectory({ onClose, onSelect }: TaskTypeDirectoryProps) {
  const [taskTypes, setTaskTypes] = useState<TaskType[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingType, setEditingType] = useState<TaskType | null>(null);
  const [formData, setFormData] = useState<CreateTaskTypeDto>({
    name: '',
    description: '',
    color: '#4285f4',
  });

  useEffect(() => {
    loadTaskTypes();
  }, []);

  const loadTaskTypes = async () => {
    try {
      setLoading(true);
      const data = await taskTypeApi.getAll();
      setTaskTypes(data);
    } catch (error) {
      console.error('Failed to load task types:', error);
      alert('Failed to load task types');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    try {
      await taskTypeApi.create(formData);
      await loadTaskTypes();
      setShowForm(false);
      setFormData({ name: '', description: '', color: '#4285f4' });
    } catch (error) {
      console.error('Failed to create task type:', error);
      alert('Failed to create task type');
    }
  };

  const handleUpdate = async () => {
    if (!editingType) return;
    try {
      await taskTypeApi.update(editingType.id, formData);
      await loadTaskTypes();
      setShowForm(false);
      setEditingType(null);
      setFormData({ name: '', description: '', color: '#4285f4' });
    } catch (error) {
      console.error('Failed to update task type:', error);
      alert('Failed to update task type');
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this task type?')) {
      return;
    }
    try {
      await taskTypeApi.delete(id);
      await loadTaskTypes();
    } catch (error) {
      console.error('Failed to delete task type:', error);
      alert('Failed to delete task type');
    }
  };

  const handleEdit = (taskType: TaskType) => {
    setEditingType(taskType);
    setFormData({
      name: taskType.name,
      description: taskType.description || '',
      color: taskType.color || '#4285f4',
    });
    setShowForm(true);
  };

  const handleSelect = (taskType: TaskType) => {
    if (onSelect) {
      onSelect(taskType);
    }
    onClose();
  };

  const handleNew = () => {
    setEditingType(null);
    setFormData({ name: '', description: '', color: '#4285f4' });
    setShowForm(true);
  };

  if (loading) {
    return (
      <div className="task-type-directory-overlay" onClick={onClose}>
        <div className="task-type-directory-modal" onClick={(e) => e.stopPropagation()}>
          <div className="task-type-directory-loading">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="task-type-directory-overlay" onClick={onClose}>
      <div className="task-type-directory-modal" onClick={(e) => e.stopPropagation()}>
        <div className="task-type-directory-header">
          <h2>Task Types Directory</h2>
          <button className="task-type-directory-close" onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>

        <div className="task-type-directory-content">
          <div className="task-type-directory-actions">
            <button className="btn-primary" onClick={handleNew}>
              + New Type
            </button>
          </div>

          {showForm && (
            <div className="task-type-form">
              <h3>{editingType ? 'Edit Task Type' : 'New Task Type'}</h3>
              <div className="task-type-form-field">
                <label>Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Task type name"
                />
              </div>
              <div className="task-type-form-field">
                <label>Description</label>
                <textarea
                  value={formData.description || ''}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Description (optional)"
                  rows={3}
                />
              </div>
              <div className="task-type-form-field">
                <label>Color</label>
                <div className="task-type-color-input">
                  <input
                    type="color"
                    value={formData.color || '#4285f4'}
                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                  />
                  <input
                    type="text"
                    value={formData.color || '#4285f4'}
                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                    placeholder="#4285f4"
                  />
                </div>
              </div>
              <div className="task-type-form-actions">
                <button className="btn-secondary" onClick={() => setShowForm(false)}>
                  Cancel
                </button>
                <button
                  className="btn-primary"
                  onClick={editingType ? handleUpdate : handleCreate}
                  disabled={!formData.name.trim()}
                >
                  {editingType ? 'Update' : 'Create'}
                </button>
              </div>
            </div>
          )}

          <div className="task-type-list">
            {taskTypes.length === 0 ? (
              <div className="task-type-empty">No task types yet. Create one to get started!</div>
            ) : (
              taskTypes.map((type) => (
                <div key={type.id} className="task-type-item">
                  <div
                    className="task-type-color"
                    style={{ backgroundColor: type.color || '#4285f4' }}
                  ></div>
                  <div className="task-type-info">
                    <h4>{type.name}</h4>
                    {type.description && <p>{type.description}</p>}
                  </div>
                  <div className="task-type-actions">
                    {onSelect && (
                      <button className="btn-select" onClick={() => handleSelect(type)}>
                        Select
                      </button>
                    )}
                    <button className="btn-edit" onClick={() => handleEdit(type)}>
                      Edit
                    </button>
                    <button className="btn-delete" onClick={() => handleDelete(type.id)}>
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

export default TaskTypeDirectory;

