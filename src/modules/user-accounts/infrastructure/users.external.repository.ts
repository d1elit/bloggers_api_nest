import { InjectModel } from '@nestjs/mongoose';
import {
  UserMongo,
  UserMongoDocument,
  type UserMongoModelType,
} from '../domain/user-mongo.entity';
import { DomainException } from '../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../core/exceptions/domain-exception-codes';

export class UsersExternalRepository {
  constructor(
    @InjectModel(UserMongo.name) private UserModel: UserMongoModelType,
  ) {}

  async findById(id: string): Promise<UserMongoDocument | null> {
    return this.UserModel.findOne({
      _id: id,
      deletedAt: null,
    });
  }

  async save(user: UserMongoDocument) {
    await user.save();
  }

  async findOrNotFoundFail(id: string): Promise<UserMongoDocument> {
    const user = await this.findById(id);

    if (!user) {
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

    return user;
  }
}
