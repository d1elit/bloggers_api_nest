import { User } from '../../domain/user.entity';
import { UsersMapper } from '../../infrastructure/users-mapper';

export class UserViewDto {
  id: string;
  login: string;
  email: string;
  createdAt: Date;

  static mapToView(user: User): UserViewDto {
    const dto = new UserViewDto();
    const mappedUser = UsersMapper.toDomain(user);
    dto.login = mappedUser.login;
    dto.id = mappedUser.id;
    dto.email = mappedUser.email;
    dto.createdAt = mappedUser.createdAt;

    return dto;
  }
}
