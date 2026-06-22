import { FiltersModule } from '@core/filters/module';
import { Module } from '@nestjs/common';
import { LoggerModule } from 'nestjs-pino';
import { loggerModuleOptions } from '@config/logger';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { configModuleOptions, EnvConfig } from '@config/envs';
import { APP_PIPE } from '@nestjs/core';
import { ZodValidationPipe } from 'nestjs-zod';
import { CommonModule } from '@common/module';
import { ClsModule } from 'nestjs-cls';

@Module({
  imports: [
    ConfigModule.forRoot(configModuleOptions),
    LoggerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService<EnvConfig, true>) =>
        loggerModuleOptions(configService),
    }),
    ClsModule.forRoot({
      global: true,
      middleware: { mount: true },
    }),
    FiltersModule,
    CommonModule,
  ],
  providers: [
    {
      provide: APP_PIPE,
      useClass: ZodValidationPipe,
    },
  ],
})
export class AppModule {}
