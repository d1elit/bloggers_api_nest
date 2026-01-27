import { ConfigModule } from '@nestjs/config';
import { join } from 'path';

// you must import this const in the head of your app.module.ts
export const configModule = ConfigModule.forRoot({
  envFilePath: [
    `.env.${process.env.NODE_ENV}.local`,
    `.env.${process.env.NODE_ENV}`,
    '.env.local',
    '.env',
  ],
  isGlobal: true,
});
