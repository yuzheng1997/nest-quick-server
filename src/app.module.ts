import { Module } from '@nestjs/common';
import { LoggerModule } from './shared/logger/logger.module';
import { UserModules } from './modules/user/user.modules';

@Module({
  imports: [
    UserModules,
    {
      module: LoggerModule,
      global: true,
    },
  ],
})
export class AppModule {}
