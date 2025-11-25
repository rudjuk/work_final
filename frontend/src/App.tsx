import { useState, useEffect } from 'react';
import KanbanBoard from './components/KanbanBoard/KanbanBoard';
import TaskForm from './components/TaskForm/TaskForm';
import TaskTypeDirectory from './components/TaskTypeDirectory/TaskTypeDirectory';
import UserDirectory from './components/UserDirectory/UserDirectory';
import { Task, TaskStatus, TaskPriority } from './types/task.types';
import { TaskType } from './types/task-type.types';
import { User } from './types/user.types';
import { taskApi, taskTypeApi, userApi } from './services/api';
import './App.css';

function App() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [taskTypes, setTaskTypes] = useState<TaskType[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showDirectory, setShowDirectory] = useState(false);
  const [showUserDirectory, setShowUserDirectory] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  useEffect(() => {
    loadTasks();
    loadTaskTypes();
    loadUsers();
  }, []);

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

  const loadTasks = async () => {
    try {
      setLoading(true);
      const data = await taskApi.getAll();
      setTasks(data);
    } catch (error) {
      console.error('Failed to load tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTask = async (taskData: {
    title: string;
    description: string;
    priority: TaskPriority;
    taskTypeId?: number | null;
    assignedToUserId?: number | null;
    dueDate?: string | null;
  }) => {
    try {
      await taskApi.create(taskData);
      await loadTasks();
      setShowForm(false);
    } catch (error) {
      console.error('Failed to create task:', error);
      throw error;
    }
  };

  const handleUpdateTask = async (id: number, taskData: {
    title?: string;
    description?: string;
    status?: TaskStatus;
    priority?: TaskPriority;
    taskTypeId?: number | null;
    assignedToUserId?: number | null;
    dueDate?: string | null;
  }) => {
    try {
      await taskApi.update(id, taskData);
      await loadTasks();
      setEditingTask(null);
      setShowForm(false);
    } catch (error) {
      console.error('Failed to update task:', error);
      throw error;
    }
  };

  const handleDeleteTask = async (id: number) => {
    try {
      await taskApi.delete(id);
      await loadTasks();
    } catch (error) {
      console.error('Failed to delete task:', error);
    }
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingTask(null);
  };

  if (loading) {
    return (
      <div className="app-loading">
        <div className="loading-spinner"></div>
        <p>Loading tasks...</p>
      </div>
    );
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>Task Tracker</h1>
        <div className="app-header-actions">
          <button className="btn-secondary" onClick={() => setShowDirectory(true)}>
            📋 Task Types
          </button>
          <button className="btn-secondary" onClick={() => setShowUserDirectory(true)}>
            👥 Users
          </button>
          <button className="btn-primary" onClick={() => setShowForm(true)}>
            + New Task
          </button>
        </div>
      </header>

      <main className="app-main">
        <KanbanBoard
          tasks={tasks}
          taskTypes={taskTypes}
          users={users}
          onTaskUpdate={handleUpdateTask}
          onTaskDelete={handleDeleteTask}
          onTaskEdit={handleEditTask}
        />
      </main>

      {showForm && (
        <TaskForm
          task={editingTask}
          onSubmit={
            editingTask
              ? async (id, data) => {
                  await handleUpdateTask(id as number, data || {});
                }
              : async (data) => {
                  await handleCreateTask(data as Parameters<typeof handleCreateTask>[0]);
                }
          }
          onClose={handleCloseForm}
        />
      )}

      {showDirectory && (
        <TaskTypeDirectory
          onClose={() => {
            setShowDirectory(false);
            loadTaskTypes();
          }}
        />
      )}

      {showUserDirectory && (
        <UserDirectory
          onClose={() => {
            setShowUserDirectory(false);
            loadUsers();
          }}
        />
      )}
    </div>
  );
}

export default App;

