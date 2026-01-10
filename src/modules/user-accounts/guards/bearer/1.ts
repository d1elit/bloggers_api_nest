// import {
//   CanActivate,
//   ExecutionContext,
//   Injectable,
//   UnauthorizedException,
// } from '@nestjs/common';
// import { Request } from 'express';
// import { AuthService } from '../../application/auth.service';
// import { JwtService } from '../../application/jwt.service';
//
// export interface UserContext {
//   userId: string;
//   deviceId: string;
// }
//
// // Расширяем тип Request для TypeScript
// declare global {
//   namespace Express {
//     interface Request {
//       user?: UserContext;
//     }
//   }
// }
//
// @Injectable()
// export class RefreshTokenGuard implements CanActivate {
//   constructor(
//     private authService: AuthService,
//     private jwtService: JwtService,
//   ) {}
//
//   async canActivate(context: ExecutionContext): Promise<boolean> {
//     const request = context.switchToHttp().getRequest<Request>();
//
//     const refreshToken = request.cookies?.refreshToken;
//
//     if (!refreshToken) {
//       throw new UnauthorizedException('Refresh token not found');
//     }
//
//     try {
//       // Верифицируем токен
//       const payload = this.jwtService.verifyRefreshToken(refreshToken);
//
//       if (!payload) {
//         throw new UnauthorizedException('Invalid refresh token');
//       }
//
//       // Проверяем валидность токена в БД
//       await this.authService.ensureRefreshTokenValid(payload, refreshToken);
//
//       // Добавляем пользователя в request
//       request.user = {
//         userId: payload.userId,
//         deviceId: payload.deviceId,
//       };
//
//       return true;
//     } catch (error) {
//       throw new UnauthorizedException('Invalid or expired refresh token');
//     }
//   }
// }
