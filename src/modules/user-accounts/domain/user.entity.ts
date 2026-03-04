import { CreateUserDomainDto } from './dto/create-user.domain.dto';
import { add } from 'date-fns';
import { randomUUID } from 'crypto';

export class User {
  constructor(
    public id: string,
    public login: string,
    public email: string,
    public passwordHash: string,
    public createdAt: Date,
    public updatedAt: Date,
    public deletedAt: Date | null,
    public emailConfirmationCode: string,
    public emailIsConfirmed: boolean,
    public emailConfirmationExpiration: Date,
    public recoveryCode: string | null,
    public recoveryIsUsed: boolean,
    public recoveryExpiration: Date | null,
  ) {}
  static create(dto: CreateUserDomainDto): User {
    return new User(
      randomUUID(),
      dto.login,
      dto.email,
      dto.passwordHash,
      new Date(),
      new Date(),
      null,
      randomUUID(),
      false,
      add(new Date(), { hours: 1, minutes: 3 }),
      randomUUID(),
      false,
      add(new Date(), { hours: 1 }),
    );
  }

  confirmEmail() {
    this.emailIsConfirmed = true;
  }

  isEmailConfirmed(): boolean {
    return this.emailIsConfirmed;
  }

  isEmailConfirmationExpired(): boolean {
    return new Date() > new Date(this.emailConfirmationExpiration);
  }

  canConfirmEmail(code: string): { isValid: boolean; error?: string } {
    if (this.isEmailConfirmed()) {
      return { isValid: false, error: 'Email already confirmed' };
    }
    if (code !== this.emailConfirmationCode) {
      return { isValid: false, error: 'Wrong confirmation code' };
    }
    if (this.isEmailConfirmationExpired()) {
      return { isValid: false, error: 'Confirmation code expired' };
    }
    return { isValid: true };
  }

  makeDeleted() {
    if (this.deletedAt) {
      throw new Error('Already deleted');
    }
    this.deletedAt = new Date();
  }

  updatePassword(hashedPassword: string) {
    this.passwordHash = hashedPassword;
    this.recoveryIsUsed = true;
  }
}
export type UserDocument = User;
export type UserModelType = never;
