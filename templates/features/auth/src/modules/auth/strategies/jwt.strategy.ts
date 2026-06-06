import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { EnvConfig } from '@config/envs';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtPayload } from '@common/interfaces';
import type { UserModel } from '@prisma-orm/models';
import { UsersService } from '../../users/users.service';
import { tryCatch } from '@common/utils';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly configService: ConfigService<EnvConfig, true>,
    private readonly usersService: UsersService,
  ) {
    const secretKey = configService.get('JWT_ACCESS_TOKEN_SECRET', {
      infer: true,
    });
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: secretKey,
    });
  }

  async validate({ userId }: JwtPayload): Promise<UserModel> {
    const [user, err] = await tryCatch(this.usersService.findOne(userId));
    if (err) throw new UnauthorizedException();
    return user;
  }
}
