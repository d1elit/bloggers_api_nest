import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Ip,
  Post,
  Res,
  Headers,
} from '@nestjs/common';
import { CreateUserDto } from '../dto/create-user.dto';
import { AuthService } from '../application/auth.service';
import { type LoginInput } from './input-dto/login.input.dto';
import type { Response } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

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
    @Res({ passthrough: true }) res: Response,
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
}
