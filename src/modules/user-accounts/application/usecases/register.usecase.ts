import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectModel } from '@nestjs/mongoose';
import * as crypto from 'node:crypto';
import { CreateUserInputDto } from '../../api/input-dto/users/users.input-dto';
import {
  UserMongo,
  type UserMongoModelType,
} from '../../domain/user-mongo.entity';
import { UsersRepository } from '../../infrastructure/users.repository';
import { CryptoService } from '../crypto.service';
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
    private usersRepository: UsersRepository,
    private cryptoService: CryptoService,
    private userService: UsersService,
    @InjectModel(UserMongo.name) private UserModel: UserMongoModelType,
  ) {}

  async execute(command: RegisterCommand): Promise<void> {
    const { userDto } = command;
    const confirmationCode = crypto.randomUUID();

    await this.userService.createUser(userDto, confirmationCode);

    // Send email
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
