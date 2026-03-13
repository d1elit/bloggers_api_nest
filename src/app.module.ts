import { configModule } from './config-dynamic-module';
import { DynamicModule, Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { BloggersPlatformModule } from './modules/bloggers-platform/bloggers-platform.module';
import { TestingModule } from './modules/testing/testing.module';
import { CoreModule } from './core/core.module';
import { UserAccountsModule } from './modules/user-accounts/user-accounts.module';
import { APP_FILTER, APP_GUARD } from '@nestjs/core';
import { AllHttpExceptionsFilter } from './core/exceptions/filters/base-exception.filter';
import { DomainHttpExceptionsFilter } from './core/exceptions/filters/domain-exception.filter';

import { CoreConfig } from './core/core.config';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { TypeOrmModule } from '@nestjs/typeorm'; // ← Правильный путь
console.log(CoreConfig);
@Module({
  imports: [
    ThrottlerModule.forRoot({
      throttlers: [
        {
          ttl: 10000,
          limit: 5,
        },
      ],
    }),
    configModule,
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'nodejs',
      password: '12345',
      database: 'nest-postgre',
      autoLoadEntities: false,
      synchronize: false,
    }),
    MongooseModule.forRoot('mongodb://localhost/nest-api'),
    CoreModule,
    UserAccountsModule,
    BloggersPlatformModule,
    TestingModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    // {
    //   provide: APP_GUARD,
    //   useClass: ThrottlerGuard,
    // },
    {
      provide: APP_FILTER,
      useClass: AllHttpExceptionsFilter,
    },
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
    const modules: any[] = [
      // MongooseModule.forRootAsync({
      //   // если CoreModule не глобальный, то явно импортируем в монгусовский модуль, иначе CoreConfig не заинджектится
      //   imports: [CoreModule],
      //   useFactory: (coreConfig: CoreConfig) => {
      //     // используем DI чтобы достать mongoURI контролируемо
      //     return {
      //       uri: coreConfig.mongoURI,
      //     };
      //   },
      //   inject: [CoreConfig],
      // }),
    ];
    return {
      module: AppModule,

      // imports: [...(coreConfig.includeTestingModule ? [TestingModule] : [])], // Add dynamic modules here
    };
  }
}
