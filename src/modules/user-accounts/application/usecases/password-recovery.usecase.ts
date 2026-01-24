import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import * as crypto from 'node:crypto';
import { UsersRepository } from '../../infrastructure/users.repository';
import { emailExamples } from '../email-examples';
import { NodemailerService } from '../nodemailer.service';

export class PasswordRecoveryCommand {
  constructor(public email: string) {}
}

@CommandHandler(PasswordRecoveryCommand)
export class PasswordRecoveryUseCase
  implements ICommandHandler<PasswordRecoveryCommand, void>
{
  constructor(
    private usersRepository: UsersRepository,
    private nodemailerService: NodemailerService,
  ) {}

  async execute(command: PasswordRecoveryCommand): Promise<void> {
    const user = await this.usersRepository.findByEmail(command.email);
    if (!user) return;

    const recoveryCode = crypto.randomUUID();
    user.updatePasswordRecoveryCode(recoveryCode);
    await this.usersRepository.save(user);

    this.nodemailerService
      .sendEmail(command.email, emailExamples.passwordRecoveryEmail(recoveryCode))
      .catch((error) => {
        console.log('Email sending failed', error);
      });
  }
}
