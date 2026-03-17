import { DomainException } from '../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../core/exceptions/domain-exception-codes';
import { User } from '../domain/user.entity';
import { UsersMapper } from './users-mapper';
import { DataSource } from 'typeorm';
import { Injectable } from '@nestjs/common';

@Injectable()
export class UsersExternalRepository {
  constructor(private dataSource: DataSource) {}

  async findById(id: string): Promise<any | null> {
    console.log('IM IN EXTERNAL USER FIND', [id]);
    const raw = await this.dataSource.query(
      `SELECT * FROM users
                WHERE id = $1 and "deleted_at" IS NULL `,
      [id],
    );
    console.log(raw);
    return raw;
  }

  async findOrNotFoundFail(id: string): Promise<User> {
    const raw = await this.findById(id);
    console.log('User IN FIND to delete');

    if (!raw.length) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        extensions: [
          {
            field: 'user',
            message: 'User not found',
          },
        ],
      });
    }

    return UsersMapper.toDomain(raw[0]);
  }
}
