import {
  Body,
  Controller,
  Get,
  Headers,
  HttpCode,
  HttpStatus,
  Ip,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import type { Request } from 'express';
import express from 'express';
import { EmailResendingCommand } from '../application/usecases/email-resending.usecase';
import { LoginUserCommand } from '../application/usecases/login.usecase';
import { LogoutCommand } from '../application/usecases/logout.usecase';
import { PasswordRecoveryConfirmationCommand } from '../application/usecases/password-recovery-confirmation.usecase';
import { PasswordRecoveryCommand } from '../application/usecases/password-recovery.usecase';
import { RefreshTokenCommand } from '../application/usecases/refresh-token.usecase';
import { RegisterCommand } from '../application/usecases/register.usecase';
import { RegistrationConfirmationCommand } from '../application/usecases/registration-confirmation.usecase';
import { RefreshTokenGuard } from '../guards/bearer/refresh-token.guard';
import { UsersQueryRepository } from '../infrastructure/query/users.query-repository';
import { EmailResendingInputDto } from './input-dto/auth/email-resending.input-dto';
import { type LoginInput } from './input-dto/auth/login.input.dto';
import { NewPasswordInputDto } from './input-dto/auth/new-password.input-dto';
import { PasswordRecoveryInputDto } from './input-dto/auth/password-recovery.input-dto';
import { CreateUserInputDto } from './input-dto/users/users.input-dto';
import { ExtractUserFromRequest } from '../guards/decorators/param/extract-user-from-request.decorator';
import { UserContextDto } from '../guards/dto/user-context.dto';
import { SkipThrottle, Throttle } from '@nestjs/throttler';
import { AccessTokenGuard } from '../guards/bearer/access-token.guard';
import { EmailConfirmationInputDto } from './input-dto/auth/email-confirmation.input-dto';

@Controller('auth')
export class AuthController {
  constructor(
    private usersQueryRepository: UsersQueryRepository,
    private commandBus: CommandBus,
  ) {}

  @Post('/registration')
  @HttpCode(HttpStatus.NO_CONTENT)
  async register(@Body() dto: CreateUserInputDto) {
    console.log(dto);
    return await this.commandBus.execute(new RegisterCommand(dto));
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

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'strict', // РЕКОМЕНДУЕТСЯ
    });

    return { accessToken };
  }

  @Post('/registration-confirmation')
  @HttpCode(HttpStatus.NO_CONTENT)
  async registrationConfirmation(@Body() body: EmailConfirmationInputDto) {
    await this.commandBus.execute(
      new RegistrationConfirmationCommand(body.code),
    );
  }

  @Post('/registration-email-resending')
  @HttpCode(HttpStatus.NO_CONTENT)
  async emailResending(@Body() body: EmailResendingInputDto) {
    await this.commandBus.execute(new EmailResendingCommand(body.email));
  }

  @SkipThrottle()
  @UseGuards(AccessTokenGuard)
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
    return await this.commandBus.execute(
      new PasswordRecoveryCommand(body.email),
    );
  }

  @Post('new-password')
  @HttpCode(HttpStatus.NO_CONTENT)
  async newPassword(@Body() body: NewPasswordInputDto) {
    const code = body.recoveryCode;
    const password = body.newPassword;
    return await this.commandBus.execute(
      new PasswordRecoveryConfirmationCommand(code, password),
    );
  }
  @SkipThrottle()
  @UseGuards(RefreshTokenGuard)
  @Post('/refresh-token')
  @HttpCode(HttpStatus.OK)
  async refreshToken(
    @ExtractUserFromRequest() user: UserContextDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: express.Response,
  ) {
    const { userId, deviceId } = user;
    const token = req.cookies.refreshToken;
    const [accessToken, refreshToken] = await this.commandBus.execute(
      new RefreshTokenCommand(token, userId, deviceId as string),
    );
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'strict', // РЕКОМЕНДУЕТСЯ
    });
    return { accessToken };
  }

  @SkipThrottle()
  @UseGuards(RefreshTokenGuard)
  @Post('/logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  async logout(@Req() req: Request) {
    const token = req.cookies.refreshToken;
    await this.commandBus.execute(new LogoutCommand(token));
  }
}
