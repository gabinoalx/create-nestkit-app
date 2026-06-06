import {
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import type {
  JsonWebTokenError,
  NotBeforeError,
  TokenExpiredError,
} from '@nestjs/jwt';
import { AuthGuard } from '@nestjs/passport';
import type { UserModel } from '@prisma-orm/models';

@Injectable()
export class JwtRefreshAuthGuard extends AuthGuard('jwt-refresh') {
  constructor() {
    super();
  }

  canActivate(context: ExecutionContext) {
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
