import { Injectable } from '@nestjs/common';
import { DomainException } from '../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../core/exceptions/domain-exception-codes';
import { JwtService } from './jwt.service';
import { jwtDecode } from 'jwt-decode';

import { SessionsRepository } from '../infrastructure/sessions.repository';
import { refreshTokenPayload } from '../api/input-dto/auth/refresh-token-payload';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private sessionsRepository: SessionsRepository,
  ) {}

  async refreshToken(token: string, userId: string, deviceId: string) {
    const oldVersion = jwtDecode(token).iat;

    const accessToken = await this.jwtService.createAccessToken(userId);
    const refreshToken = await this.jwtService.createRefreshToken(
      userId,
      deviceId,
    );

    const { exp, iat } = jwtDecode(refreshToken);
    const session = await this.sessionsRepository.findByIat(oldVersion!);
    session?.update(iat!, exp!);
    if (session !== null) await this.sessionsRepository.save(session);

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
}
