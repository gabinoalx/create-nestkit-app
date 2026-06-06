import { registerUserSchema } from '@modules/auth/dto/register-user.dto';
import { createZodDto } from 'nestjs-zod';

export class UpdateUserDto extends createZodDto(
  registerUserSchema
    .omit({ role: true, password: true, confirmPassword: true })
    .partial()
    .readonly(),
) {}
