import {
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Req,
  UseGuards,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { RefreshTokenGuard } from '../guards/bearer/refresh-token.guard';
import { ExtractUserFromRequest } from '../guards/decorators/param/extract-user-from-request.decorator';
import { UserContextDto } from '../guards/dto/user-context.dto';
import { GetDeviceListQuery } from '../application/queries/get-device-list.query';
import { DeleteDeviceCommand } from '../application/usecases/delete-device.usecase';
import { DeleteDeviceExceptCurrentCommand } from '../application/usecases/delete-device-except-current.usecase';
import type { Request } from 'express';

import { refreshTokenPayload } from './input-dto/auth/refresh-token-payload';
import { jwtDecode } from 'jwt-decode';
import { SkipThrottle } from '@nestjs/throttler';
@SkipThrottle()
@Controller('security/devices')
export class SecurityDevicesController {
  constructor(
    private readonly queryBus: QueryBus,
    private commandBus: CommandBus,
  ) {}

  @UseGuards(RefreshTokenGuard)
  @Get('')
  async getAll(@ExtractUserFromRequest() user: UserContextDto) {
    return this.queryBus.execute(new GetDeviceListQuery(user.userId));
  }

  @UseGuards(RefreshTokenGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(':id')
  async deleteDevice(
    @ExtractUserFromRequest() user: UserContextDto,
    @Param('id') id: string,
  ) {
    return this.commandBus.execute(new DeleteDeviceCommand(id, user.userId));
  }
  @UseGuards(RefreshTokenGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete('')
  async deleteDeviceExceptCurrent(@Req() req: Request) {
    const refreshToken = req.cookies.refreshToken;
    const { deviceId }: refreshTokenPayload = jwtDecode(refreshToken);
    return this.commandBus.execute(
      new DeleteDeviceExceptCurrentCommand(deviceId),
    );
  }
}
