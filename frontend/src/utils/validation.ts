import { z } from 'zod';

import { editableIngredientCategories } from '../constants/categories';

export const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address.'),
  password: z.string().min(6, 'Password must be at least 6 characters.'),
});

export const signUpSchema = z
  .object({
    displayName: z.string().min(2, 'Name must be at least 2 characters.'),
    email: z.string().email('Please enter a valid email address.'),
    password: z.string().min(6, 'Password must be at least 6 characters.'),
    confirmPassword: z.string().min(6, 'Please confirm your password.'),
  })
  .refine(values => values.password === values.confirmPassword, {
    message: 'Passwords do not match.',
    path: ['confirmPassword'],
  });

export const forgotPasswordSchema = z.object({
  email: z.string().email('Please enter a valid email address.'),
});

export const ingredientSchema = z.object({
  name: z.string().min(2, 'Ingredient name is required.'),
  quantity: z.string().min(1, 'Quantity is required.'),
  category: z.enum(editableIngredientCategories),
});

export const chatComposerSchema = z.object({
  message: z.string().min(1, 'Type a message to KatChef.').max(400, 'Keep it under 400 characters.'),
});
