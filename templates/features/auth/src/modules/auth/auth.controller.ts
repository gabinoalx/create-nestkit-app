import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Res,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from '@core/guards';
import {
  GetClientInfo,
  Cookies,
  CurrentUser,
  Public,
} from '@common/decorators';
import { RegisterUserDto } from './dto/register-user.dto';
import { AuthResponse } from './interfaces/auth-response.interface';
import type { UserModel } from '@prisma-orm/models';
import type { CookieOptions, Response } from 'express';
import { JwtRefreshAuthGuard } from '../../core/guards/jwt-refresh-auth.guard';
import type { ClientInfo } from '@common/interfaces';
import { REFRESH_TOKEN } from './const/refresh-token.const';
import { ConfigService } from '@nestjs/config';
import { EnvConfig } from '@config/envs';
import ms from 'ms';

@Controller('auth')
export class AuthController {
  private readonly cookiesOptions: CookieOptions;

  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService<EnvConfig, true>,
  ) {
    const refreshTokenExpiry = this.configService.get(
      'JWT_REFRESH_TOKEN_EXPIRY_TIME',
      { infer: true },
    );
    this.cookiesOptions = {
      httpOnly: true,
      sameSite: 'strict',
      secure: true,
      path: '/auth',
      maxAge: ms(refreshTokenExpiry),
    };
  }

  @Post('login')
  @Public()
  @HttpCode(HttpStatus.OK)
  @UseGuards(LocalAuthGuard)
  async signIn(
    @Res({ passthrough: true }) res: Response,
    @GetClientInfo() clientInfo: ClientInfo,
    @CurrentUser() user: UserModel,
  ): Promise<AuthResponse> {
    const { accessToken, refreshToken } =
      await this.authService.generateTokenPair(user);

    await this.authService.createRefreshTokenModel(
      user,
      refreshToken,
      clientInfo,
    );
    res.cookie(REFRESH_TOKEN, refreshToken, this.cookiesOptions);

    return { accessToken };
  }

  @Post('refresh')
  @Public()
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtRefreshAuthGuard)
  async refreshToken(
    @Res({ passthrough: true }) res: Response,
    @GetClientInfo() clientInfo: ClientInfo,
    @CurrentUser() user: UserModel,
    @Cookies(REFRESH_TOKEN) cookieRefreshToken: string,
  ): Promise<AuthResponse> {
    const { accessToken, refreshToken } = await this.authService.refreshToken(
      user,
      cookieRefreshToken,
      clientInfo,
    );
    res.cookie(REFRESH_TOKEN, refreshToken, this.cookiesOptions);

    return { accessToken };
  }

  @Post('register')
  @Public()
  async registerUser(
    @Res({ passthrough: true }) res: Response,
    @GetClientInfo() clientInfo: ClientInfo,
    @Body() registerUserDto: RegisterUserDto,
  ): Promise<AuthResponse> {
    const { accessToken, refreshToken } = await this.authService.registerUser(
      registerUserDto,
      clientInfo,
    );
    res.cookie(REFRESH_TOKEN, refreshToken, this.cookiesOptions);
    return { accessToken };
  }

  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  async logout(
    @Res({ passthrough: true }) res: Response,
    @CurrentUser() user: UserModel,
    @Cookies(REFRESH_TOKEN) cookieRefreshToken: string,
  ): Promise<void> {
    await this.authService.logout(cookieRefreshToken, user);
    res.clearCookie(REFRESH_TOKEN, { path: this.cookiesOptions.path });
  }

  @Get('profile')
  getProfile(@CurrentUser() user: UserModel): UserModel {
    return user;
  }
}
