import { Injectable } from '@nestjs/common';
import type { RegisterUserDto } from '../auth/dto/register-user.dto';
import { PrismaService } from '@prisma-orm/service';
import type { UserGetPayload, UserModel } from '@prisma-orm/models';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(registerUserDto: RegisterUserDto): Promise<UserModel> {
    const { password, confirmPassword, email, ...newCreateUserDto } =
      registerUserDto;

    const salt = await bcrypt.genSalt();
    const passwordHashed = await bcrypt.hash(password, salt);

    const user = await this.prisma.user.create({
      data: {
        ...newCreateUserDto,
        email,
        login: {
          create: {
            email,
            password: passwordHashed,
            lastSuccessfulAuthAt: new Date(),
          },
        },
      },
    });

    return user;
  }

  async findByEmail(email: string): Promise<
    UserGetPayload<{
      include: {
        login: true;
      };
    }>
  > {
    const user = await this.prisma.user.findUniqueOrThrow({
      where: {
        email,
      },
      include: {
        login: true,
      },
    });

    return user;
  }

  async findOne(id: number): Promise<UserModel> {
    const user = await this.prisma.user.findUniqueOrThrow({
      where: {
        id,
      },
    });

    return user;
  }
}
