import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

import { CoreConfig } from './core/core.config';
import cookieParser from 'cookie-parser';
import { appSetup } from './setup/app.setup';
import * as process from 'node:process';

async function bootstrap() {
  // console.log(process.env.NODE_ENV);
  const appContext = await NestFactory.createApplicationContext(AppModule);

  const coreConfig = appContext.get<CoreConfig>(CoreConfig);
  // console.log(appContext);
  // console.log(
  //   '+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++',
  // );

  const DynamicAppModule = await AppModule.forRoot(coreConfig);
  const app = await NestFactory.create(DynamicAppModule);

  await appContext.close();

  app.use(cookieParser());
  appSetup(app);
  const port = coreConfig.port;
  await app.listen(port, () => {
    console.log('App starting listen port: ', port);
  });
}
bootstrap();
