import { InjectModel } from '@nestjs/mongoose';
import {
  UserMongo,
  UserMongoDocument,
  type UserMongoModelType,
} from '../domain/user-mongo.entity';
import { DomainException } from '../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../core/exceptions/domain-exception-codes';
import { User } from '../domain/user.entity';
import { UsersMapper } from './users-mapper';
import { DataSource } from 'typeorm';

export class UsersExternalRepository {
  constructor(
    @InjectModel(UserMongo.name) private UserModel: UserMongoModelType,
    private dataSource: DataSource,
  ) {}

  async findById(id: string): Promise<any | null> {
    console.log('IM IN FIND', [id]);
    const raw = await this.dataSource.query(
      `SELECT * FROM users
                WHERE id = $1 and "deleted_at" IS NULL `,
      [id],
    );
    return raw;
  }

  async save(user: UserMongoDocument) {
    await user.save();
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
