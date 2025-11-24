import express, { Request, Response } from 'express';
import morgan from 'morgan';
import cors from 'cors';
import taskRoutes from './routes/task.routes.js';
import { sequelize } from './models/database.js';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}
app.use(express.json());

app.use('/', taskRoutes);

app.use((err: Error, _req: Request, res: Response) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

const startServer = async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connection established successfully.');

    await sequelize.sync({ force: false });
    console.log('Database models synchronized.');

    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Unable to start server:', error);
    process.exit(1);
  }
};

startServer();
