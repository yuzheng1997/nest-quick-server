import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { LoggerService } from './shared/logger/logger.service';
import { LoggerInterceptor } from './interceptors/logger/logger.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useLogger(app.get(LoggerService));
  app.useGlobalInterceptors(new LoggerInterceptor());
  await app.listen(3000);
}
bootstrap();
