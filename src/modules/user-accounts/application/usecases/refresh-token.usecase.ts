import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { jwtDecode } from 'jwt-decode';
import { SessionsRepository } from '../../infrastructure/sessions.repository';
import { JwtService } from '../jwt.service';

export class RefreshTokenCommand {
  constructor(
    public token: string,
    public userId: string,
    public deviceId: string,
  ) {}
}

@CommandHandler(RefreshTokenCommand)
export class RefreshTokenUseCase
  implements ICommandHandler<RefreshTokenCommand, string[]>
{
  constructor(
    private jwtService: JwtService,
    private sessionsRepository: SessionsRepository,
  ) {}

  async execute(command: RefreshTokenCommand): Promise<string[]> {
    const { token, userId, deviceId } = command;
    const oldVersion = jwtDecode(token).iat;

    const accessToken = await this.jwtService.createAccessToken(userId);
    const refreshToken = await this.jwtService.createRefreshToken(
      userId,
      deviceId,
    );

    const { exp, iat } = jwtDecode(refreshToken);
    await this.sessionsRepository.update(iat!, exp!, oldVersion!);
    return [accessToken, refreshToken];
  }
}
