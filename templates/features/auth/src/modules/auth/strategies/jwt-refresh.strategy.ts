import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { EnvConfig } from '@config/envs';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtPayload } from '@common/interfaces';
import type { UserModel } from '@prisma-orm/models';
import { UsersService } from '../../users/users.service';
import { tryCatch } from '@common/utils';
import { Request } from 'express';
import { REFRESH_TOKEN } from '../const/refresh-token.const';

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh',
) {
  constructor(
    private readonly configService: ConfigService<EnvConfig, true>,
    private readonly usersService: UsersService,
  ) {
    const secretKey = configService.get('JWT_REFRESH_TOKEN_SECRET', {
      infer: true,
    });
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (req: Request) => req.cookies[REFRESH_TOKEN],
      ]),
      ignoreExpiration: false,
      secretOrKey: secretKey,
      passReqToCallback: true,
    });
  }

  async validate(_: Request, { userId }: JwtPayload): Promise<UserModel> {
    const [user, err] = await tryCatch(this.usersService.findOne(userId));
    if (err) throw new UnauthorizedException();
    return user;
  }
}
