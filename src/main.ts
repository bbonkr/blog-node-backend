import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

const port = parseInt(process.env.PORT || '3000', 10);

if (port) {
  async function bootstrap() {
    const app = await NestFactory.create(AppModule);
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    await app.listen(port);
  }
  bootstrap();
} else {
  throw new Error('Check your listening port configuration.');
}
