# Task Tracker

Full-stack task tracker application built with React + TypeScript (frontend) and Node.js + TypeScript (backend).

## Features

### Frontend
- ✅ Create, view, edit, and delete tasks
- ✅ Kanban board with 4 columns (To Do, In Progress, Review, Done)
- ✅ **Drag and drop tasks between columns** - Change task status by dragging
- ✅ Task filtering and sorting
- ✅ **Task Types Directory** - Manage task types with colors
- ✅ **Users Directory** - Manage users and assign tasks to users
- ✅ **Task assignment** - Assign tasks to specific users
- ✅ **Visual indicators** - Task cards show type color and assigned user
- ✅ Google-style modern UI design
- ✅ Form validation with error messages displayed under fields
- ✅ Submit button disabled when form is invalid or unchanged

### Backend
- ✅ REST API for CRUD operations
- ✅ **Task Types API** - Full CRUD for task types
- ✅ **Users API** - Full CRUD for users with password hashing
- ✅ **Auto-create admin user** - Creates admin/admin user if no users exist
- ✅ Filtering by status, priority, and date
- ✅ SQLite database storage
- ✅ Request validation with Zod
- ✅ Error handling (400/404/500)
- ✅ Morgan logging (dev mode)
- ✅ CORS middleware
- ✅ Clean architecture (routes → controllers → services → models)

### Testing
- ✅ Frontend tests (Vitest + RTL) for form validation
- ✅ Backend tests (Jest + Supertest) for all CRUD endpoints

## Project Structure

```
.
├── backend/
│   ├── src/
│   │   ├── controllers/    # Request handlers
│   │   ├── services/       # Business logic
│   │   ├── models/         # Database models
│   │   ├── routes/         # API routes
│   │   ├── middleware/     # Express middleware
│   │   ├── validators/     # Zod schemas
│   │   ├── types/          # TypeScript types
│   │   ├── database/       # Database setup
│   │   └── index.ts        # Entry point
│   └── __tests__/          # Backend tests
├── frontend/
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── services/       # API client
│   │   ├── types/          # TypeScript types
│   │   └── test/           # Test setup
│   └── public/             # Static assets
└── package.json            # Root package.json (workspaces)
```

## Getting Started

### Prerequisites
- Node.js 18+ and npm

### Installation

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
```bash
cd backend
cp .env.example .env
```

3. Start development servers:
```bash
npm run dev
```

This will start:
- Backend server on http://localhost:3001
- Frontend dev server on http://localhost:3000

### Build for Production

```bash
npm run build
```

This builds both backend and frontend:
- Backend: `backend/dist/`
- Frontend: `frontend/dist/`

### Running Tests

```bash
# Run all tests
npm test

# Run backend tests only
npm run test:backend

# Run frontend tests only
npm run test:frontend
```

## API Endpoints

### Tasks
- `GET /api/tasks` - Get all tasks (supports query params: status, priority, date)
- `GET /api/tasks/:id` - Get task by ID
- `POST /api/tasks` - Create new task
- `PUT /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task

### Task Types
- `GET /api/task-types` - Get all task types
- `GET /api/task-types/:id` - Get task type by ID
- `POST /api/task-types` - Create new task type
- `PUT /api/task-types/:id` - Update task type
- `DELETE /api/task-types/:id` - Delete task type

### Users
- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get user by ID
- `POST /api/users` - Create new user
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

## Technologies Used

### Frontend
- React 18
- TypeScript
- Vite
- React Beautiful DnD (drag & drop)
- Axios
- Vitest + React Testing Library

### Backend
- Node.js
- Express
- TypeScript
- SQLite3
- Zod (validation)
- Crypto (password hashing)
- Morgan (logging)
- CORS
- Jest + Supertest

## Development Tools
- ESLint
- Prettier
- TypeScript strict mode

## Key Features Details

### Task Management
- **Status Columns**: To Do → In Progress → Review → Done
- **Drag & Drop**: Intuitive drag and drop between columns to change status
- **Task Types**: Categorize tasks with custom types and colors
- **User Assignment**: Assign tasks to specific users
- **Priority Levels**: Low, Medium, High with color coding
- **Due Dates**: Optional due date tracking

### Task Types Directory
- Create custom task types with names, descriptions, and colors
- Visual color indicators on task cards
- Left border highlighting on cards with assigned types

### Users Directory
- User management with username, email, and full name
- Password hashing (SHA-256)
- Automatic admin user creation (username: `admin`, password: `admin`)
- Assign tasks to users from the task form

### Visual Design
- Google Material Design inspired
- Color-coded priorities and task types
- Responsive layout
- Smooth animations and transitions

