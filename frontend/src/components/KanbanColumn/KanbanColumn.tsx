import { Droppable } from 'react-beautiful-dnd';
import TaskCard from '../TaskCard/TaskCard';
import { Task, TaskStatus } from '../../types/task.types';
import { TaskType } from '../../types/task-type.types';
import { User } from '../../types/user.types';
import './KanbanColumn.css';

interface KanbanColumnProps {
  column: { id: TaskStatus; title: string };
  tasks: Task[];
  taskTypes: TaskType[];
  users: User[];
  onTaskDelete: (id: number) => Promise<void>;
  onTaskEdit: (task: Task) => void;
}

function KanbanColumn({ column, tasks, taskTypes, users, onTaskDelete, onTaskEdit }: KanbanColumnProps) {
  return (
    <div className="kanban-column">
      <div className="kanban-column-header">
        <h2 className="kanban-column-title">{column.title}</h2>
        <span className="kanban-column-count">{tasks.length}</span>
      </div>
      <Droppable droppableId={column.id} type="TASK">
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`kanban-column-content ${snapshot.isDraggingOver ? 'dragging-over' : ''}`}
            style={{
              minHeight: tasks.length === 0 ? '200px' : 'auto',
            }}
          >
            {tasks.length === 0 && !snapshot.isDraggingOver && (
              <div className="kanban-column-empty">No tasks</div>
            )}
            {tasks.map((task, index) => (
              <TaskCard
                key={task.id}
                task={task}
                taskTypes={taskTypes}
                users={users}
                index={index}
                onDelete={onTaskDelete}
                onEdit={onTaskEdit}
              />
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </div>
  );
}

export default KanbanColumn;

