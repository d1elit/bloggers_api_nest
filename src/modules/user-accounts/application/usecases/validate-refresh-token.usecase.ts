import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { DomainException } from '../../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../../core/exceptions/domain-exception-codes';
import { refreshTokenPayload } from '../../api/input-dto/auth/refresh-token-payload';
import { SessionsRepository } from '../../infrastructure/sessions.repository';

export class ValidateRefreshTokenCommand {
  constructor(public payload: refreshTokenPayload) {}
}

@CommandHandler(ValidateRefreshTokenCommand)
export class ValidateRefreshTokenUseCase
  implements ICommandHandler<ValidateRefreshTokenCommand, void>
{
  constructor(private sessionsRepository: SessionsRepository) {}

  async execute(command: ValidateRefreshTokenCommand): Promise<void> {
    const { payload } = command;
    const session = await this.sessionsRepository.find(
      payload.iat,
      payload.deviceId,
    );

    if (!session)
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        extensions: [
          {
            field: 'session',
            message: 'Not Found',
          },
        ],
      });
  }
}
