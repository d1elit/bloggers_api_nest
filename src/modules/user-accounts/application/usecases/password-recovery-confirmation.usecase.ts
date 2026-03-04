import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { DomainException } from '../../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../../core/exceptions/domain-exception-codes';
import { UsersRepository } from '../../infrastructure/users.repository';
import { CryptoService } from '../crypto.service';

export class PasswordRecoveryConfirmationCommand {
  constructor(
    public code: string,
    public password: string,
  ) {}
}

@CommandHandler(PasswordRecoveryConfirmationCommand)
export class PasswordRecoveryConfirmationUseCase implements ICommandHandler<
  PasswordRecoveryConfirmationCommand,
  void
> {
  constructor(
    private usersRepository: UsersRepository,
    private cryptoService: CryptoService,
  ) {}

  async execute(command: PasswordRecoveryConfirmationCommand): Promise<void> {
    const user = await this.usersRepository.findByRecoveryCodeOrError(
      command.code,
    );
    const validation = user.canRecoverPassword(command.code);
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
    const newPassword = await this.cryptoService.createPasswordHash(
      command.password,
    );
    user.updatePassword(newPassword);
    await this.usersRepository.saveMongo(user);
  }
}
