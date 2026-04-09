import { User } from '../../domain/user.entity';

export class UserViewDto {
  id: string;
  login: string;
  email: string;
  createdAt: Date;

  static mapToView(user: User): UserViewDto {
    const dto = new UserViewDto();
    dto.login = user.login;
    dto.id = user.id;
    dto.email = user.email;
    dto.createdAt = user.createdAt;

    return dto;
  }
}
