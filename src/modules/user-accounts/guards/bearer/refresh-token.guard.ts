import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { UsersQueryRepository } from '../../infrastructure/query/users.query-repository';
import { Request } from 'express';
import { Reflector } from '@nestjs/core';
import { DomainException } from '../../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../../core/exceptions/domain-exception-codes';
import { AuthService } from '../../application/auth.service';
import { JwtService } from '../../application/jwt.service';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { UserContext } from '../types';

@Injectable()
export class RefreshTokenGuard implements CanActivate {
  constructor(
    private readonly usersQueryRepository: UsersQueryRepository,
    private reflector: Reflector,
    private authService: AuthService,
    private jwtService: JwtService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();

    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      return true;
    }

    const refreshToken = request.cookies?.refreshToken;
    console.log('refreshToken', refreshToken);
    if (!refreshToken) {
      throw new DomainException({
        code: DomainExceptionCode.Unauthorized,
        extensions: [
          {
            field: 'token',
            message: 'Refresh token not found',
          },
        ],
      });
    }

    try {
      // Верифицируем токен
      const payload = await this.jwtService.verifyRefreshToken(refreshToken);

      if (!payload) {
        throw new DomainException({
          code: DomainExceptionCode.Unauthorized,
          extensions: [
            {
              field: 'token',
              message: 'Refresh token not found',
            },
          ],
        });
      }
      await this.authService.ensureRefreshTokenValid(payload, refreshToken);

      // Добавляем пользователя в request
      request.user = {
        userId: payload.userId,
        deviceId: payload.deviceId,
      } as UserContext;

      return true;
    } catch (error) {
      throw new DomainException({
        code: DomainExceptionCode.Unauthorized,
        extensions: [
          {
            field: 'token',
            message: 'Invalid or expired REFRESH token',
          },
        ],
      });
    }
  }
}
