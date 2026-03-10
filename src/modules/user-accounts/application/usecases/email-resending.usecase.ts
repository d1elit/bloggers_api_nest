import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import * as crypto from 'node:crypto';
import { DomainException } from '../../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../../core/exceptions/domain-exception-codes';
import { UsersRepository } from '../../infrastructure/users.repository';
import { emailExamples } from '../email-examples';
import { NodemailerService } from '../nodemailer.service';

export class EmailResendingCommand {
  constructor(public email: string) {}
}

@CommandHandler(EmailResendingCommand)
export class EmailResendingUseCase implements ICommandHandler<
  EmailResendingCommand,
  void
> {
  constructor(
    private usersRepository: UsersRepository,
    private nodemailerService: NodemailerService,
  ) {}

  async execute(command: EmailResendingCommand): Promise<void> {
    const user = await this.usersRepository.findByEmailOrError(command.email);

    if (user.isEmailConfirmed())
      throw new DomainException({
        code: DomainExceptionCode.BadRequest,
        extensions: [
          {
            field: 'email',
            message: 'Email already confirmed',
          },
        ],
      });

    const confirmationCode = crypto.randomUUID();

    user.updateEmailConfirmationCode(confirmationCode);
    await this.usersRepository.save(user);

    this.nodemailerService
      .sendEmail(
        command.email,
        emailExamples.registrationEmail(confirmationCode),
      )
      .catch((error) => {
        console.log('Email sending failed', error);
      });

    // await this.nodemailerService.sendEmail(
    //   command.email,
    //   emailExamples.registrationEmail(confirmationCode),
    // );
  }
}
