import { DomainException } from '../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../core/exceptions/domain-exception-codes';
import { Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../domain/user.entity';

@Injectable()
export class UsersExternalRepository {
  constructor(
    @InjectRepository(User)
    private userRepo: Repository<User>,
  ) {}

  async findById(id: string): Promise<any | null> {
    return await this.userRepo.findOne({
      where: { id },
      select: ['id', 'login', 'email', 'createdAt'], // Выберет только эти колонки
    });
  }

  async findOrNotFoundFail(id: string): Promise<User> {
    const user = await this.findById(id);
    console.log('UserEntity IN FIND to delete');

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
