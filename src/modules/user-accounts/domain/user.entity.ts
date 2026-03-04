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
    public confirmationEmail: {
      confirmationCode: string;
      isConfirmed: boolean;
      expirationDate: Date;
    },
    public passwordRecovery: {
      confirmationCode: string | null;
      isUsed: boolean;
      expirationDate: Date | null;
    },
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
      {
        confirmationCode: randomUUID(),
        isConfirmed: false,
        expirationDate: add(new Date(), { hours: 1, minutes: 3 }),
      },
      {
        confirmationCode: randomUUID(),
        isUsed: false,
        expirationDate: add(new Date(), { hours: 1 }),
      },
    );
  }
  makeDeleted(): void {
    if (this.deletedAt !== null) {
      throw new Error('Entity already deleted');
    }
    this.deletedAt = new Date();
  }

  // ============= Email Confirmation Methods =============

  confirmEmail(): void {
    this.confirmationEmail.isConfirmed = true;
  }

  isEmailConfirmed(): boolean {
    return this.confirmationEmail.isConfirmed;
  }

  isEmailConfirmationExpired(): boolean {
    return new Date() > new Date(this.confirmationEmail.expirationDate);
  }

  updateEmailConfirmationCode(newCode: string): void {
    this.confirmationEmail.confirmationCode = newCode;
    this.confirmationEmail.expirationDate = add(new Date(), {
      hours: 1,
      minutes: 3,
    });
  }

  canConfirmEmail(code: string): { isValid: boolean; error?: string } {
    if (this.isEmailConfirmed()) {
      return { isValid: false, error: 'Email already confirmed' };
    }
    if (code !== this.confirmationEmail.confirmationCode) {
      return { isValid: false, error: 'Wrong confirmation code' };
    }
    if (this.isEmailConfirmationExpired()) {
      return { isValid: false, error: 'Confirmation code expired' };
    }
    return { isValid: true };
  }

  // ============= Password Recovery Methods =============

  updatePasswordRecoveryCode(newCode: string): void {
    if (!this.passwordRecovery) {
      // this.passwordRecovery = {};
    }
    this.passwordRecovery.confirmationCode = newCode;
    this.passwordRecovery.isUsed = false;
    this.passwordRecovery.expirationDate = add(new Date(), {
      hours: 1,
    });
  }

  isPasswordRecoveryExpired(): boolean {
    if (!this.passwordRecovery?.expirationDate) return true;
    return new Date() > new Date(this.passwordRecovery.expirationDate);
  }

  canRecoverPassword(code: string): { isValid: boolean; error?: string } {
    if (!this.passwordRecovery) {
      return { isValid: false, error: 'Recovery not initiated' };
    }
    if (this.passwordRecovery.isUsed) {
      return { isValid: false, error: 'Recovery code already used' };
    }
    if (code !== this.passwordRecovery.confirmationCode) {
      return { isValid: false, error: 'Wrong recovery code' };
    }
    if (this.isPasswordRecoveryExpired()) {
      return { isValid: false, error: 'Recovery code expired' };
    }
    return { isValid: true };
  }

  updatePassword(hashedPassword: string): void {
    this.passwordHash = hashedPassword;
    if (this.passwordRecovery) {
      this.passwordRecovery.isUsed = true;
    }
  }
}
export type UserDocument = User;
export type UserModelType = never;
