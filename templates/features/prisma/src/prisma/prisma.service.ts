import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaPg } from '@prisma/adapter-pg';
import { ConfigService } from '@nestjs/config';
import { EnvConfig } from '@config/envs';
import { PrismaClient } from '@prisma-orm/client';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor(private readonly configService: ConfigService<EnvConfig, true>) {
    const dbHost = configService.get('DB_HOST', { infer: true });
    const dbPort = configService.get('DB_PORT', { infer: true });
    const dbUser = configService.get('DB_USER', { infer: true });
    const dbPassword = configService.get('DB_PASSWORD', { infer: true });
    const dbName = configService.get('DB_NAME', { infer: true });
    const dbSchema = configService.get('DB_SCHEMA', { infer: true });

    const adapter = new PrismaPg(
      {
        host: dbHost,
        port: dbPort,
        user: dbUser,
        password: dbPassword,
        database: dbName,
        max: 10, // prod >= 20
        min: 2, // prod >= 5
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 2000,
        keepAlive: true,
        keepAliveInitialDelayMillis: 10000,
        statement_timeout: 60000,
        query_timeout: 60000,
      },
      { schema: dbSchema },
    );

    super({ adapter });
  }

  async onModuleInit(): Promise<void> {
    await this.$connect();
  }

  async onModuleDestroy(): Promise<void> {
    await this.$disconnect();
  }
}
