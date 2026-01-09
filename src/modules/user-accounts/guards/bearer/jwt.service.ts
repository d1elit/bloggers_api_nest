import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import jwt from 'jsonwebtoken';
import { DomainException } from '../../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../../core/exceptions/domain-exception-codes';
import { refreshTokenPyaloadDto } from '../dto/refresh-token-pyaload.dto';

@Injectable()
export class JwtService {
  constructor(private configService: ConfigService) {}
  async createAccessToken(userId: string): Promise<string> {
    return jwt.sign(
      { userId },
      this.configService.get('ACCESS_TOKEN_SECRET')!,
      {
        expiresIn: `${this.configService.get('ACCESS_TOKEN_EXPIRE_IN')!}s`,
      },
    );
  }

  async createRefreshToken(userId: string, deviceId: string): Promise<string> {
    return jwt.sign(
      { deviceId, userId },
      this.configService.get('REFRESH_TOKEN_SECRET')!,
      {
        expiresIn: `${this.configService.get('REFRESH_TOKEN_EXPIRE_IN')!}s`,
      },
    );
  }

  async verifyToken(token: string): Promise<{ userId: string } | null> {
    try {
      return jwt.verify(
        token,
        this.configService.get('ACCESS_TOKEN_SECRET')!,
      ) as { userId: string };
    } catch (e: unknown) {
      throw new DomainException({
        code: DomainExceptionCode.Forbidden,
        message: 'Unauthorized access token',
      });
    }
  }

  async verifyRefreshToken(refreshToken: string): Promise<{
    userId: string;
    deviceId: string;
    iat: number;
    exp: number;
  } | null> {
    try {
      return jwt.verify(
        refreshToken,
        this.configService.get('REFRESH_TOKEN_SECRET')!,
      ) as refreshTokenPyaloadDto;
    } catch (e: unknown) {
      throw new DomainException({
        code: DomainExceptionCode.Forbidden,
        message: 'Unauthorized access token',
      });
    }
  }
}
