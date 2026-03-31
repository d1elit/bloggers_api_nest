import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { AccessTokenGuard } from './guards/bearer/access-token.guard';
import { AuthController } from './api/auth.controller';
import { SecurityDevicesController } from './api/security-devices.controller';
import { UsersController } from './api/users.controller';
import { CryptoService } from './application/crypto.service';
import { JwtService } from './application/jwt.service';
import { NodemailerService } from './application/nodemailer.service';
import { CreateUserUseCase } from './application/usecases/create-user.usecase';
import { DeleteUserUseCase } from './application/usecases/delete-user.usecase';
import { EmailResendingUseCase } from './application/usecases/email-resending.usecase';
import { LoginUserUseCase } from './application/usecases/login.usecase';
import { LogoutUseCase } from './application/usecases/logout.usecase';
import { PasswordRecoveryConfirmationUseCase } from './application/usecases/password-recovery-confirmation.usecase';
import { PasswordRecoveryUseCase } from './application/usecases/password-recovery.usecase';
import { RefreshTokenUseCase } from './application/usecases/refresh-token.usecase';
import { RegisterUseCase } from './application/usecases/register.usecase';
import { RegistrationConfirmationUseCase } from './application/usecases/registration-confirmation.usecase';
import { ValidateRefreshTokenUseCase } from './application/usecases/validate-refresh-token.usecase';

import { UsersService } from './application/users.service';
import { UsersExternalQueryRepository } from './infrastructure/external-query/users.external-query-repository';
import { UsersExternalRepository } from './infrastructure/users.external.repository';
import { AuthQueryRepository } from './infrastructure/query/auth.query-repository';
import { SecurityDevicesQueryRepository } from './infrastructure/query/security-devices.query-repository';
import { UsersQueryRepository } from './infrastructure/query/users.query-repository';
import { SessionsRepository } from './infrastructure/sessions.repository';
import { UsersRepository } from './infrastructure/users.repository';
import { RefreshTokenGuard } from './guards/bearer/refresh-token.guard';
import { AuthService } from './application/auth.service';
import { SessionsQueryRepository } from './infrastructure/query/sessions.query-repository';
import { GetDeviceListQueryHandler } from './application/queries/get-device-list.query';
import { DeleteDeviceUseCase } from './application/usecases/delete-device.usecase';
import { DeleteDeviceExceptCurrentUseCase } from './application/usecases/delete-device-except-current.usecase';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './domain/user.entity';

const useCases = [
  CreateUserUseCase,
  DeleteUserUseCase,
  LoginUserUseCase,
  RegisterUseCase,
  RegistrationConfirmationUseCase,
  EmailResendingUseCase,
  PasswordRecoveryUseCase,
  PasswordRecoveryConfirmationUseCase,
  RefreshTokenUseCase,
  ValidateRefreshTokenUseCase,
  LogoutUseCase,
  DeleteDeviceUseCase,
  DeleteDeviceExceptCurrentUseCase,
];

@Module({
  imports: [
    CqrsModule,
    TypeOrmModule.forFeature([User]),
    // MongooseModule.forFeature([{ name: UserMongo.name, schema: UserSchema }]),
    // MongooseModule.forFeature([
    //   { name: SessionMongo.name, schema: SessionSchema },
    // ]),
  ],
  controllers: [
    UsersController,
    AuthController,
    SecurityDevicesController,
    SecurityDevicesController,
  ],
  providers: [
    UsersRepository,
    UsersQueryRepository,
    SecurityDevicesQueryRepository,
    AuthQueryRepository,
    UsersExternalQueryRepository,
    CryptoService,
    JwtService,
    SessionsRepository,
    NodemailerService,
    UsersService,
    AccessTokenGuard,
    RefreshTokenGuard,
    UsersExternalRepository,
    AuthService,
    SessionsQueryRepository,
    GetDeviceListQueryHandler,
    ...useCases,
  ],
  exports: [
    UsersExternalQueryRepository,
    AccessTokenGuard,
    JwtService,
    UsersService,
    UsersQueryRepository,
    UsersExternalRepository,
  ],
})
export class UserAccountsModule {}
