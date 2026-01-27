import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { SessionsRepository } from '../../infrastructure/sessions.repository';
import { DomainException } from '../../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../../core/exceptions/domain-exception-codes';

export class DeleteDeviceCommand {
  constructor(
    public readonly deviceId: string,
    public readonly userId: string,
  ) {}
}

@CommandHandler(DeleteDeviceCommand)
export class DeleteDeviceUseCase implements ICommandHandler<
  DeleteDeviceCommand,
  void
> {
  constructor(private readonly sessionsRepository: SessionsRepository) {}
  async execute({ deviceId, userId }: DeleteDeviceCommand) {
    const session =
      await this.sessionsRepository.findByDeviceIdOrFail(deviceId);
    if (session && session.userId !== userId) {
      throw new DomainException({
        code: DomainExceptionCode.Forbidden,
        extensions: [
          {
            field: 'device',
            message: 'wrong device',
          },
        ],
      });
    }
    await this.sessionsRepository.deleteByDevice(deviceId);
  }
}
