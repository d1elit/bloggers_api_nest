import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { UserMongoDocument } from '../../domain/user-mongo.entity';
import { authInput } from '../../api/input-dto/auth/auth.input-dto';
import { DomainException } from '../../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../../core/exceptions/domain-exception-codes';
import crypto from 'node:crypto';
import { jwtDecode } from 'jwt-decode';
import { LoginInput } from '../../api/input-dto/auth/login.input.dto';
import { UsersRepository } from '../../infrastructure/users.repository';
import { CryptoService } from '../crypto.service';
import { JwtService } from '../jwt.service';
import { SessionsRepository } from '../../infrastructure/sessions.repository';
import { Session } from '../../domain/session.entity';
import { randomUUID } from 'crypto';
import { User } from '../../domain/user.entity';

export class LoginUserCommand {
  constructor(public inputDto: authInput) {}
}

@CommandHandler(LoginUserCommand)
export class LoginUserUseCase implements ICommandHandler<
  LoginUserCommand,
  string[]
> {
  constructor(
    // @InjectModel(SessionMongo.name)
    // private SessionModel: SessionModelType,
    private sessionsRepository: SessionsRepository,
    private usersRepository: UsersRepository,
    private cryptoService: CryptoService,
    private jwtService: JwtService,
  ) {}

  async execute(command: LoginUserCommand): Promise<string[]> {
    const { inputDto } = command;
    const deviceName = inputDto.deviceName;
    const ip = inputDto.ip;

    const user = await this.checkUserCredentials(inputDto.loginDto);

    const deviceId = randomUUID();
    console.log(deviceId);

    const accessToken = await this.jwtService.createAccessToken(
      user.id.toString(),
    );
    const refreshToken = await this.jwtService.createRefreshToken(
      user.id.toString(),
      deviceId,
    );
    const { exp, iat } = jwtDecode(refreshToken);

    const session = Session.createNew({
      deviceId,
      deviceName,
      userId: user.id.toString(),
      ip,
      iat: iat!,
      exp: exp!,
    });
    console.log(session);
    await this.sessionsRepository.create(session);

    return [accessToken, refreshToken];
  }
  async checkUserCredentials(loginDto: LoginInput): Promise<User> {
    const user = await this.verifyLoginOrEmail(loginDto.loginOrEmail);

    const isPasswordVerified = await this.cryptoService.comparePassword({
      password: loginDto.password,
      hash: user.passwordHash,
    });

    if (!isPasswordVerified) {
      throw new DomainException({
        code: DomainExceptionCode.Unauthorized,
        extensions: [
          {
            field: 'login',
            message: 'Wrong login or password',
          },
        ],
      });
    }
    return user;
  }

  async verifyLoginOrEmail(login: string): Promise<User> {
    const user = await this.usersRepository.findByLoginOrEmail(login);
    console.log(user);
    if (!user) {
      throw new DomainException({
        code: DomainExceptionCode.Unauthorized,
        extensions: [
          {
            field: 'login',
            message: 'Wrong login or password',
          },
        ],
      });
    }
    return user;
  }
}
