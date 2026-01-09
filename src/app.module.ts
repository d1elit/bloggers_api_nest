import { DynamicModule, Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { BloggersPlatformModule } from './modules/bloggers-platform/bloggers-platform.module';
import { TestingModule } from './modules/testing/testing.module';
import { CoreModule } from './core/core.module';
import { UserAccountsModule } from './modules/user-accounts/user-accounts.module';
import { APP_FILTER } from '@nestjs/core';
import { AllHttpExceptionsFilter } from './core/exceptions/filters/base-exception.filter';
import { DomainHttpExceptionsFilter } from './core/exceptions/filters/domain-exception.filter';

import { configModule } from './config-dynamic-module';
import { CoreConfig } from './core/core.config'; // ← Правильный путь

@Module({
  imports: [
    configModule,
    MongooseModule.forRoot('mongodb://localhost/nest-api'),
    BloggersPlatformModule,
    TestingModule,
    CoreModule,
    UserAccountsModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    // {
    //   provide: APP_FILTER,
    //   useClass: AllHttpExceptionsFilter,
    // },
    {
      provide: APP_FILTER,
      useClass: DomainHttpExceptionsFilter,
    },
  ],
})
export class AppModule {
  static async forRoot(coreConfig: CoreConfig): Promise<DynamicModule> {
    // такой мудрёный способ мы используем, чтобы добавить к основным модулям необязательный модуль.
    // чтобы не обращаться в декораторе к переменной окружения через process.env в декораторе, потому что
    // запуск декораторов происходит на этапе склейки всех модулей до старта жизненного цикла самого NestJS

    return {
      module: AppModule,
      // imports: [...(coreConfig.includeTestingModule ? [TestingModule] : [])], // Add dynamic modules here
    };
  }
}
