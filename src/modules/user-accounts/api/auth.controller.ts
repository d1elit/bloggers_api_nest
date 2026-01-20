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
import { AuthService } from '../application/auth.service';
import { type LoginInput } from './input-dto/auth/login.input.dto';
import express from 'express';
import { EmailResendingInputDto } from './input-dto/auth/email-resending.input-dto';
import { RefreshTokenGuard } from '../guards/bearer/refresh-token.guard';
import type { Request } from 'express';
import { UsersQueryRepository } from '../infrastructure/query/users.query-repository';
import { NewPasswordInputDto } from './input-dto/auth/new-password.input-dto';
import { PasswordRecoveryInputDto } from './input-dto/auth/password-recovery.input-dto';
import { CreateUserInputDto } from './input-dto/users/users.input-dto';
import { CommandBus } from '@nestjs/cqrs';
import { LoginUserCommand } from '../application/usecases/login.usecase';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private usersQueryRepository: UsersQueryRepository,
    private commandBus: CommandBus,
  ) {}

  @Post('/registration')
  @HttpCode(HttpStatus.NO_CONTENT)
  async register(@Body() dto: CreateUserInputDto) {
    console.log(dto);
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

    const [accessToken, refreshToken] = await this.commandBus.execute(
      new LoginUserCommand({ loginDto, ip: clientIp, deviceName }),
    );

    // const [accessToken, refreshToken] = await this.authService.login({
    //   loginDto,
    //   ip: clientIp,
    //   deviceName,
    // });

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

  @Post('password-recovery')
  @HttpCode(HttpStatus.NO_CONTENT)
  async passwordRecovery(@Body() body: PasswordRecoveryInputDto) {
    return await this.authService.passwordRecovery(body.email);
  }

  @Post('new-password')
  @HttpCode(HttpStatus.NO_CONTENT)
  async newPassword(@Body() body: NewPasswordInputDto) {
    const code = body.recoveryCode;
    const password = body.newPassword;
    return await this.authService.passwordRecoveryConfirmation({
      code,
      password,
    });
  }
  // @UseGuards(RefreshTokenGuard)
  // @Post('/refresh-token')
  // @HttpCode(HttpStatus.OK)
  // async refreshToken(@Req() req: Request, @Res() res: Response) {
  //   const { userId, deviceId } = req.user!;
  //   const token = req.cookies.refreshToken;
  //   const [accessToken, refreshToken] = await this.authService.refreshToken(
  //     token,
  //     userId,
  //     deviceId as string,
  //   );
  //   res.cookie('refreshToken', refreshToken, {
  //     httpOnly: true,
  //     secure: true,
  //     sameSite: 'strict', // РЕКОМЕНДУЕТСЯ
  //   });
  //   return accessToken;
  // }
}
