import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EnvConfig } from '.';

@Injectable()
export class AppConfigService {
  constructor(private readonly configService: ConfigService<EnvConfig, true>) {}

  get isDevelopment(): boolean {
    return (
      this.configService.get('NODE_ENV', { infer: true }) === 'development'
    );
  }
}
