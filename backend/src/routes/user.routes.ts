import { Router } from 'express';
import { UserController } from '../controllers/user.controller';
import { validateBody } from '../middleware/validation.middleware';
import { createUserSchema, updateUserSchema } from '../validators/user.validator';

export const createUserRoutes = (userController: UserController): Router => {
  const router = Router();

  router.post('/', validateBody(createUserSchema), userController.createUser);
  router.get('/', userController.getUsers);
  router.get('/:id', userController.getUserById);
  router.put('/:id', validateBody(updateUserSchema), userController.updateUser);
  router.delete('/:id', userController.deleteUser);

  return router;
};

