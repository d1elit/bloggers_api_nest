import { CreateUserDto } from '../../dto/create-user.dto';
import { UsersRepository } from '../../infrastructure/users.repository';
import { CryptoService } from '../crypto.service';
import { DomainException } from '../../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../../core/exceptions/domain-exception-codes';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { User } from '../../domain/user.entity';

export class CreateUserCommand {
  constructor(
    public dto: CreateUserDto,
    public confirmationCode?: string,
  ) {}
}

@CommandHandler(CreateUserCommand)
export class CreateUserUseCase implements ICommandHandler<
  CreateUserCommand,
  string
> {
  constructor(
    private usersRepository: UsersRepository,
    private cryptoService: CryptoService,
  ) {}

  async execute({ dto, confirmationCode }: CreateUserCommand): Promise<string> {
    await this.ensureIsUserUnique(dto.login, dto.email);
    console.log(dto);
    const passwordHash = await this.cryptoService.createPasswordHash(
      dto.password,
    );

    const user = User.createInstance({
      email: dto.email,
      login: dto.login,
      passwordHash: passwordHash,
      confirmationCode,
    });

    await this.usersRepository.save(user);

    return user.id.toString();
  }

  async ensureIsUserUnique(login: string, email: string) {
    const resLogin = await this.usersRepository.findFieldWithValue(
      'login',
      login,
    );
    const resEmail = await this.usersRepository.findFieldWithValue(
      'email',
      email,
    );
    console.log(`res email:`, resEmail);
    if (resEmail) {
      throw new DomainException({
        code: DomainExceptionCode.BadRequest,
        message: 'LoginInput or email already exist',
        extensions: [
          {
            field: 'email',
            message: 'Email already exists',
          },
        ],
      });
    }
    if (resLogin) {
      throw new DomainException({
        code: DomainExceptionCode.BadRequest,
        message: 'LoginInput or email already exist',
        extensions: [
          {
            field: 'login',
            message: 'Login already exists',
          },
        ],
      });
    }
  }
}
