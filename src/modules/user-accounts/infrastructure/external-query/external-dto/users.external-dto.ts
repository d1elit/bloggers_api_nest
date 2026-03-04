import { UserMongoDocument } from '../../../domain/user-mongo.entity';

export class UserExternalDto {
  id: string;
  login: string;
  email: string;
  createdAt: Date;

  static mapToView(user: UserMongoDocument): UserExternalDto {
    const dto = new UserExternalDto();

    dto.email = user.email;
    dto.login = user.login;
    dto.id = user._id.toString();
    dto.createdAt = user.createdAt;
    return dto;
  }
}
