import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User, type UserModelType } from '../domain/user.entity';
import { CreateUserDto } from '../dto/create-user.dto';
import { UsersRepository } from '../infrastructure/users.repository';
import { CryptoService } from './crypto.service';
import { DomainException } from '../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../core/exceptions/domain-exception-codes';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name)
    private UserModel: UserModelType,
    private usersRepository: UsersRepository,
    private cryptoService: CryptoService,
  ) {}

  async createUser(
    dto: CreateUserDto,
    confirmationCode?: string,
  ): Promise<string> {
    await this.ensureIsUserUnique(dto.login, dto.email);

    const passwordHash = await this.cryptoService.createPasswordHash(
      dto.password,
    );

    const user = this.UserModel.createInstance({
      email: dto.email,
      login: dto.login,
      passwordHash: passwordHash,
      confirmationCode,
    });

    await this.usersRepository.save(user);

    return user.id.toString();
  }

  async ensureIsUserUnique(login: string, email: string) {
    let resLogin = await this.usersRepository.findFieldWithValue(
      'login',
      login,
    );
    let resEmail = await this.usersRepository.findFieldWithValue(
      'email',
      email,
    );
    if (resEmail) {
      throw new DomainException({
        code: DomainExceptionCode.BadRequest,
        message: 'LoginInput or email already exist',
      });
    }
    if (resLogin) {
      throw new DomainException({
        code: DomainExceptionCode.BadRequest,
        message: 'LoginInput or email already exist',
      });
    }
  }

  async deleteUser(id: string) {
    const user = await this.usersRepository.findOrNotFoundFail(id);

    user.makeDeleted();

    await this.usersRepository.save(user);
  }
}
