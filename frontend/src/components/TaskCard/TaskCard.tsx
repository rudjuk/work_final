import { Draggable } from 'react-beautiful-dnd';
import { Task } from '../../types/task.types';
import { TaskType } from '../../types/task-type.types';
import { User } from '../../types/user.types';
import './TaskCard.css';

interface TaskCardProps {
  task: Task;
  taskTypes: TaskType[];
  users: User[];
  index: number;
  onDelete: (id: number) => Promise<void>;
  onEdit: (task: Task) => void;
}

function TaskCard({ task, taskTypes, users, index, onDelete, onEdit }: TaskCardProps) {
  const taskType = task.taskTypeId ? taskTypes.find((t) => t.id === task.taskTypeId) : null;
  const assignedUser = task.assignedToUserId ? users.find((u) => u.id === task.assignedToUserId) : null;
  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this task?')) {
      await onDelete(task.id);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High':
        return '#ea4335';
      case 'Medium':
        return '#fbbc04';
      case 'Low':
        return '#34a853';
      default:
        return '#5f6368';
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <Draggable draggableId={task.id.toString()} index={index} type="TASK">
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className={`task-card ${snapshot.isDragging ? 'dragging' : ''} ${snapshot.isDropAnimating ? 'drop-animating' : ''}`}
          style={{
            ...provided.draggableProps.style,
            opacity: snapshot.isDragging ? 0.8 : 1,
            borderLeftColor: taskType && taskType.color ? taskType.color : '#e0e0e0',
            borderLeftWidth: '4px',
          }}
          onClick={(e) => {
            // Only edit if not dragging
            if (!snapshot.isDragging) {
              onEdit(task);
            }
          }}
        >
          <div className="task-card-header">
            <h3 className="task-card-title">{task.title}</h3>
            <button
              className="task-card-delete"
              onClick={handleDelete}
              onMouseDown={(e) => e.stopPropagation()}
              aria-label="Delete task"
            >
              ×
            </button>
          </div>
          <p className="task-card-description">{task.description}</p>
          {assignedUser && (
            <div className="task-card-assigned">
              <span className="task-card-assigned-label">Assigned to:</span>
              <span className="task-card-assigned-user">{assignedUser.fullName || assignedUser.username}</span>
            </div>
          )}
          <div className="task-card-footer">
            <div className="task-card-badges">
              {taskType && (
                <span
                  className="task-card-type"
                  style={{
                    backgroundColor: taskType.color ? taskType.color + '20' : '#e8f0fe',
                    color: taskType.color || '#1a73e8',
                  }}
                >
                  {taskType.name}
                </span>
              )}
              <span
                className="task-card-priority"
                style={{ backgroundColor: getPriorityColor(task.priority) + '20', color: getPriorityColor(task.priority) }}
              >
                {task.priority}
              </span>
            </div>
            {task.dueDate && (
              <span className="task-card-date">{formatDate(task.dueDate)}</span>
            )}
          </div>
        </div>
      )}
    </Draggable>
  );
}

export default TaskCard;

