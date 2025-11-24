import { createBrowserRouter } from 'react-router-dom';
import { TasksListPage } from './features/tasks/pages/TasksListPage';
import { TaskDetailsPage } from './features/tasks/pages/TaskDetailsPage';
import { CreateTaskPage } from './features/tasks/pages/CreateTaskPage';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <TasksListPage />,
  },
  {
    path: '/tasks',
    element: <TasksListPage />,
  },
  {
    path: '/tasks/create',
    element: <CreateTaskPage />,
  },
  {
    path: '/tasks/:id',
    element: <TaskDetailsPage />,
  },
]);
