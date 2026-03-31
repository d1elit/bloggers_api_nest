import { UserDomain } from '../../domain/user.entity-domain';
import { UsersMapper } from '../../infrastructure/users-mapper';

export class UserViewDto {
  id: string;
  login: string;
  email: string;
  createdAt: Date;

  static mapToView(user: UserDomain): UserViewDto {
    const dto = new UserViewDto();
    const mappedUser = UsersMapper.toDomain(user);
    dto.login = mappedUser.login;
    dto.id = mappedUser.id;
    dto.email = mappedUser.email;
    dto.createdAt = mappedUser.createdAt;

    return dto;
  }
}
