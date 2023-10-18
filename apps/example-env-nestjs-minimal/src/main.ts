import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
import { env } from './app/env';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(env.api.port);

  Logger.log(`🚀 Application is running on: http://${env.api.host}:${env.api.port}`);
}

bootstrap();
