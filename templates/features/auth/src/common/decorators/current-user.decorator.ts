import {
  createParamDecorator,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import type { UserModel } from '@prisma-orm/models';
import type { Request } from 'express';

export const CurrentUser = createParamDecorator(
  (
    data: keyof UserModel,
    ctx: ExecutionContext,
  ): UserModel | UserModel[keyof UserModel] => {
    const request = ctx.switchToHttp().getRequest<Request>();
    const user = request['user'] as UserModel;
    if (!user) throw new UnauthorizedException('Usuario no encontrado');
    return data ? user[data] : user;
  },
);
