import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

import { CoreConfig } from './core/core.config';
import cookieParser from 'cookie-parser';
import { appSetup } from './setup/app.setup';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(cookieParser());
  const coreConfig = app.get(CoreConfig);
  appSetup(app);
  const port = coreConfig.port;
  await app.listen(port, () => {
    console.log('App starting listen port: ', port);
  });
}
bootstrap();
