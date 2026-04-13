import { Global, Module } from '@nestjs/common';
import { CoreConfig } from './core.config';
import { DatabaseConfig } from './db.config';

//глобальный модуль для провайдеров и модулей необходимых во всех частях приложения (например LoggerService, CqrsModule, etc...)
@Global()
@Module({
  exports: [CoreConfig, DatabaseConfig],
  providers: [CoreConfig, DatabaseConfig],
})
export class CoreModule {}
