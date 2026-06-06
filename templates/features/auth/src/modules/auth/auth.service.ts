import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { tryCatch } from '@common/utils';
import type {
  RefreshTokenModel,
  RefreshTokenUncheckedCreateInput,
  UserModel,
} from '@prisma-orm/models';
import { ClientInfo, JwtPayload, SignIn } from '@common/interfaces';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { RegisterUserDto } from './dto/register-user.dto';
import { ConfigService } from '@nestjs/config';
import { EnvConfig } from '@config/envs';
import { TokenPair } from './interfaces/token.pair';
import { RefreshTokenService } from './refresh-token.service';
import { RevokedReason } from '@prisma-orm/enums';
import ms from 'ms';
@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService<EnvConfig, true>,
    private readonly refreshTokenService: RefreshTokenService,
  ) {}

  async registerUser(
    registerUserDto: RegisterUserDto,
    clientInfo: ClientInfo,
  ): Promise<TokenPair> {
    const user = await this.usersService.create(registerUserDto);
    const { accessToken, refreshToken } = await this.generateTokenPair(user);
    await this.createRefreshTokenModel(user, refreshToken, clientInfo);
    return { accessToken, refreshToken };
  }

  async validateUser({ email, password }: SignIn): Promise<UserModel | null> {
    const [userWithLogin, err] = await tryCatch(
      this.usersService.findByEmail(email),
    );
    if (err || !userWithLogin) return null;
    const isMatch = await bcrypt.compare(
      password,
      userWithLogin.login!.password,
    );
    if (!isMatch) return null;
    const { login, ...user } = userWithLogin;
    return user;
  }

  private async signAccessToken(payload: JwtPayload): Promise<string> {
    const accessToken = await this.jwtService.signAsync(payload);
    return accessToken;
  }
  private async signRefreshToken(payload: JwtPayload): Promise<string> {
    const secret = this.configService.get('JWT_REFRESH_TOKEN_SECRET', {
      infer: true,
    });
    const expiresIn = this.configService.get('JWT_REFRESH_TOKEN_EXPIRY_TIME', {
      infer: true,
    });
    const refreshToken = await this.jwtService.signAsync(payload, {
      secret,
      expiresIn,
    });

    return refreshToken;
  }

  async generateTokenPair(user: UserModel): Promise<TokenPair> {
    const payload: JwtPayload = { userId: user.id };
    const accessToken = await this.signAccessToken(payload);
    const refreshToken = await this.signRefreshToken(payload);
    return { accessToken, refreshToken };
  }

  async createRefreshTokenModel(
    user: UserModel,
    refreshToken: string,
    clientInfo: ClientInfo,
  ): Promise<RefreshTokenModel> {
    const expiresIn = this.configService.get('JWT_REFRESH_TOKEN_EXPIRY_TIME', {
      infer: true,
    });
    const expiresAt = new Date(Date.now() + ms(expiresIn));
    const { ipAddress, userAgent } = clientInfo;
    const refreshTokenModelBody: RefreshTokenUncheckedCreateInput = {
      token: refreshToken,
      userId: user.id,
      ipAddress,
      userAgent,
      expiresAt,
    };
    const newRefreshTokenModel = await this.refreshTokenService.create(
      refreshTokenModelBody,
    );
    return newRefreshTokenModel;
  }

  private async rotateRefreshToken(
    oldRefreshTokenModel: RefreshTokenModel,
    user: UserModel,
    refreshToken: string,
    clientInfo: ClientInfo,
  ): Promise<void> {
    const newRefreshTokenModel = await this.createRefreshTokenModel(
      user,
      refreshToken,
      clientInfo,
    );
    await this.refreshTokenService.updateParentId(
      newRefreshTokenModel.id,
      oldRefreshTokenModel.id,
    );

    await this.refreshTokenService.revokeRefreshToken(
      user.id,
      oldRefreshTokenModel.id,
      RevokedReason.ROTATION,
    );
  }

  async refreshToken(
    user: UserModel,
    cookieRefreshToken: string,
    clientInfo: ClientInfo,
  ): Promise<TokenPair> {
    const [oldRefreshTokenModel, err] = await tryCatch(
      this.refreshTokenService.findByTokenEndUserId(
        user.id,
        cookieRefreshToken,
      ),
    );
    if (err || oldRefreshTokenModel.isRevoked) {
      await this.refreshTokenService.revokeAllUserRefreshTokens(
        user.id,
        RevokedReason.SUSPICIOUS,
      );
      throw new UnauthorizedException('compromised token');
    }

    if (oldRefreshTokenModel.expiresAt < new Date())
      throw new UnauthorizedException('refresh token expired');

    const { accessToken, refreshToken } = await this.generateTokenPair(user);

    await this.rotateRefreshToken(
      oldRefreshTokenModel,
      user,
      refreshToken,
      clientInfo,
    );

    return { accessToken, refreshToken };
  }

  async logout(cookieRefreshToken: string, user: UserModel): Promise<void> {
    // otra opción QUE PUEDE FUNCIONAR si no se tiene el cookieRefreshToken: Buscar por userId + device fingerprin
    const [oldRefreshTokenModel, err] = await tryCatch(
      this.refreshTokenService.findByTokenEndUserId(
        user.id,
        cookieRefreshToken,
      ),
    );
    if (err) return;
    if (oldRefreshTokenModel && !oldRefreshTokenModel.isRevoked)
      await this.refreshTokenService.revokeRefreshToken(
        user.id,
        oldRefreshTokenModel.id,
        RevokedReason.LOGOUT,
      );
  }
}
