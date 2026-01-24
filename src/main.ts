import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

import { CoreConfig } from './core/core.config';
import cookieParser from 'cookie-parser';
import { appSetup } from './setup/app.setup';

async function bootstrap() {
  const appContext = await NestFactory.createApplicationContext(AppModule);
  const coreConfig = appContext.get(CoreConfig);
  const DynamicAppModule = await AppModule.forRoot(coreConfig);
  const app = await NestFactory.create(DynamicAppModule);
  console.log(coreConfig);
  await appContext.close();

  app.use(cookieParser());
  appSetup(app);
  const port = coreConfig.port;
  await app.listen(port, () => {
    console.log('App starting listen port: ', port);
  });
}
bootstrap();
