import { InjectModel } from '@nestjs/mongoose';
import { Injectable } from '@nestjs/common';
import { User, UserDocument, type UserModelType } from '../domain/user.entity';
import { UsersRepository } from '../infrastructure/users.repository';
import { authInput } from '../api/input-dto/auth/auth.input-dto';
import { LoginInput } from '../api/input-dto/auth/login.input.dto';
import { CryptoService } from './crypto.service';
import { DomainException } from '../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../core/exceptions/domain-exception-codes';
import * as crypto from 'node:crypto';
import { JwtService } from './jwt.service';
import { jwtDecode } from 'jwt-decode';
import { Session, type SessionModelType } from '../domain/session.entity';
import { SessionsRepository } from '../infrastructure/sessions.repository';
import { UsersService } from './users.service';
import { CreateUserInputDto } from '../api/input-dto/users/users.input-dto';
import { NodemailerService } from './nodemailer.service';
import { emailExamples } from './email-examples';
import { refreshTokenPayload } from '../api/input-dto/auth/refresh-token-payload';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name)
    private UserModel: UserModelType,
    @InjectModel(Session.name)
    private SessionModel: SessionModelType,
    private usersRepository: UsersRepository,
    private cryptoService: CryptoService,
    private jwtService: JwtService,
    private sessionsRepository: SessionsRepository,
    private usersService: UsersService,
    private nodemailerService: NodemailerService,
  ) {}

  async register(userDto: CreateUserInputDto) {
    const confirmationCode = crypto.randomUUID();
    console.log(userDto);
    await this.usersService.createUser(userDto, confirmationCode);
    this.nodemailerService
      .sendEmail(
        userDto.email,
        emailExamples.registrationEmail(confirmationCode),
      )
      .catch((error) => {
        console.log('Email sending failed', error);
      });
  }
  async registrationConfirmation(code: string) {
    const user = await this.usersRepository.findByCodeOrError(code);
    const validation = user.canConfirmEmail(code);
    if (!validation.isValid) {
      throw new DomainException({
        code: DomainExceptionCode.BadRequest,
        extensions: [
          {
            field: 'code',
            message: 'Wrong code',
          },
        ],
      });
    }
    user.confirmEmail();
    await this.usersRepository.save(user);
  }

  async emailResending(email: string) {
    const user = await this.usersRepository.findByLoginOrEmail(email);
    if (!user)
      throw new DomainException({
        code: DomainExceptionCode.BadRequest,
        extensions: [
          {
            field: 'email',
            message: 'Email not exist',
          },
        ],
      });

    if (user.isEmailConfirmed())
      throw new DomainException({
        code: DomainExceptionCode.BadRequest,
        extensions: [
          {
            field: 'email',
            message: 'Email already confirmed',
          },
        ],
      });

    const confirmationCode = crypto.randomUUID();

    user.updateEmailConfirmationCode(confirmationCode);
    await this.usersRepository.save(user);

    await this.nodemailerService.sendEmail(
      email,
      emailExamples.registrationEmail(confirmationCode),
    );
  }

  async passwordRecovery(email: string) {
    const user = await this.usersRepository.findByEmail(email);
    if (!user) return;

    const recoveryCode = crypto.randomUUID();
    user.updatePasswordRecoveryCode(recoveryCode);
    await this.usersRepository.save(user);

    this.nodemailerService
      .sendEmail(email, emailExamples.passwordRecoveryEmail(recoveryCode))
      .catch((error) => {
        console.log('Email sending failed', error);
      });
    return recoveryCode;
  }

  async passwordRecoveryConfirmation({
    code,
    password,
  }: {
    code: string;
    password: string;
  }) {
    const user = await this.usersRepository.findByRecoveryCodeOrError(code);
    const validation = user.canRecoverPassword(code);
    if (!validation.isValid) {
      throw new DomainException({
        code: DomainExceptionCode.BadRequest,
        extensions: [
          {
            field: 'code',
            message: 'Wrong code',
          },
        ],
      });
    }
    const newPassword = await this.cryptoService.createPasswordHash(password);
    user.updatePassword(newPassword);
    await this.usersRepository.save(user);
  }

  async refreshToken(token: string, userId: string, deviceId: string) {
    const oldVersion = jwtDecode(token).iat;

    const accessToken = await this.jwtService.createAccessToken(userId);
    const refreshToken = await this.jwtService.createRefreshToken(
      userId,
      deviceId,
    );

    const { exp, iat } = jwtDecode(refreshToken);
    await this.sessionsRepository.update(iat!, exp!, oldVersion!);
    return [accessToken, refreshToken];
  }

  async ensureRefreshTokenValid(payload: refreshTokenPayload, token: string) {
    const session = await this.sessionsRepository.find(
      payload.iat,
      payload.deviceId,
    );

    if (!session)
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        extensions: [
          {
            field: 'session',
            message: 'Not Found',
          },
        ],
      });
  }

  async revokeToken(token: string) {
    const { iat } = jwtDecode(token);
    await this.sessionsRepository.delete(iat!);
  }
  async logout(token: string) {
    await this.revokeToken(token);
  }
}
