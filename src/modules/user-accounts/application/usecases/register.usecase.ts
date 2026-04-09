import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import * as crypto from 'node:crypto';
import { CreateUserInputDto } from '../../api/input-dto/users/users.input-dto';
import { emailExamples } from '../email-examples';
import { NodemailerService } from '../nodemailer.service';
import { UsersService } from '../users.service';

export class RegisterCommand {
  constructor(public userDto: CreateUserInputDto) {}
}
@CommandHandler(RegisterCommand)
export class RegisterUseCase implements ICommandHandler<RegisterCommand, void> {
  constructor(
    private nodemailerService: NodemailerService,
    private userService: UsersService,
  ) {}

  async execute(command: RegisterCommand): Promise<void> {
    const { userDto } = command;
    const confirmationCode = crypto.randomUUID();

    await this.userService.createUser(userDto, confirmationCode);

    this.nodemailerService
      .sendEmail(
        userDto.email,
        emailExamples.registrationEmail(confirmationCode),
      )
      .catch((error) => {
        console.log('Email sending failed', error);
      });
  }
}
