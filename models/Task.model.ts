import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from './database.js';
import { User } from './User.model.js';

export type Status = 'todo' | 'in-progress' | 'review' | 'done';
export type Priority = 'low' | 'normal' | 'high';

export interface TaskAttributes {
  id: number;
  title: string;
  description: string;
  status: Status;
  priority: Priority;
  deadline: string | null;
  assigneeId: number | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface TaskCreationAttributes
  extends Optional<TaskAttributes, 'id' | 'createdAt' | 'updatedAt' | 'assigneeId'> {}

export class Task extends Model<TaskAttributes, TaskCreationAttributes> implements TaskAttributes {
  public id!: number;
  public title!: string;
  public description!: string;
  public status!: Status;
  public priority!: Priority;
  public deadline!: string | null;
  public assigneeId!: number | null;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  public assignee?: User;
}

Task.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM('todo', 'in-progress', 'review', 'done'),
      allowNull: false,
      defaultValue: 'todo',
    },
    priority: {
      type: DataTypes.ENUM('low', 'normal', 'high'),
      allowNull: false,
      defaultValue: 'normal',
    },
    deadline: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    assigneeId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id',
      },
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    tableName: 'tasks',
    timestamps: true,
  }
);
