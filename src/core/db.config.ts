// src/core/database.config.ts
import { Injectable } from '@nestjs/common';
import { IsNotEmpty, IsNumber } from 'class-validator';
import { ConfigService } from '@nestjs/config';
import { configValidationUtility } from '../setup/config-validation-utility';

@Injectable()
export class DatabaseConfig {
  constructor(private configService: ConfigService<any, true>) {
    configValidationUtility.validateConfig(this);
  }

  @IsNotEmpty({ message: 'Set Env variable POSTGRES_HOST' })
  get host(): string {
    return this.configService.get('POSTGRES_HOST');
  }

  @IsNumber({}, { message: 'Set Env variable POSTGRES_PORT' })
  get port(): number {
    return Number(this.configService.get('POSTGRES_PORT'));
  }

  @IsNotEmpty({ message: 'Set Env variable POSTGRES_USER' })
  get username(): string {
    return this.configService.get('POSTGRES_USER');
  }

  @IsNotEmpty({ message: 'Set Env variable POSTGRES_PASSWORD' })
  get password(): string {
    return this.configService.get('POSTGRES_PASSWORD');
  }

  @IsNotEmpty({ message: 'Set Env variable POSTGRES_DATABASE' })
  get database(): string {
    return this.configService.get('POSTGRES_DATABASE');
  }

  get synchronize(): boolean {
    return this.configService.get('NODE_ENV') !== 'production';
  }
}
