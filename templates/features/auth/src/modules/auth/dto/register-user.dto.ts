import { Role } from '@prisma-orm/enums';
import { createZodDto } from 'nestjs-zod';
import z from 'zod';

export const registerUserSchema = z
  .strictObject({
    firstName: z.string().trim().nonempty().min(3).max(40),
    lastName: z.string().trim().nonempty().min(3).max(40),
    email: z.email().toLowerCase(),
    username: z.string().trim().nonempty().min(3).max(40).optional(),
    role: z.enum(Role).optional(),
    password: z
      .string()
      .min(8)
      .max(50)
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/,
        'Must contain uppercase letters, lowercase letters, numbers end special characters (@$!%*?&)',
      ),
    confirmPassword: z.string(),
  })
  .refine((obj) => obj.password === obj.confirmPassword, {
    error: 'Password do not match',
    path: ['confirmPassword'],
  });

export class RegisterUserDto extends createZodDto(
  registerUserSchema.readonly(),
) {}
