import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { DomainException } from '../../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../../core/exceptions/domain-exception-codes';
import { UsersRepository } from '../../infrastructure/users.repository';

export class RegistrationConfirmationCommand {
  constructor(public code: string) {}
}

@CommandHandler(RegistrationConfirmationCommand)
export class RegistrationConfirmationUseCase implements ICommandHandler<
  RegistrationConfirmationCommand,
  void
> {
  constructor(private usersRepository: UsersRepository) {}

  async execute(command: RegistrationConfirmationCommand): Promise<void> {
    const user = await this.usersRepository.findByCodeOrError(command.code);
    const validation = user.canConfirmEmail(command.code);
    if (!validation.isValid) {
      throw new DomainException({
        code: DomainExceptionCode.BadRequest,
        extensions: [
          {
            field: 'code',
            message: 'Wrong code',
          },
        ],
      });
    }
    user.confirmEmail();
    await this.usersRepository.saveMongo(user);
  }
}
