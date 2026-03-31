import { UserDomain } from '../../../domain/user.entity-domain';

export class UserExternalDto {
  id: string;
  login: string;
  email: string;
  createdAt: Date;

  static mapToView(user: UserDomain): UserExternalDto {
    const dto = new UserExternalDto();

    dto.email = user.email;
    dto.login = user.login;
    dto.id = user.id.toString();
    dto.createdAt = user.createdAt;
    return dto;
  }
}
