import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Request } from 'express';
import { Reflector } from '@nestjs/core';
import { DomainException } from '../../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../../core/exceptions/domain-exception-codes';
import { JwtService } from '../../application/jwt.service';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { UserContext } from '../types.d';

@Injectable()
export class AccessTokenGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
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

    const authHeader = request.headers.authorization;
    if (!authHeader) {
      throw new DomainException({
        code: DomainExceptionCode.Unauthorized,
        message: 'Authorization header is missing',
      });
    }

    const [authType, token] = authHeader.split(' ');
    if (authType !== 'Bearer' || !token) {
      throw new DomainException({
        code: DomainExceptionCode.Unauthorized,
        message: 'Invalid authorization header',
      });
    }

    try {
      const payload = await this.jwtService.verifyToken(token);
      if (!payload) {
        throw new DomainException({
          code: DomainExceptionCode.Unauthorized,
          message: 'Invalid access token',
        });
      }

      request.user = {
        userId: payload.userId,
      } as UserContext;

      return true;
    } catch (error) {
      // Catching errors from jwtService.verifyToken (like token expiration)
      throw new DomainException({
        code: DomainExceptionCode.Unauthorized,
        message: 'Invalid or expired access token',
      });
    }
  }
}
