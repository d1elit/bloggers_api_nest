import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Ip,
  Post,
  Res,
  Headers,
  Get,
  UseGuards,
  Req,
} from '@nestjs/common';
import { CreateUserDto } from '../dto/create-user.dto';
import { AuthService } from '../application/auth.service';
import { type LoginInput } from './input-dto/login.input.dto';
import express from 'express';
import { EmailResendingInputDto } from './input-dto/email-resending.input-dto';
import { RefreshTokenGuard } from '../guards/bearer/refresh-token.guard';
import type { Request } from 'express';
import { UsersQueryRepository } from '../infrastructure/query/users.query-repository';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private usersQueryRepository: UsersQueryRepository,
  ) {}

  @Post('/registration')
  @HttpCode(HttpStatus.NO_CONTENT)
  async register(@Body() dto: CreateUserDto) {
    return await this.authService.register(dto);
  }

  @Post('/login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() loginDto: LoginInput,
    @Headers('user-agent') userAgent: string,
    @Ip() ip: string,
    @Res({ passthrough: true }) res: express.Response,
  ) {
    const deviceName = userAgent?.split('/')[0] || 'unknown device';
    const clientIp = ip || 'unknown ip';

    const [accessToken, refreshToken] = await this.authService.login({
      loginDto,
      ip: clientIp,
      deviceName,
    });

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'strict', // РЕКОМЕНДУЕТСЯ
    });

    return { accessToken };
  }

  @Post('/registration-confirmation')
  @HttpCode(HttpStatus.NO_CONTENT)
  async registrationConfirmation(@Body() body: { code: string }) {
    await this.authService.registrationConfirmation(body.code);
  }

  @Post('/registration-email-resending')
  @HttpCode(HttpStatus.NO_CONTENT)
  async emailResending(@Body() body: EmailResendingInputDto) {
    await this.authService.emailResending(body.email);
  }
  @UseGuards(RefreshTokenGuard)
  @Get('/me')
  @HttpCode(HttpStatus.OK)
  async getAuthMe(@Req() req: Request) {
    const userId = req.user?.userId || '';

    const me = await this.usersQueryRepository.getByIdOrNotFoundFail(userId);
    return {
      email: me.email,
      login: me.login,
      userId: me.id,
    };
  }
}
