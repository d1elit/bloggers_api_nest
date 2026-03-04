import {
  UserMongo,
  type UserMongoModelType,
} from '../../domain/user-mongo.entity';
import { InjectModel } from '@nestjs/mongoose';
import { Injectable, NotFoundException } from '@nestjs/common';
import { UserExternalDto } from './external-dto/users.external-dto';

@Injectable()
export class UsersExternalQueryRepository {
  constructor(
    @InjectModel(UserMongo.name)
    private UserModel: UserMongoModelType,
  ) {}

  async getByIdOrNotFoundFail(id: string): Promise<UserExternalDto> {
    const user = await this.UserModel.findOne({
      _id: id,
      deletedAt: null,
    });

    if (!user) {
      throw new NotFoundException('user not found');
    }

    return UserExternalDto.mapToView(user);
  }
}
