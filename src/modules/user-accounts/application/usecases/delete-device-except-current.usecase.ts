import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { SessionsRepository } from '../../infrastructure/sessions.repository';
import { DomainException } from '../../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../../core/exceptions/domain-exception-codes';

export class DeleteDeviceExceptCurrentCommand {
  constructor(public readonly deviceId: string) {}
}

@CommandHandler(DeleteDeviceExceptCurrentCommand)
export class DeleteDeviceExceptCurrentUseCase implements ICommandHandler<
  DeleteDeviceExceptCurrentCommand,
  void
> {
  constructor(private readonly sessionsRepository: SessionsRepository) {}
  async execute({ deviceId }: DeleteDeviceExceptCurrentCommand) {
    await this.sessionsRepository.findByDeviceIdOrFail(deviceId);
    return this.sessionsRepository.deleteExceptCurrent(deviceId);
  }
}
