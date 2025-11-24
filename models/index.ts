import { Task } from './Task.model.js';
import { User } from './User.model.js';
import { sequelize } from './database.js';

Task.belongsTo(User, {
  foreignKey: 'assigneeId',
  as: 'assignee',
});

User.hasMany(Task, {
  foreignKey: 'assigneeId',
  as: 'tasks',
});

export { Task, User, sequelize };
