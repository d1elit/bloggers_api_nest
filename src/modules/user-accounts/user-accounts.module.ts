import { Module } from '@nestjs/common';
import { UsersController } from './api/users.controller';
import { UsersService } from './application/users.service';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './domain/user.entity';
import { UsersRepository } from './infrastructure/users.repository';
import { UsersQueryRepository } from './infrastructure/query/users.query-repository';
import { AuthController } from './api/auth.controller';
import { SecurityDevicesQueryRepository } from './infrastructure/query/security-devices.query-repository';
import { AuthQueryRepository } from './infrastructure/query/auth.query-repository';
import { SecurityDevicesController } from './api/security-devices.controller';
import { UsersExternalQueryRepository } from './infrastructure/external-query/users.external-query-repository';
import { UsersExternalService } from './application/users.external-service';
import { CryptoService } from './application/crypto.service';
import { JwtService } from './application/jwt.service';
import { Session, SessionSchema } from './domain/session.entity';
import { AuthService } from './application/auth.service';
import { SessionsRepository } from './infrastructure/sessions.repository';
import { NodemailerService } from './application/nodemailer.service';
import { CqrsModule } from '@nestjs/cqrs';
import { CreateUserUseCase } from './application/usecases/create-user.usecase';
import { DeleteUserUseCase } from './application/usecases/delete-user.usecase';
import { AccessTokenGuard } from './guards/bearer/access-token.guard';
import { UsersExternalRepository } from './infrastructure/users.external.repository';
import { LoginUserUseCase } from './application/usecases/login.usecase';

@Module({
  imports: [
    CqrsModule,
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    MongooseModule.forFeature([{ name: Session.name, schema: SessionSchema }]),
  ],
  controllers: [UsersController, AuthController, SecurityDevicesController],
  providers: [
    UsersRepository,
    UsersQueryRepository,
    SecurityDevicesQueryRepository,
    AuthQueryRepository,
    UsersExternalQueryRepository,
    UsersExternalService,
    CryptoService,
    JwtService,
    AuthService,
    SessionsRepository,
    NodemailerService,
    CreateUserUseCase,
    DeleteUserUseCase,
    UsersService,
    AccessTokenGuard,
    UsersExternalRepository,
    LoginUserUseCase,
  ],
  exports: [
    UsersExternalQueryRepository,
    UsersExternalService,
    AccessTokenGuard,
    JwtService,
    UsersService,
    UsersQueryRepository,
    UsersExternalRepository,
  ],
})
export class UserAccountsModule {}
