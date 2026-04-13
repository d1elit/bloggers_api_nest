import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

import { CoreConfig } from './core/core.config';
import cookieParser from 'cookie-parser';
import { appSetup } from './setup/app.setup';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const coreConfig = app.get(CoreConfig);

  app.use(cookieParser());
  appSetup(app);

  await app.listen(coreConfig.port, () => {
    console.log('App starting listen port: ', coreConfig.port);
  });
}
bootstrap();
