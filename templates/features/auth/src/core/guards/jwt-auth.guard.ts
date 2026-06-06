import { IS_PUBLIC_KEY } from '@core/const';
import {
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type {
  JsonWebTokenError,
  NotBeforeError,
  TokenExpiredError,
} from '@nestjs/jwt';
import { AuthGuard } from '@nestjs/passport';
import type { UserModel } from '@prisma-orm/models';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private readonly reflector: Reflector) {
    super();
  }
  canActivate(context: ExecutionContext) {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;
    return super.canActivate(context);
  }

  handleRequest<IUser = UserModel>(
    err: UnauthorizedException | null,
    user: UserModel | null,
    info: TokenExpiredError | JsonWebTokenError | NotBeforeError | Error,
  ): IUser {
    if (err || !user) throw err || new UnauthorizedException(info.message);
    return user as IUser;
  }
}
