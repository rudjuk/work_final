import { DragDropContext, DropResult } from 'react-beautiful-dnd';
import KanbanColumn from '../KanbanColumn/KanbanColumn';
import { Task, TaskStatus } from '../../types/task.types';
import { TaskType } from '../../types/task-type.types';
import { User } from '../../types/user.types';
import './KanbanBoard.css';

interface KanbanBoardProps {
  tasks: Task[];
  taskTypes: TaskType[];
  users: User[];
  onTaskUpdate: (id: number, data: { status?: TaskStatus }) => Promise<void>;
  onTaskDelete: (id: number) => Promise<void>;
  onTaskEdit: (task: Task) => void;
}

const columns: { id: TaskStatus; title: string }[] = [
  { id: TaskStatus.TODO, title: 'To Do' },
  { id: TaskStatus.IN_PROGRESS, title: 'In Progress' },
  { id: TaskStatus.REVIEW, title: 'Review' },
  { id: TaskStatus.DONE, title: 'Done' },
];

function KanbanBoard({ tasks, taskTypes, users, onTaskUpdate, onTaskDelete, onTaskEdit }: KanbanBoardProps) {
  const handleDragEnd = async (result: DropResult) => {
    const { destination, source, draggableId } = result;

    // If dropped outside a droppable area, do nothing
    if (!destination) {
      return;
    }

    // If dropped in the same position, do nothing
    if (destination.droppableId === source.droppableId && destination.index === source.index) {
      return;
    }

    const taskId = parseInt(draggableId, 10);
    const newStatus = destination.droppableId as TaskStatus;
    const oldStatus = source.droppableId as TaskStatus;
    
    // Validate that the status is a valid TaskStatus
    const validStatuses = Object.values(TaskStatus);
    if (!validStatuses.includes(newStatus)) {
      console.error('Invalid status:', newStatus);
      return;
    }

    const task = tasks.find((t) => t.id === taskId);
    if (task && task.status !== newStatus) {
      try {
        // Optimistically update the task status
        await onTaskUpdate(taskId, { status: newStatus });
      } catch (error) {
        console.error('Failed to update task status:', error);
        // Optionally show an error message to the user
        alert('Failed to move task. Please try again.');
      }
    }
  };

  const getTasksByStatus = (status: TaskStatus): Task[] => {
    return tasks.filter((task) => task.status === status);
  };

  return (
    <DragDropContext onDragEnd={handleDragEnd} onDragStart={() => {}}>
      <div className="kanban-board">
        {columns.map((column) => (
          <KanbanColumn
            key={column.id}
            column={column}
            tasks={getTasksByStatus(column.id)}
            taskTypes={taskTypes}
            users={users}
            onTaskDelete={onTaskDelete}
            onTaskEdit={onTaskEdit}
          />
        ))}
      </div>
    </DragDropContext>
  );
}

export default KanbanBoard;

