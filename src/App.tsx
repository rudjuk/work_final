import { RouterProvider } from 'react-router-dom';
import { router } from './router';
import './style.css';

function App() {
  return (
    <div className="container">
      <h1>Менеджер завдань</h1>
      <RouterProvider router={router} />
    </div>
  );
}

export default App;
