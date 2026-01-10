import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { CoreConfig } from './core/core.config';
import cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(cookieParser());
  const coreConfig = app.get(CoreConfig);
  console.log(coreConfig);
  const port = coreConfig.port;
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      stopAtFirstError: true,
    }),
  );
  await app.listen(port, () => {
    console.log('App starting listen port: ', port);
  });
}
bootstrap();
