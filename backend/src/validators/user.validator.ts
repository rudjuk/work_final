import { z } from 'zod';

const emailSchema = z.preprocess(
  (val) => {
    if (val === '' || val === null || val === undefined) {
      return null;
    }
    return val;
  },
  z.string().email('Invalid email format').nullable().optional()
);

export const createUserSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters').max(50, 'Username must be less than 50 characters'),
  password: z.string().min(3, 'Password must be at least 3 characters').max(100, 'Password must be less than 100 characters'),
  email: emailSchema,
  fullName: z.string().max(100, 'Full name must be less than 100 characters').nullable().optional(),
});

export const updateUserSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters').max(50, 'Username must be less than 50 characters').optional(),
  password: z.string().min(3, 'Password must be at least 3 characters').max(100, 'Password must be less than 100 characters').optional(),
  email: emailSchema,
  fullName: z.string().max(100, 'Full name must be less than 100 characters').nullable().optional(),
});

