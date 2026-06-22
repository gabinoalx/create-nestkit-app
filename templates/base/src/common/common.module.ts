import { Module, Global } from '@nestjs/common';
import { AppConfigService } from '@config/envs';

@Global()
@Module({
  providers: [AppConfigService],
  exports: [AppConfigService],
})
export class CommonModule {}
