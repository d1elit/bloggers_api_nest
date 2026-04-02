import { Injectable } from '@nestjs/common';
import { DomainException } from '../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../core/exceptions/domain-exception-codes';
import { DataSource, Repository } from 'typeorm';
import { User } from '../domain/user.entity';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class UsersRepository {
  constructor(
    private dataSource: DataSource,
    @InjectRepository(User)
    private userRepo: Repository<User>,
  ) {}

  async findById(id: string): Promise<any | null> {
    return await this.userRepo.findOneBy({ id });
  }

  async save(user: User) {
    return this.userRepo.save(user);
  }

  async findOrNotFoundFail(id: string): Promise<User> {
    const user = await this.findById(id);

    if (!user) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        extensions: [
          {
            field: 'user',
            message: 'UserEntity not found',
          },
        ],
      });
    }

    return user;
  }

  async findByEmailOrError(email: string): Promise<User> {
    const user = await this.userRepo.findOneBy({ email });
    if (!user)
      throw new DomainException({
        code: DomainExceptionCode.BadRequest,
        extensions: [
          {
            field: 'email',
            message: 'Wrong email',
          },
        ],
      });
    return user;
  }

  async findByLoginOrEmail(loginOrEmail: string): Promise<User | null> {
    const user = await this.userRepo.findOneBy([
      { login: loginOrEmail },
      { email: loginOrEmail },
    ]);
    if (!user)
      throw new DomainException({
        code: DomainExceptionCode.Unauthorized,
        extensions: [
          {
            field: 'login',
            message: 'Wrong login',
          },
        ],
      });
    return user;
  }

  async findFieldWithValue(
    fieldName: string,
    fieldValue: string,
  ): Promise<User | null> {
    const allowedFields = ['login', 'email', 'id'];
    if (!allowedFields.includes(fieldName)) {
      throw new DomainException({
        code: DomainExceptionCode.BadRequest,
        extensions: [{ field: fieldName, message: 'Invalid field name' }],
      });
    }

    // 2. Используем QueryBuilder
    const user = await this.userRepo
      .createQueryBuilder('u')
      .where(`u.${fieldName} = :value`, { value: fieldValue })
      .andWhere('u.deletedAt IS NULL')
      .getOne();

    return user; // Вернет объект сущности или null
  }

  async findByCodeOrError(code: string): Promise<User> {
    console.log('findByCode: ', code);
    const user = await this.userRepo.findOneBy({
      confirmationEmail: {
        emailConfirmationCode: code,
      },
    });

    if (!user) {
      throw new DomainException({
        code: DomainExceptionCode.BadRequest,
        extensions: [
          {
            field: 'code',
            message: 'Code not exist',
          },
        ],
      });
    }
    return user;
  }
  async findByRecoveryCodeOrError(code: string): Promise<User> {
    const user = await this.userRepo.findOneBy({
      passwordRecovery: {
        recoveryCode: code,
      },
    });
    if (!user) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        extensions: [
          {
            field: 'user',
            message: 'UserEntity not found',
          },
        ],
      });
    }

    return user;
  }
}
