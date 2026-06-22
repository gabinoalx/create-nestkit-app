import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { ConfigService } from '@nestjs/config';
import { EnvConfig } from '@config/envs';
import { setupProcessHandlers } from '@core/lifecycle';
import { Logger } from 'nestjs-pino';
import cookieParser from 'cookie-parser';

async function bootstrap(): Promise<void> {
  setupProcessHandlers();
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    bufferLogs: true,
  });
  app.use(cookieParser());
  app.useLogger(app.get(Logger));
  const configService = app.get(ConfigService<EnvConfig, true>);
  const port = configService.get('APP_PORT', { infer: true });
  await app.listen(port);
}
bootstrap();
