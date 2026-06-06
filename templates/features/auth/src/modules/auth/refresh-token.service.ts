import { Injectable } from '@nestjs/common';
import { RevokedReason } from '@prisma-orm/enums';
import type {
  RefreshTokenModel,
  RefreshTokenUncheckedCreateInput,
} from '@prisma-orm/models';
import { PrismaService } from '@prisma-orm/service';
import * as crypto from 'crypto';

@Injectable()
export class RefreshTokenService {
  constructor(private readonly prisma: PrismaService) {}

  private hashToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
  }

  async create(
    refreshTokenUncheckedCreateInput: RefreshTokenUncheckedCreateInput,
  ): Promise<RefreshTokenModel> {
    const hashedToken = this.hashToken(refreshTokenUncheckedCreateInput.token);
    const refreshToken = await this.prisma.refreshToken.create({
      data: { ...refreshTokenUncheckedCreateInput, token: hashedToken },
    });
    return refreshToken;
  }

  async findByTokenEndUserId(
    userId: number,
    token: string,
  ): Promise<RefreshTokenModel> {
    const refreshToken = await this.prisma.refreshToken.findUniqueOrThrow({
      where: {
        userId,
        token: this.hashToken(token),
      },
    });
    return refreshToken;
  }

  async revokeRefreshToken(
    userId: number,
    refreshTokenId: number,
    revokedReason: RevokedReason,
  ): Promise<void> {
    await this.prisma.refreshToken.update({
      where: {
        userId,
        id: refreshTokenId,
      },
      data: {
        isRevoked: true,
        revokedReason,
        revokedAt: new Date(),
      },
    });
  }

  async revokeAllUserRefreshTokens(
    userId: number,
    reason: RevokedReason,
  ): Promise<void> {
    await this.prisma.refreshToken.updateMany({
      where: {
        userId,
        isRevoked: false,
      },
      data: {
        isRevoked: true,
        revokedAt: new Date(),
        revokedReason: reason,
      },
    });
  }

  async updateParentId(
    refreshTokenId: number,
    parentRefreshTokenId: number,
  ): Promise<void> {
    await this.prisma.refreshToken.update({
      where: {
        id: refreshTokenId,
      },
      data: {
        parentId: parentRefreshTokenId,
      },
      include: {
        children: true,
      },
    });
  }
}
